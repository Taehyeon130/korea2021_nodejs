var http = require("http");
var express = require("express"); //설치
var fs = require("fs");
var ejs = require("ejs");//설치
var oracledb = require("oracledb"); //설치
// var bodyParser = require("body-parser"); 밑에 urlencoded랑 기능이 비슷해 
//▲ json형식으로 파라미터를 전달해줌
var static = require("serve-static"); //정적자원을 처리하기 위한 모듈 이게 있어야 html파일 읽어옴 설치
var mymodule = require("./lib/mymodule.js");
var app = express();

// 커밋을 디폴트로 설정
oracledb.autoCommit=true;//쿼리문  실행시마다 트랜잭션을 commit으로 처리
// 디폴트 값이 false이다 매 순간마다 commit을 해주어야하기 때문에 아예처음에 true로 처리함

oracledb.fetchAsString=[oracledb.CLOB]; //clob데이터를 string으로 

// 미들웨어 등록
app.use(static(__dirname+"/static")); //정적자원의 루트 디렉토리 등록!!
app.use(express.urlencoded({extended:true})); //post방식의 데이터를 처리할 수 있음 express모듈이 처리하는 것

// 뷰엔진 등록
app.set("view engine","ejs"); //따로 설정안해도 ejs인줄 알도록(서버스크립트 선택)
// 일단 뷰엔진이 등록되고 나면 확장자를 명시할 필요가 없다
// why? views라는 정해진 디렉토리를 참조할 것이고 그 안에 있는 모든 파일은 다 ejs일 것이기 때문에...

const conStr={  //const : 변수의 값을 고정시킨다.(상수화 시킴)
    user:"node",
    password:"node",
    connectString:"localhost/XE"
};

// 게시판 목록 요청 처리
app.get("/news/list",function(request,response){
    // 클라이언트가 전송한 파라미터 받기
    var currentPage = request.query.currentPage; //클라이언트가 보기를 원하는 페이지 수
    //게시판의 최초 접속이라면, currentPage정보가 없기 때문에 1페이지로 간주함
    if(currentPage==undefined){
        currentPage=1;
    }
    // console.log("currentPage : ",currentPage);

    // oracle연동
    oracledb.getConnection(conStr,function(err,con){ //오라클 접속 및 접속 객체 가져오기
        if(err){
            console.log(err);
        }else{
            // 쿼리문 실행
            var sql = "select *from news order by news_id desc";
            con.execute(sql,function(err,result){ //오라클에서는 execute사용 execute는 인수가 2개
                if(err){
                    console.log(err);
                }else{
                    // console.log("result : ",result);
                    fs.readFile("./views/news/list.ejs","utf8",function(err,data){
                        if(err){
                            console.log(err);
                        }else{
                            var r = ejs.render(data,{ //ejs 해석 및 실행하기
                                // ejs에 넘겨줄 데이터 지정
                                param:{
                                    page:currentPage,
                                    /*result는 mysql과는 틀리게 json객체의 rows 속성에 
                                    2차원 배열로 들어있음*/ 
                                    record:result.rows,
                                    lib:mymodule /*ejs가 사용할 수있도록 lib명으로 전송*/
                                }
                            }); 
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(r); //실행한 결과 전송하기!!
                        }
                    });
                }
                con.close();
            });
        }
    });
});

