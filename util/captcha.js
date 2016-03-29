
module.exports=function(req,res) {

    var Canvas=require('canvas'),
        height=50,
        Image=Canvas.Image,
        canvas=new Canvas(100,50),
        ctx=canvas.getContext('2d');

    ctx.fillStyle="#fff";
    ctx.fillRect(0,0,100,50);

    var util=require('./../core/util');

    var font=['Impact','Arial'];
    var words=["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","m","n","p","q","r","s","t","u","v","w","x","y","z","2","3","4","5","6","7","8","9"];

    var result='';
    var gradient=ctx.createLinearGradient(0,0,50,0);
    gradient.addColorStop(0,"magenta");
    gradient.addColorStop(0.5,"blue");
    gradient.addColorStop(1.0,"red");

    for(var i=0;i<4;i++) {
        var fontSize=util.random(35,40);
        var fontFamily=util.random(0,1);
        var rotate=.01*util.random(-45,45);
        var img=new Image;
        var wordCanvas=new Canvas(50,50);
        var wordCtx=wordCanvas.getContext('2d');
        var c=words[util.random(55)];

        result+=c;

        wordCtx.rotate(rotate);
        wordCtx.font=fontSize+'px '+font[fontFamily];

        // 用渐变进行填充
        wordCtx.strokeStyle=gradient;

        wordCtx.strokeText(c,rotate>0.15?rotate*50:5,40);

        img.src=wordCanvas.toBuffer();

        ctx.drawImage(img,i*20,0,50,50)
    }

    gradient=ctx.createLinearGradient(0,0,canvas.width,0);
    gradient.addColorStop(0,"magenta");
    gradient.addColorStop(0.5,"blue");
    gradient.addColorStop(1.0,"red")

    var random=util.random(0,1);
    var from=util.random(0,10);
    var to=util.random(40,50);

    ctx.strokeStyle=gradient;
    ctx.beginPath();
    ctx.lineTo(0,random?from:to);
    ctx.lineTo(100,random?to:from);
    ctx.stroke();

    res.set('Content-Type','image/jpeg');
    //var stream=canvas.createPNGStream();
    var stream=canvas.jpegStream({ quality: 90 });

    stream.pipe(res);

    /*

    res.set('Content-Type','text/html');
    res.end('<img src="'+canvas.toDataURL()+'" />'+result)
    */
}