var http = require("http"); //내장 모듈 가져오기
var fs = require("fs"); //파일 시스템 모듈

var qs=require("querystring"); //(쪼개져서)직렬화된전송된 데이터에 대한 해석을 담당(문자열로 해석가능함)
var url = require("url"); //url분석과 관련된 내부모듈

var mysql = require("mysql"); //mysql모듈 가져오기(외부모듈이므로 별도 설치 필요함) npm install mysql
var ejs = require("ejs");//중요해 html의 body안에서 프로그래밍 구현가능(외부모듈)

// 우리가 사용할 db접속 정보
var conStr={ //db연결문자열
    // 정해져있어 아래의 것들은 항상 써야해
    url:"locallhost:3306",
    database:"nodejs",
    user:"root",
    password:"1234"
}

var server = http.createServer(function(request,response){
    // 결국 서버는 클라이언트의 다양한 요청을 처리하기 위해, 요청을 구분할 수 있어야한다
    // 클라이언트가 서버에게 무엇을 원하는지에 대한 정보는 요청 url.로 구분할 수있다
    // 따라서 요청과 관련된 정보를 가진 객체인 request 객체를 이용하자!!
    console.log("클라이언트가 요청한 주소 :",request.url);

    // 도메인 뒤에 포트번호까지 : 루트
    /*
    회원가입 폼 요청 : /member/form
    회원가입 요청 : /member/join
    회원 목록(검색은 목록에 조건을 부여) 요청 : /member/list
    회원 정보 보기 요청 : /member/detail
    회원 정보 수정 요청 : /member/edit
    회원 정보 삭제 요청 : /member/del
    */

    // 혹여나 파라미터가  get방식으로 전송되어 올 경우엔 request.url의 파라미터까지도 주소로
    // 간주될수있기때문에 파라미터를 제거하자
    // console.log("url 파싱",url.parse(request.url));
    var requestUrl=url.parse(request.url).pathname;//파라미터를 제외한 주소

    switch(requestUrl){
        case "/member/form":registForm(request,response);break;
        case "/member/join":regist(request,response);break;
        case "/member/list":getList2(request,response);break;
        case "/member/detail":getDetail(request,response);break;
        case "/member/edit":edit(request,response);break;
        case "/member/del":del(request,response);break;

        case "/photo/img1":getImage(request,response);break;
    }
}); //서버객체 생성



// 결론 : 정적자원처리뿐만아니라, 개발의 편의성을 위해 좀 더 개선된 서버 모듈로 전환!!
function getImage(request,response){
    fs.readFile("./images/b.jpg",function(err,data){
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(data);
    });
}

function registForm(request,response){
    fs.readFile("./regist_form.html","utf8",function(err,data){
        // 파일을 다 읽어들이면 응답 정보 구성하여 클라이언트에게 전송
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(data);
    });
}

function regist(request ,response){
    // 클라이언트가 post방식으로 전송했기 때문에 http데이터 구성 중 body를 통해 전송되어진다
    // post방식의 파라미터를 끄집어 내보자!!
    // on이란 request객체가 보유한 데이터 감지 메서드(즉 데이터가 들어왔을때를 감지)
    var content="";
    request.on("data",function(param){ //param에는body안에 들어있는 데이터가 서버의 메모리 버퍼로 들어오고 
                                                        //그 데이터를 param이 담고 있다
        content+=param; //버퍼의 데이터를 모으자
    }); //post방식의 데이터를 감지
    
    // 데이터가 모두 전송되어 받아지면 end이벤트 발생
    request.on("end",function(){
        console.log("전송받은 데이터는 ",content);
        console.log("파싱한 결과는",qs.parse(content));

        var obj = qs.parse(content);//파싱한 결과는 객체지향 개발자들이 쉽게 해석이가능한 json으로 반환됨

        // 이 시점이 쿼리문을 수행할 시점임!!
        
            // 데이터베이스에 쿼리문을 전송하기 위해서는 먼저 접속이 선행되어야함
            //접속을 시도하는 메서드의 반환값으로 접속 정보 객체가 반환되는데 이 객체를 이용하여 쿼리를 실행할 수있음
            // 우리의 경우 con
            var con = mysql.createConnection(conStr); 

            var sql="insert into member(user_id,user_name,user_pass)";
            sql +=" values('"+obj.user_id+"','"+obj.user_name+"','"+obj.user_pass+"')";
            
            // 쿼리문을 실행하는 메서드명은 query()
            con.query(sql,function(err,fields){ //실행시점
        
                if(err){ //쿼리 수행중 심각한 에러 발생
                    response.writeHead(500,{"Content-Type":"text/html;charset=utf-8"}); //오류는 500대
                    response.end("서버측 오류 발생");
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end("회원가입 성공<br> <a href='/member/list'>회원목록 바로가기</a>");  
                    // 목록 요청 바로 진행
                    // response.redirect("/member/list"); //클라이언트의 브라우저로 하여금 지정한 url로 다시 요쳥할 것을 명령
                    
                }
                //db작업 성공여우와 상관없이 연결된 접속은 끊어야한다!!!\
                con.end();// 접속끊기~!!
            });
    });
}

