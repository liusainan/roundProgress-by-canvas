/**
 * Created by sainan.liu on 2016/7/28.
 */
    /*//创建一个圆形进度条
     //new roundProgress(canvas, bgcolor, pencolor)
     //canvas: canvas dom, bgcolor: 设置背景圆环颜色, pencolor: 设置进度圆环颜色
     //init(speed, time)
     //speed 速度：次/ms
     //time 时长：共ms*/
var roundProgress = (function(roundP){
    var roundP = function(canvas, bgcolor, pencolor){
        this.canvas = canvas;
        this.Ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.bgcolor = bgcolor;
        this.pencolor = pencolor;
    };

    roundP.prototype.init = function(speed, time){
        this.x = this.width/2;
        this.y = this.height/2;
        this.r = Math.min(this.x, this.y) - 25;
        this.drawCircle(this.x, this.y, this.r);
        this.initProgress(speed, time);
    }
    //注册进度条
    roundP.prototype.initProgress = function(speed, time){
        var self = this;
        var t = 1, m = -0.5, max = time/speed;
        self.progress = setInterval(function(){
            if(t <= max){
                self.refreshProgress(m+t*(2/max), t);
                t++;
            }else{
                clearTimeout(self.progress);
            }
        }, speed);
    }
    //画默认圆
    roundP.prototype.drawCircle = function(x, y, r){
        var ctx = this.Ctx;
        ctx.beginPath();
        ctx.arc(x, y, r, 0 * Math.PI, 2 * Math.PI, true);
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.bgcolor;
        ctx.stroke();
    }
    //刷新画布
    roundP.prototype.refreshProgress = function(m, t){
        var ctx = this.Ctx, x = this.x, y = this.y, r = this.r;
        ctx.clearRect( 0 , 0 , this.width , this.width);
        this.drawCircle(x, y, r);
        //画外发光
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, x*0.93, -0.5 * Math.PI, m * Math.PI, false);

        var textMetrics = ctx.measureText(t+'"');
        var twidth = textMetrics.width;

        ctx.globalAlpha=0.2;
        var wrd = ctx.createRadialGradient(x, y, twidth/2, x, y, x*0.93);//从左到右
        wrd.addColorStop(0, "#fff"); //起始颜色
        wrd.addColorStop(r/x*0.93, this.pencolor); //起始颜色
        wrd.addColorStop(1, "#fff"); //终点颜色
        ctx.fillStyle = wrd;
        ctx.fill();
        ctx.globalAlpha= 1;
        //绘制时间,先清除画布
        for( var i = 0 ; i < Math.round( Math.PI * twidth/2 ) ; i++ ){
            var angle = ( i / Math.round( Math.PI * twidth/2 )) * 360;
            ctx.clearRect( x, y, Math.sin( angle * ( Math.PI / 180 )) * twidth/2 , Math.cos( angle * ( Math.PI / 180 )) * twidth/2 );
        }
        ctx.font = "normal 1rem 微软雅黑";
        ctx.fillStyle = this.pencolor;
        ctx.fillText(t+'"', x-twidth/2+2, y+5);

        //画进度圆
        ctx.beginPath();
        ctx.arc(x, y, r, -0.5 * Math.PI, m * Math.PI, false);
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.pencolor;
        ctx.stroke();
    }
    return roundP;
})(roundProgress || {});