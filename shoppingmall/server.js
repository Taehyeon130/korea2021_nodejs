// 쇼핑몰 개발환경 구축
var http = require("http");
var express = require("express");
var static = require("serve-static"); //정적자원 처리를 위한 외부 모듈
var ejs = require("ejs"); //설치
var mysql = require("mysql");
var mymodule = require("./lib/mymodule.js");

const conStr = {
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"shoppingmall"
};

var app = express();
app.use(static(__dirname+"/static"));//정적자원의 최상의 루트 설정

app.use(express.urlencoded({
    extended:true
})); //post요청의 파라미터 받기 위함

// 템플릿 뷰 엔진 등록(서버스크립트의 위치 등록)
app.set("view engine","ejs"); //등록 후엔 자동으로 무조건 views라는 디렉토리 하위에서 ejs를 찾아나섬
                                        //따라서 views라는 정해진 디렉토리를 무조건 존재시켜야한다!! 

// 관리자모드 로그인 폼 요청
app.get("/admin/loginform",function(request,response){
    response.render("admin/login"); //이미 뷰를 등록해두어서 admin앞에 / 필요가 없음
});

// 관리자 로그인 요청 처리
app.post("/admin/login",function(request,response){
    var master_id = request.body.master_id;
    var master_pass = request.body.master_pass;

    // console.log(master_id);
    // console.log(master_pass);

    var sql = "select *from admin where master_id=? and master_pass=?";
    var con = mysql.createConnection(conStr);
    con.query(sql,[master_id,master_pass],function(err,result,fields){
        if(err){
            console.log(err);
        }else{
            // console.log("result : ",result);
            if(result.length<1){
                console.log("로그인 실패");
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                // 이전화면으로 강제로 되돌리기 history.back()
                response.end(mymodule.getMsgBack("로그인정보가 올바르지 않습니다"));

            }else{
                console.log("로그인 성공");
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("로그인 성공","/admin/main"));
            }
        }
        con.end();
    });
});

// 관리자모드 메인 요청 처리
app.get("/admin/main",function(request,response){
    response.render("admin/main");
});


//상품관리 페이지 요청
app.get("/admin/product/registform",function(request,response){
    var sql = "select *from topcategory";
    var con = mysql.createConnection(conStr);
    con.query(sql,function(err,result,fields){
        if(err){
            console.log("상위 카테고리 조회 실패",err);
        }else{
            // console.log(result);
            response.render("admin/product/regist",{
                record:result /*배열을 ejs에 전달*/
            });
        }
        con.end();
    });
});

//선택된 상위카테고리에 소속된 하위카테고리 목록 가져오기
app.get("/admin/product/sublist",function(request,response){
    var topcategory_id = request.query.topcategory_id; //파라미터 받기

    var sql="select * from subcategory where topcategory_id="+topcategory_id;
    var con = mysql.createConnection(conStr);
    con.query(sql,function(err,result,fields){
        if(err){
            console.log(err);
        }else{
            console.log(result);
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.render("admin/product/resigtform",{
                
            });

        }
        con.end();
    });
});

var server = http.createServer(app);
server.listen(9999,function(){
    console.log("Server is running at 9999 Port...");
});