// 기존의 getList()보다 더 개선된 방법으로 요청을 처리하기 위해, 함수를 별도로 정의함
function getList2(request,response){
    // 클라이언트에게 결과를 보여주기 전에 이미 DB연동을 해서 레코드를 가져와야한다!!
    var con = mysql.createConnection(conStr);//접속
    var sql="select *from member";

    con.query(sql,function(err,record,fields){//형식, SQL문, 결과 레코드, 필드정보
        // record 변수엔 json들이 일차원 배열에 탑재되어있다.
        // console.log(record);
        // 파일을 모두 읽으면 익명함수가 호출되고, 익명함수 안에 매개변수에 읽혀진 모든 데이터가 매개변수로 전달된다!!
        // query메서드가 완료되었을때 function이 실행됨

        fs.readFile("./list.ejs","utf8",function(err,data){ //쿼리문 수행후에 실행이 되어야함
            if(err){
                console.log("실패");
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                // 클라이언트에게 list.ejs를 그냥 그대로 보내지 말고, 서버에서 실행을 시킨 후 그 결과를 클라이언트에게 전송한다!!
                // 즉, ejs를 서버에서 렌더링 시켜야 한다!!
                var result = ejs.render(data,{
                    members:record
                });//퍼센트 안에 들어있는 코드가 실행됨
                response.end(result);
            }
        });
    });
    
}


// 이방법은 디자인 마저도 프로그램코드에서 감당하고 있기 때문에 유지보수성이 너무 낮다
// 따라서 프로그램 코드와 디자인은 분리되어야함
// 아래의 방법은 두번다시 사용하지 않겠다!!
function getList(request,response){
    //회원 목록 가져오기!!
    // 연결된 db 커넥션이 없으므로 mysql 재접속하자!!
    var con = mysql.createConnection(conStr);  //접속!!
    var sql="select *from member";
    // 두번째 인수 : select문 수행결과 배열
    // 세번재 인수 : 컬럼에 대한 메타정보(메타 데이터란? 정보의 정보(자료형 같은거))

    con.query(sql,function(err,result,fields){
        // console.log("쿼리문 수행 후 mysql로 부터 받아온 데이터는",result); //이게 우리가 원하는 형태의 값
        // // result 분석하기
        // console.log("컬럼정보",fields);


        var tag="<table width='100%' border ='1px'>";
        // 배열을 서버의 화면에 표 형태로 출력 연습
        for(var i=0;i<result.length;i++){
            var member = result[i];//한사람에 대한 정보
            var member_id = member.member_id; //pk
            var user_id= member.user_id; //아이디
            var user_name = member.user_name; //이름
            var user_pass = member.user_pass; //비번
            var regdate = member.regdate; //등록일
            tag+="<tr>";
            tag+="<td>"+member_id+"</td>";
            tag+="<td>"+user_id+"</td>";
            tag+="<td>"+user_name+"</td>";
            tag+="<td>"+user_pass+"</td>";
            tag+="<td>"+regdate+"</td>";
            tag+="</tr>";
        }
        tag+="<tr>";
        tag+="<td colspan='5'><a href='/member/form'>회원등록</a></td>";
        tag+="</tr>";
        tag+="</table>";
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(tag);
        //db닫기
        con.end();

    });

}

