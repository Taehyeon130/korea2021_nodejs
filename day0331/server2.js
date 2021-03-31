/*
클라이언트의 요청을 받을 웹서버를 구축한다!!
*/
var http = require("http");// http모듈(웹서버 모듈) 을 가져오기
var server = http.createServer(); //서버 객체 생성

// 클라이언트의 접속을 감지해보자!!
server.on("connection",function(){
    console.log("클라이언트의 접속 감지!!");
}); //접속

// 클라이언트 요청에 대해 응답을 해보자!!
// 만일 응답 처리를 안할 경우 클라이언트는 무한대기에 빠진다...



server.listen(9999,function(){
    console.log("Second Server is running at 9999 port...");
});//클라이언트의 접속을 기다림...