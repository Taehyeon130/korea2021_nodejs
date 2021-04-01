/*서버 구축하기!!*/
var http = require("http");//http모듈 가져오기
var fs = require("fs"); //fs 모듈 가져오기 - 파일을 다룰때 사용되는 모듈

// mysql을 연동하기 위한 모듈 가져오기
var mysql = require("mysql");
// 외부모듈이다. 따라서 개발시 추가 설치해야한다
// npm이라는 툴을 이용하면 node.js개발시 모듈 설치와 관련된 많은 기능을 지원해줌
//npm(Node.js package manager)
// 추가설치 명령어:cmd창에서 >npm install 모듈명(mysql)

var server = http.createServer(function(request, response){
    //클라이언트에 응답하기 
    //클라이언트에게 보여줄 html 문서를 이루고 있는 코드를 읽여들여서 , 응답정보로
    //보내보자!!

    // 클라이언트가 브라우저의 URL에 어떤 주소를 입력했는지를 조사해보자
    // 그 조사 결과에 따라 아래 중 어떤 코드가 실행될지를 결정하자
    // request 객체란 클라이언트에 요청정보를 가진 객체이기때문에 클라이언트가 입력한
    // url 정보도 이 객체를 통해 얻어낼 수있다.
    var url = request.url;
    console.log("클라이언트가 요청이 입력한 주소는",url);

    //localhost:8888/member/form : 회원가입디자인 폼 요청
    //localhost:8888/member/regist : 회원가입 요청
    //localhost:8888/member/result : 회원가입 완료

    if(url=="/member/form"){
        // 회원가입을 희망하는 사람
        fs.readFile("./regist_form.html", "utf8", function(error, data){
            //파일의 내용을 모두 읽어들인 순간 이 익명함수가 동작함.
            response.end(data);
        });
    }else if(url =="/member/regist"){ //등록을 원하면
        // 쿼리문 수행전에 node.js가 mysql에 접속을 성공해야한다!!
        var con = mysql.createConnection({
            url:"localhost:3306",/*DB는 네트워크 프로그램이라 포트 사용함*/
            database:"nodejs", //사용중인 db명
            user:"root",
            password:"1234"
        }); //접속!!
        console.log("접속결과 객체",con);

        // console.log("DB에 등록을 원하는 군요");
        var sql = "insert into member(user_id, user_pass,user_name)";
        sql+=" values('superman','0000','수퍼맨')"; //valuse앞에 한칸 뛰기

        //쿼리문 수행
        con.query(sql,function(err,fields){
            if(err){
                console.log("쿼리문 수행중 에러발행",err);
            }else{
                console.log("등록성공!");
            }
        }); 

    }else if(url =="/member/result"){
        // 회원등록을 성공한 사람
        fs.readFile("./result.html", "utf8", function(error, data){
            //파일의 내용을 모두 읽어들인 순간 이 익명함수가 동작함.
            response.end(data);
        });
    }



});//서버객체 생성

//서버가동
server.listen(8888 , function(){
    console.log("Server is running at 8888...");
});

