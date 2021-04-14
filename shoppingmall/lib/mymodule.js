/*모듈은 변수, 함수등의 코드를 모아 놓고 파일로 저장한 단위
개발자가 모듈을 정의할때는 내장객체 중 exports객체를 사용하면 됨
*/
//getMsg 메서드를 현재 모듈안에 정의한다
exports.getMsg=function()
{
    return "This message is from my module";
}

//랜덤값 가져오기
exports.getRandom=function(n){
    var r = parseInt(Math.random()*n); //0.000xxxx~1사이의 난수(1미만) 1이 못된*8 ..7
    // console.log(r);
    return r;
}

    /*-----------------------------------------------------
        자리수 처리 함수
        한자리수의 경우 앞에 0붙이기!!
    --------------------------------------------------------*/
   exports.getZeroString=function(n){
        var result = (n>=10)? n:"0"+n;
        return result;
    }

    /*-----------------------------------------------------
    메시지 처리 함수
    alert으로 출력할 메시지를 생성해주는 함수
    <script>
        alert();
        location.href=원하는 url
    </script>
    --------------------------------------------------------*/
    exports.getMsgUrl=function(msg,url){
        var tag = "<script>";
        tag+="alert('"+msg+"');";
        tag+="location.href='"+url+"';";
        tag+="</script>";
        return tag;//함수 호출자 에게 최종적으로 태그 문자열 반환
    }


/*-----------------------------------------------------
    원하는 메시지 출력후 뒤로 돌아가기
    --------------------------------------------------------*/
    exports.getMsgBack = function(msg){
        var tag = "<script>";
        tag+="alert('"+msg+"');";
        tag+="history.back();" // 끝에 세미콜론 처리 반드시
        tag+="</script>";
        return tag;
    }