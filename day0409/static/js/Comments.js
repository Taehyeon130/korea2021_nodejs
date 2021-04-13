/*
게시물 한건을 표현하는 클래스 정의
주의) 이 파일은 게시물 자체가 아닌 1건을 생성할수있는 틀이다!!
*/

class Comments{
    constructor(container,msg,author,writeDay){
        this.container=container; //이 객체가 부착될 부모 요소
        this.wrapper;
        this.msgDiv;
        this.authorDiv;
        this.writeDayDiv;

        this.msg = msg;
        this.author = author;
        this.writeDay = writeDay;

        this.wrapper = document.createElement("div");
        this.msgDiv = document.createElement("div");
        this.authorDiv = document.createElement("div");
        this.writeDayDiv = document.createElement("div");

        // 스타일 지정
        this.msgDiv.style.width = 70+"%";
        this.authorDiv.style.width = 15+"%";
        this.writeDayDiv.style.width = 10+"%";
        
        this.msgDiv.innerHTML = this.msg;
        this.authorDiv.innerHTML = this.author;
        this.writeDayDiv.innerHTML = this.writeDay;

        // wrapper에 동적으로 클래스 적용 
        this.wrapper.classList.add("comment-list");

        //div간 조립
        this.wrapper.appendChild(this.msgDiv);
        this.wrapper.appendChild(this.authorDiv);
        this.wrapper.appendChild(this.writeDayDiv);

        // container에 wrapper부착
        this.container.appendChild(this.wrapper);
    }
}