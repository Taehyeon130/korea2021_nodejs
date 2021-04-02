// 나의 메모리 영역뿐만아니라 Human이라는 객체의 인스턴스의 메모리 영역도 내것처럼 쓰겠다. 즉 확장하겠다!
class BlackHuman extends Human{
    constructor(color){
        // 바로 이 시점이 흑인이 태어나는 시점이므로, 다른 어떠한 코드보다도 앞서서
        //부모님을 태어나게 해아한다...\
        // this.x=5; 에러발생 ? 부모의 초기화보다 자식의 초기화가 앞설수는 없기때문에 금지되어있음

        super(color);
        console.log("자식인 BlackHuman객체의 초기화 완료");
    }

    playBasketBall(){
        console.log("농구를 함");
    }
    playBoxing(){
        console.log("복싱을 함")
    }
}