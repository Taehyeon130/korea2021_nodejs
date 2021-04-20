
var http=require("http");
var express=require("express"); //외부
var xmlConverter=require("xml-js"); //외부
var req = require('request');//외부
var static=require("serve-static");//외부
var app=express();
app.use(static(__dirname+"/static"));

const url = 'http://apis.data.go.kr/1400000/service/cultureInfoService/mntInfoOpenAPI';
const serviceKey="hl4BZLiOs3K8cuJVVrDAj8tf7pZ09ywZT2to%2BGtx1NDjRi%2FPGZPAUvriQqZFmeCV5BbYqkeao2JLr%2Bl4RF3%2FnA%3D%3D"; //나의 서비스키

app.get("/mt", function(request ,response){
    var mt_name = request.query.mt_name; //get방식의 파라미터로 받자!!
    
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '='+serviceKey; /* Service Key*/
    queryParams += '&' + encodeURIComponent('searchWrd') + '=' + encodeURIComponent(mt_name); /* */
    
    req({
        url: url + queryParams,
        method: 'GET'
    }, function (error, res, body) {
        //console.log('Status', response.statusCode);
        //console.log('Headers', JSON.stringify(response.headers));
        //console.log('Reponse received', body);
        response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
        //response.end(body);
        var result = xmlConverter.xml2json(body,{compact:true, spaces:4});
        response.end(result);
    });
});

var server = http.createServer(app);
server.listen(7777, function(){
    console.log("my server is running at 7777 port...");
});