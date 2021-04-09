var http = require("http");
var express = require("express"); //설치
var fs = require("fs");
var ejs = require("ejs");//설치
var app = express();

// 게시판 목록 요청 처리
app.get("/comments/list",function(request,response){
    // 클라이언트가 전송한 파라미터 받기
    var currentPage = request.query.currentPage; //클라이언트가 보기를 원하는 페이지 수
    //게시판의 최초 접속이라면, currentPage정보가 없기 때문에 1페이지로 간주함
    if(currentPage==undefined){
        currentPage=1;
    }
    console.log("currentPage : ",currentPage);

    fs.readFile("./comments/list.ejs","utf8",function(err,data){
        if(err){
            console.log(err);
        }else{
            var r = ejs.render(data,{ //ejs 해석 및 실행하기
                // ejs에 넘겨줄 데이터 지정
                param:{
                    page:currentPage
                }
            }); 
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(r); //실행한 결과 전송하기!!
        }
    });
});

var server = http.createServer(app);
server.listen(8888,function(){
    console.log("Server is running at 8888 Port");
});







