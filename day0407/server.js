/*
Node.js의 기본 모듈만으로는 서버를 구축 할 수는 있으나 개발자가 처리해야할 업무가 너무 많고 
효율성이 떨어진다. 따라서 기본 모듈 외에,http 모듈을 좀 더 개선한 express 모듈을 사용해보자!!
주의)http 기본 모듈이 사용되지 않는 것이 아니라, 이 기본 모듈에 express모듈을 추가한다

[express모듈 특징]
1) 정적 자원에 대한 처리가 이미 지원된다... 즉 개발자가 각 자원마다 1:1대응하는 코드를 작성할 필요가 없다
    html,css,image,sound,mp4,js등등
2) get/post등의 http요청에 대한 파라미터 처리가 쉽다
3) 미들웨어라 불리는 use()메서드를 통해 기능을 확장한다!!
*/ 
var http=require("http");
var express = require("express");
var static = require("serve-static"); // 정적 자원을 쉽게 접근하기 위한 미들웨어 추가
var fs = require("fs");
var ejs = require("ejs"); 
var mysql = require("mysql");
var mymodule=require("./lib/mymodule.js");

//express모듈을 통해 객체 생성
var app = express();

// mysql 접속 정보
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};

// 서버의 정적자원에 접근을 위해 static()미들웨어를 사용해본다!!  <--> dynamic(동적)
// __dirname전역변수는? 현재 실행중인 js파일의 디렉토리 위치를 반환
// 즉 현재 실행중인 server.js의 디렉토리를 반환
// console.log("이미지 정적 자원이 들어있는 풀 경로는 :",__dirname+"/images");

app.use(static(__dirname+"/static")); //static을 정적자원이 있는 루트로 지정
app.use(express.urlencoded({
    extended:true
})); //app.post에서 사용할 것 / post방식의 데이터를 처리하기 위함

/*--------------------------------------------
클라이언트의 요청 처리!! (요청 url에 대한 조건문 X, 정적 자원에 대한 처리 필요 X)
CRUD - Create(Insert), Read(select), Update, Delete
----------------------------------------------*/
app.get("/notice/list",function(request, response){
    var con = mysql.createConnection(conStr); // 접속 시도 후 connectioni 객체 반환
    
    // select 문 수행하기
    con.query("select *from notice order by notice_id desc",function(error,result,fields){
        if(error){
            console.log(error); //에러 분석을 위해서 로그 남기기
        }else{
            fs.readFile("./notice/list.ejs","utf8",function(err,data){
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                //읽기만 하는게 아니라 서버에서 실행을 해야하므로 render 메서드를 이용하여 %영역을 
                // 클라이언트에게 보내기 전에 서버측에서 먼저 실행을 해버리자!1
        
                response.end(ejs.render(data,{
                    noticeList:result,
                    lib:mymodule
                }));
            });
        }
        con.end();//mysql접속 끊기
    });
});

// 지정한 url의 post방식으로 클라이언트의 요청을 받는다 
app.post("/notice/regist",function(request,response){
    // 1) 클라이언트가 전송한 파라미터들을 받자!!
    // console.log(request.body);//post방식이니까 body
    var title = request.body.title;
    var writer = request.body.writer;
    var content = request.body.content;

    // 2) mysql접속 후 connection객체 반환
    var con = mysql.createConnection(conStr);

    // 3) 쿼리문 실행
    // var sql = "insert into notice(title,writer,content)";
    // sql += "values('"+title+"','"+writer+"','"+content+"')";

    // 바인드 변수를 이용하면, 따옴표 문제를 고민하지 않아도 된다. 
    // 단, 주의!!) 바인드 변수의 사용목적은 따옴표 때문이 아니라 DB의 성능과 관련이 있다.(java..)
    var sql = "insert into notice(title,writer,content) values(?,?,?)";
    con.query(sql,[title,writer,content],function(err,fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end("<script>alert('등록성공');location.href='/notice/list';</script>");
        }
        con.end();
    });

});

// 목록 요청 처리 상세보기
app.get("/notice/detail",function(request,response){
    // get방식으로 헤더를 통해 전송되어온 파라미터를 확인해보자!!
    // console.log(request.query);
    var notice_id=request.query.notice_id;
   

    // var sql = "select *from notice where notice_id="+notice_id;
    var  sql = "select *from notice where notice_id=?"
    var con = mysql.createConnection(conStr); //접속
    con.query(sql,[notice_id],function(err,result,fields){
        if(err){
            console.log(err); //배열이 출력됨, 한건이라서 json이 아님
        }else{
            // 디자인 보여주기전에 조회수 증가시키기
            con.query("update notice set hit=hit+1 where notice_id =?",[notice_id],function(error1,fields){
                if(error1){
                    console.log(error1);
                }else{
                    fs.readFile("./notice/detail.ejs","utf8",function(error,data){
                        if(error){
                            console.log(error);
                        }else{
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(ejs.render(data,{ //json으로 데이터를 전달할 것이다
                                // result는 한건이어도 배열이므로 배열에서꺼내서 보내주자
                                record:result[0]
                        
                            }));
                        }
                    });
                }
                con.end();
            });
        }      
    });
});

// 글 수정 요청 처리
app.post("/notice/edit",function(request,response){
    // 파라미터 받기!!
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var notice_id=request.body.notice_id;

    console.log("제목",title);
    console.log("작성자",writer);
    console.log("내용",content);
    console.log("notice_id",notice_id); //hidden해서 개수는 맞추고 안보이게 설정
    // 파라미터가 총 4개 필요!!
    var sql = "update notice set title=?,writer=?,content=? where notice_id=?";
    var con = mysql.createConnection(conStr);//접속!!
    con.query(sql,[title,writer,content,notice_id],function(error,fields){
        if(error){
            console.log(error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("수정성공","/notice/detail?notice_id="+notice_id));
        }
        con.end();//mysql연결 종료
    });
});

// 삭제 요청 처리
// 겟이나 포스트나 상관이 없어 
app.post("/notice/del",function(request,response){
    var notice_id=request.body.notice_id;
    var sql = "delete from notice where notice_id=?";
    var con = mysql.createConnection(conStr); //접속

    con.query(sql,[notice_id],function(error,fields){
        if(error){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("삭제완료","/notice/list"));
        }
        con.end();
    });
});


var server = http.createServer(app); //http서버에 express모듈을 적용

server.listen(8989,function(){
    console.log("The server using Express module is running at 8989");
});
