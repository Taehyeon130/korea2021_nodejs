var http = require("http");
// 클라이언트가 업로드 한 바이너리 데이터 처리를 위한 모듈
var multer = require("multer"); //외부
var mysql = require("mysql");
// var oracledb=require("oracledb");//외부 모듈
var path = require("path");//파일의 경로와 관련되어 유용한 기능을 보유한 모듈, 확장자를 추출하는 기능 포함
var express = require("express");
var mymodule = require("./lib/mymodule.js");
var fs = require("fs");
var ejs = require("ejs");

// express객체 생성
var app = express();

// 필요한 각종 미들웨어 적용 static자원의 루트를 입력하는 것
// console.log("호호호ㅗㅎ",__dirname);
app.use(express.static(__dirname+"/static"));

// 업로드 모듈을 이용한 업로드 처리 destination는 저장할 곳 filename 저장할 이름
// 노드 js뿐만아니라 asp,php,jsp등은 일단 업로드 컴포넌트를 사용할 경우 모든 post는 이 업로드 컴포넌트를 통해 처리된다...
var upload = multer({
    storage:multer.diskStorage({
        destination:function(request,file,cb){
            cb(null,__dirname+"/static/upload");
        },
        filename:function(request,file,cb){
            console.log("file is ",file);
            // 업로드한 파일에 따라서 파일 확장자는 틀려진다... 프로그래밍 적으로 정보를 추출해야한다 = path
            // path.extname(file.originalname) 의 결과는 jpg, png.....
            console.log(path.extname(file.originalname));//업로드된 파일의 확장자는
            cb(null,new Date().valueOf()+path.extname(file.originalname));
        }
    })
});

// mysql 접속 정보
conStr = {
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};

//글목록 요청 처리
app.get("/gallery/list",function(request,response){
    var con = mysql.createConnection(conStr);//접속
    var sql = "select *from gallery order by gallery_id desc"; //내림차순

    con.query(sql,function(err,result,fields){
        if(err){
            console.log(err);
        }else{
            fs.readFile("./gallery/list.ejs","utf8",function(error,data){
                if(error){
                    console.log(error);
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        galleryList:result,
                        lib:mymodule
                    }));//ejs렌더링해서 넣기
                }
            });
        }
        con.end();
    });
});

// 등록 요청 처리
app.post("/gallery/regist",upload.single("pic"),function(request,response){ //내가 사용할 컴포넌트 등록!!upload  single-업로드를 하나만 하겠다.
    // 파라미터 받기
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    // console.log("request는",request);
    var filename=request.file.filename; //multer를 이용했기 때문에 기존의 request객체에 추가된것이다

    console.log("filename은",filename);
    var con = mysql.createConnection(conStr);
    var sql = "insert into gallery(title,writer,content,filename) values(?,?,?,?)";
    con.query(sql,[title,writer,content,filename],function(error,fields){
        if(error){
            console.log(error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("등록 완료","/gallery/list"));
        }
        con.end();

    });
});

// 상세보기 요청
app.get("/gallery/detail",function(request,response){
    var con = mysql.createConnection(conStr);
    var gallery_id= request.query.gallery_id;

    var  sql ="select *from gallery where gallery_id="+'gallery_id';

    // 쿼리문 수행
    con.query(sql,function(err,result,fields){
        if(err){
            console.log(err);
        }else{
            con.query("update gallery set hit=hit+1 where gallery_id =?",gallery_id,function(err,fields){
                if(err){
                    console.log(err);
                }else{
                    fs.readFile("./gallery/detail.ejs","utf8",function(error,data){
                        if(error){
                            console.log(error);
                        }else{
                            var d = ejs.render(data,{
                                gallery:result[0]//result가 한건의 데이터만 담고있다고 하더라도 배열이므로
                            });
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(d);
                        }
                        con.end();
                    });
                }
            });
        }
    });
});

// 삭제요청 처리(DB삭제 + 이미지 삭제)
// 파일을 업로드 하건 안하건 일단 multer를 사용하게 되면 모든 post방식에 관여하게 되어있다
// node.js....
app.post("/gallery/del",upload.single("pic"),function(request,response){
    var gallery_id = request.body.gallery_id;
    var filename = request.body.filename;

    console.log("gallery_id",gallery_id);
    fs.unlink(__dirname+"/static/upload/"+filename,function(err){
       if(err){
           console.log(err);
       }else{
           console.log("삭제완료");
            //db도 지우자!!
            var sql ="delete from gallery where gallery_id="+gallery_id;
            var con = mysql.createConnection(conStr);
            con.query(sql,function(error,fields){
                if(error){
                    console.log(error);
                }else{
                    // 목록 요청
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(mymodule.getMsgUrl("삭제완료","/gallery/list"));
                }
                con.end();
            });
       }
    });
});

// 글 수정하기(서버가 일단 업로드 컴포넌트를 사용하게 되면 post는 무조건 업로드 컴포넌트를 이용해야한다)
app.post("/gallery/edit",upload.single("pic"),function(request,response){
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var gallery_id = request.body.gallery_id;
    var filename = request.body.filename

    //업로드시 request객체의 json속성 중 file이라는 속성이 판단 대상
    // 클라이언트가 업로드를 원하는지 않하는지를 구분?
    // console.log(request.file); //수정버튼만 누르면 file속성 없고 사진을 바꾸고 수정버튼을 누르면 flle속성이 나타남
    // 사진도 변경
    
    // 사진 유지
    
    if(request.file != undefined){ //업로드를 원함(사진 교체)
        // response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        console.log("사진 교체");
        // 사진 지우기 + db수정
        fs.unlink(__dirname+"/static/upload/"+filename,function(err){
            if(err){
                console.log(err);
            }else{
                filename=request.file.filename; //새롭게 업로드된 파일명으로 교체
                var sql ="update gallery set title=?, writer=?, content=?, filename=? where gallery_id = ?";

                var con =mysql.createConnection(conStr);
                con.query(sql,[title,writer,content,filename,gallery_id],function(err,fields){
                    if(err){
                        console.log(err);
                    }else{
                        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("수정완료","/gallery/detail?gallery_id=",gallery_id));
                    }
                    con.end();
                });
            }
        }); 
    }else{ //사진 유지
        console.log("사진 유지");
        var sql="update gallery set title=?,writer=?,content=? where gallery_id=?";
        var con = mysql.createConnection(conStr);
        con.query(sql,[title,writer,content,gallery_id],function(error,fields){
            if(error){
                console.log(error);
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("수정완료","/gallery/detail?gallery_id=",gallery_id));
            }
            con.end();
        });
    }
});

var server = http.createServer(app);//기본 모듈에 express모듈 연결
 server.listen(9999,function(){
    console.log("Gallery Server is running at 9999Port...");
 });
