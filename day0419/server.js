var http = require("http");
var static=require("serve-static");
var express = require("express");
var request = require("request"); //외부 모듈
var app = express();
app.use(static(__dirname+"/static")); //정적자원의 루트 등록


app.get("/tourlist",function(req,res){
    // 이 요청이 들어오면, 클라이언트가 원하는 것은? 우리서버의 데이터가 아니라 제 3서버의 데이터를 원하는 것
    // 공공데이터 포털에 요청해보기
    request({
        url:"https://tour.chungbuk.go.kr/openapi/tourInfo/stay.do",
        method: 'GET'
    }, function (error, response, body) {
        res.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
        res.end(body);
    });

});

var server = http.createServer(app);
server.listen(7777,function(){
    console.log("Server is running at 7777 Port....");
});