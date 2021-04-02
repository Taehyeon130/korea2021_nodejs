var http = require("http");//내장모듈 따라서 별도의 설치 불필요
var fs = require("fs"); //파일을 제어하는 모듈(내장 모듈)

var server = http.createServer(function(request, response){//순서만 맞추면 변수명은 임의로 설정가능
    // request : 클라이언트의 요청 정보
    // response : 클라이언트에게 보낼 응답 정보

    fs.readFile("./regist_form.html","utf8",function(err,data){
        // HTTP의 형식을 갖추어서 클라이언트에게 응답을 해보자~~
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"}); //header 정보를 제대로 갖추어서 응답하자!!!
        response.end(data);//클라이언트에 지정한 문자열을 전송!!

    });

});
server.listen(7878,function(){
    console.log("My server is running at 7878...");
}); //서버 가동

