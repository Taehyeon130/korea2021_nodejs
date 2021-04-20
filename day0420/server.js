/*
    java에서는 xml과 관련된 api가 자체적으로 지원되지만 nodejs는 xml을 해석하기 위해 외부 모듈이 필요

    XML vs Json

    공통점 : 데이터 교환을 위한 형식 , 포맷
                구조화 되어있기때문에 데이터에 대한 표현이 체계적
    차이점 : xml : 구조화를 태그로 표현
                json : 구조화를 객체 표기법으로 표현

    자바와 같은 응용프로그램에서는 xml을 해석하는 작업은 까다롭다.
    하지만 node.js에서는 xml을 자동으로 json으로 변환해주는 모듈이 지원된다...
*/ 

var xmlConverter = require("xml-js"); //설치 필요
var fs = require("fs");
fs.readFile("member.xml","utf8",function(error,data){
    var json = xmlConverter.xml2json(data,{compact:true, spaces:4});
    console.log(json);
})

// var tag="<members>";
// tag+="<member>";
// tag+="<name>배트맨</name>";
// tag+="<age>38</age>";
// tag+="</member>";  
// tag+="<member>";
// tag+="<name>수퍼맨</name>";
// tag+="<age>37</age>";   
// tag+="</member>";  
// tag+="<member>";
// tag+="<name>앤트맨</name>";
// tag+="<age>37</age>";   
// tag+="</member>";  
// tag+="</members>";

// // xml을 json으로 변환하기
// var json = xmlConverter.xml2json(tag,{compact:true,spaces:4});

// console.log(json);


