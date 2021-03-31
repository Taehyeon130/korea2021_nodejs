/*
클라이언트의 요청에 응답을 처리해보자!!
*/
var http=require("http");
var server =http.createServer(function(request,response){
    // 앞으로 클라이언트의 요청 및 그 요청에 대한 응답처리를 이 익명 함수에서 처리할 수 있다!!

    // 응답 보내기!!
    //table태그를 클라이언트에 보내자!!
    var tag ="<table border='1px'>";
    tag+="<tr>";
    tag+="<td>apple</td>";
    tag+="<td>banana</td>";
    tag+="</tr>";
    tag+="</table>";
    response.end(tag);//웹브라우저가 해석할 수 있는 데이터로 보내면 됨
});

//서버 가동하여, 클라이언트의 접속을 기다리자
server.listen(8888,function(){
    console.log("Third Server is running at 8888 Port....");
});