@function testFn(test){
    if (test==1){
        return "1";
    } else {
        return "测试一下";
    }
}

@helper testHelper(test){
<div>测试helper@(test)</div>
}


<div>正文正文正文正文</div>

@{
    //js代码块
    var test="as        df";
    var test1="ccc";
    var a=3,b=5,c=4;
}

<br>

变量test：@test

<br>

变量test1：@(test1)

<br>

内部方法：@this.testFn(2)


@for(var i=0;i<a;i++){
    if (i==0){
        <div>first</div>
    }
    b++;
<text>测试文本</text>
<div>for循环@(i)</div>
}

@if (a>b) {
    console.log(2);
    <div>if 判断</div>
} else if (b<c) {
    <div>else if</div>
} else {
    <div>else</div>
}

@this.helpers.testHelper("asdf")