// 글 등록하기
app.post("/news/regist",function(request,response){
    // console.log(request.body.title);   //값이 나오지 않아 title이 undefinde라고 나옴  그래서 위헤서urlencoded를 사용함
    
    // 파라미터 받기(post)
    var title = request.body.title;
    var writer = request.body.writer;
    var content = request.body.content;


    // 오라클에 넣기
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log(err);
        }else{
            var sql = "insert into news(news_id, title, writer, content)";
            sql += " values(seq_news.nextval,:1,:2,:3)"; //mysql 이랑 다름 

            con.execute(sql,[title,writer,content],function(error,result){
                if(error){
                    console.log("등록 중 에러 발생",error);
                }else{
                    // 여기서도 무조건 등록된다는 보장은 없다. 즉 오라클에 반영되었는냐 여부는 result를 통해 또 알아봐야함
                    console.log("result : ",result); //결과가 나오면 되는것 //rowsAffected의값은 몇개가 반영되었나 항상 1개(0이라면 등록되지 않은것)
                    if(result.rowsAffected==0){ //실패
                        // status 코드란 ? http통신 서버의 상태를 나타내는 기준값 코드
                        response.writeHead(500,{"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록 실패","/news/list"));
                    }else{ //성공
                        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록 성공","/news/list"));
                    }
                }
                con.close(); //oracle접속해제
            });
        }
    });
});


// 글 상세보기
app.get("/news/detail",function(request,response){
    // express모듈이  response객체의 기능을 업그레이드 함!!
    // 원래 ejs.render()+fs.readFile() 두개를 합친 개념
    // response의 render 메서드는 기본적으로 views라는 정해진 디렉토리안에 
    // 정해진 뷰 엔진을 찾게된다(뷰 엔진은 개발자가 선택할 수 있다.)

    var news_id=request.query.news_id; //get방식으로 전송된 파라미터 받기!!
    // 오라클 연동하기
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log(err);
        }else{
            var sql="select *from news where news_id="+news_id;
            con.execute(sql,function(error,result){
                if(error){//에러 검출
                    console.log("sql 실행 중 에러 발생",error);
                }else{
                    console.log("하나의 데이터 가져오기 :",result);

                    // 댓글 목록도 가져와야함
                    sql="select * from comments order by comments_id asc";
                    con.execute(sql,function(e, record){
                        if(e){
                            console.log("댓글 가져오기 에러",e);
                        }else{
                            response.render("news/detail",{
                                news:result.rows[0], //뉴스 목록
                                commentsList:record.rows, //댓글 목록
                                lib:mymodule
                            });  //view를 찾을수 없다는 오류가 나온다. ejs는 views안에 들어가 있어야함
                        }
                        con.close();
                    });
                }
            });
        }
    });
});

// 코멘트 댓글 등록요청 처리
app.post("/comments/regist",function(request,response){
    // 파라미터 받기
    var news_id = request.body.news_id;
    var msg = request.body.msg;
    var author = request.body.author;

    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log(err);
        }else{
            var sql = "insert into comments(comments_id,news_id, msg, author)";
            sql+=" values(seq_comments.nextval,:1,:2,:3)";
            con.execute(sql,[news_id,msg,author],function(error,result){
                if(error){
                    console.log("insert 쿼리 실행 중 에러 발생");
                    // // server's internal fatal error!! - 500
                    // response.writeHead(500,{"Content-Type":"text/html;charset=utf-8"});
                    // response.end("에러발생");
                }else{
                    // 클라이언트가 댓글 목록 요청을 비동기 방식으로 요청했기때문에 클라이언트의 브라우저는 화면이 유지되어야한다.
                    // 서버는 클라이언트가 보게될  디자인 코드를 보낼 이유가 없다
                    // 보내는 순간 화면이 바뀌어버리므로 이것은 클라이언트가 원하는 것이 아니다
                    // 디자인 일부에 사용할 데이터만 보내면 된다!1

                    response.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
                    // 네트워크 상으로 주고 받는 데이터는 문자열화 시켜서 주고 받는다!!
                    var str="";
                    str += "{";
                    str += "\"result\":\"안녕\"";
                    str+="}";
                    response.end(str); //end()메소드는 문자열을 인수로 받는다!!
                    // response.end(mymodule.getMsgUrl("댓글 등록","/news/detail?news_id="+news_id));
                }
                con.close();
            });
        }
    });
});

var server = http.createServer(app);
server.listen(8888,function(){
    console.log("Server is running at 8888 Port");
});