function getDetail(request,response){
    // 한사람에 대한 정보 가져오기
    // mysql 접속이 먼저
    var con = mysql.createConnection(conStr);//접속
    // 아래의 쿼리문에서 사용되는 pk값은 클라이언트가 전송한 값으로 대체해버리자
    //get 방식은 body를 통해 넘겨지는 post방식에 비해 header를 타고 전송되어오므로
    // 추출하기가 용이하다!!(마치 봉투의 겉면에 스여진 글씨와 같다)

    // console.log("url은",request.url);
    // 개발자가 직접 url을 문자열 분석을 시도하기보다 url을 전문적으로 해석 및 분석할 수 있는 모듈에게 맡기면 된다.
    // 그 역할을 수행하는 모듈이 url 내부모듈
    // querystring : post 방식의 파라미터 추출
    // url : get 방식의 파라미터 추출
    // console.log("url파싱한거 ",url.parse(request.url));
    var param = url.parse(request.url,true).query;
    var member_id=param.member_id; //곧 클라이언트가 넘긴 값으로 대체할 예정 //json으로부터 파라미터 변수 추출

    console.log("상세보기에 필요한 추출 파라미터는",url.parse(request.url,true).query); //true를 이용하면 json으로 출력됨
    console.log("클라이언트가 전송한 member_id의 파라키터 값은",member_id);

    var sql = "select *from member where member_id="+member_id;

    // response.end("detail test");

    // 쿼리수행
    con.query(sql,function(err,result,fields){
        console.log(result);
        // 쿼리문이 수행완료된 시점이므로 이때 사용자에게 상세페이지를 보여준다

        fs.readFile("./detail.ejs","utf8",function(err,data){ //다 읽고 나서 실행되는 함수=콜백함수
            if(err){
                console.log(err);
            }else{
                // 클라이언트에게 html을 읽어들인 내용을 보내주자!
                response.writeHead(200,{"Cotntent-Type":"text/html;charset=utf-8"});
                // render의 대상은 ejs파일내의 %%영역만이다!!
                // 모든 렌더링이 끝나면 html로 재구성하여 응답 정보에 실어서 클라이언트에게 응답 실시

                response.end(ejs.render(data,{
                    record:result[0]//한겅이라할지라도 select문의 결과는 배열이다 따라서 0번째를 추출해서 보내자

                }));
            }
            con.end();//mysql접속 끊기
        });
    });
}

function edit(request,response){
    // 쿼리문에 사용될 4개의 파라미터값을 받아서 변수에 담아보자!!
    // 글 수정은 클라이언트로부터 post방식으로 서버에 전송되기 때문에 그데이터가 body에 들어있다.
    // body에 들어있는 파라미터를 추출하기ㅜ이한 모듈 querystring 

    // post 방식의 데이터는 버퍼에 담겨오기때문에 따로따로 직렬화되어 분산된 데이터를 문자열로 모아서 처리해야함

    var content ="";
    request.on("data",function(data){
        content+=data;//쪼개진 데이터 모으기!!
    });
    request.on("end",function(){
        // 이 시점이 파라미터가 하나의 문자열로 복원된 시점
        var obj = qs.parse(content);
        console.log("obj: ",obj);

        var sql="update member set user_id='"+obj.user_id+"', user_pass='";
        sql+=obj.user_pass+"' , user_name='"+obj.user_name+"'";
        sql+=" where member_id="+obj.member_id;

        var con = mysql.createConnection(conStr);
        con.query(sql,function(err,fields){
            if(err){
                console.log(err);
            }else{
                response.writeHead(200, {"Content-type":"text/html;charset=utf-8"});
                response.end("<script>alert('수정되었습니다');location.href='/member/detail?member_id="+obj.member_id+"';</script>");
            }
            con.end();
        })
    });
    
}

function del(request,response){
    var param = url.parse(request.url,true).query;
    console.log("삭제",param);
    var sql = "delete from member where member_id="+param.member_id;
    
    // 쿼리문 구성이 끝났으므로 mysql에 접속하여 해당 쿼리를 실행하자!!
    var con = mysql.createConnection(conStr);//접속
    // 커넥션 객체는 접속정보를 가진 객체이며, 이 객체를 통해 쿼리를 수행/ mysql접속과 해체도 가능(con)

    // select 문은 결과를 가져와야하기때문에 result인수가 필요하지만 delete, updata, insert는 가져올 결과가 없기때문에 인수가 2개면 충분하다
    con.query(sql,function(err,fields){
        if(err){
            console.log("오류",err);
        }else{
            response.writeHead(200, {"Content-type":"text/html;charset=utf-8"});
            response.end("<script>alert('삭제완료');location.href='/member/list';</script>");
        }
        con.end();//mysql접속끊기
    });


}

server.listen(7979,function(){
    console.log("Server is running at 7979 port...");
});