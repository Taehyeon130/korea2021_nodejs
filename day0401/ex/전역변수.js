/*Node.js  자체적으로 지원하는 전역변수인 
1) __filename(앞에 언더바 두개)
    지금 실행중인 js파일의 경로를 담고 있는 변수

2) __dirname(언더바 두개)
    지금 실행중인 js파일의 디렉토리 경로를 담고있는 변수
*/

console.log("지금 실행중인 js파일은",__filename);
console.log("지금 실행중인 js파일의 디렉토리는",__dirname);