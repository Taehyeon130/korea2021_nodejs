/*
노드 js에 내장된 여러 모듈 중 os모듈을 사용해보자!!
현재의 node.js가 실행중인 운영체제와 관련된정보를 가진 모듈
*/

var os = require("os");
console.log("호스트 이름",os.hostname());
console.log("운영체제 버전",os.release());
console.log("운영체제 실행된 시간",os.uptime());