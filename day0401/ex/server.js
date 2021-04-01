/*
Node.js는 웹 브라우저에서 사용되는 js 문법을 거의 그대로 사용하기 때문에 
자체적인 능력이 한계가 있다. 하지만 모듈을 통해 엄청난 확장성을 갖고 있다
(전세계 개발자들에 의해 모듈이 오픈소스로 공유된다)
*/

//기본적 웹서버 모듈 가져오기
// http등의 모듈은 이미 node.js설치시 포함된다. 
// 이러한 내장된 모듈을 가리켜 내장 모듈이라한다.

var http=require("http"); //내장 모듈

//우리가 정의한 나만의 모듈도 가져와 보자!!
var md=require("./mymodule.js");
// console.log(md.getMsg());

var server = http.createServer(function(request, response){
/*
request:클라이언트의 요청 정보를 담고 있는 객체
response:클라이언트에 응답할 정보를 담고 있는 객체
*/
    response.end(md.getMsg());
}); //서버객체 생성
// 네트워크 프로그램간 식별을 위한구분 고유값 1~1024 사이의 포트번호는
//시스템이 이미 사용중인 포트이므로 사용을 피해야한다
//  또한 상용프로그램이 이미 사용중인 포트도 피하자
// oracle-1521, mysql-3306, mssql-1433
server.listen(7777,function(){
    console.log("My server is running at 7777...");
}); //서버 가동