/**
 * Created by sainan.liu on 2016/8/2.
 */
$(function(){
    var Progress = new roundProgress(document.getElementById('canvas'), '#eaedf3', '#6bd4e0'),
        $start =  $('#jp-start'),
        $progress = $('.circleProgress_wrapper.gray'),
        $tools = $('.circleSmall'),
        $restart =  $('.circleSmall.right'),
        $watch = $('.circleSmall.left'),
        $onOff = $('.circleSmall.middle');

    function logger(msg){
        $(document.body).append('<img src="/favorite/logger?' + msg + '" style="display: none;" />');
    }

    function startRecord() {
        $start.addClass('hide');
        Progress.init(1000, 60*1000);
        wx.startRecord();
        $progress.attr('status','active');
    };

    function stopRecord() {
        clearTimeout(Progress.progress);
        $watch.html(String(Progress.now || 0)+'"');
        $tools.addClass('show');
        wx.stopRecord({
            success: function(res) {
                Progress.localId = res.localId;
                logger(localId);
            }
        });
     };

    function playVoice() {
        wx.playVoice({
            localId: Progress.localId // 需要播放的音频的本地ID，由stopRecord接口获得
        });
    };

    function pauseVoice() {
        wx.pauseVoice({
            localId: Progress.localId // 需要暂停的音频的本地ID，由stopRecord接口获得
        });
    };

    function stopVoice() {
        wx.stopVoice({
            localId: Progress.localId // 需要停止的音频的本地ID，由stopRecord接口获得
        });
    };

    function uploadVoice() {
        wx.uploadVoice({
            localId: '', // 需要上传的音频的本地ID，由stopRecord接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function(res) {
                var serverId = res.serverId; // 返回音频的服务器端ID
            }
        });
    };

    function downloadVoice() {
        wx.downloadVoice({
            serverId: '', // 需要下载的音频的服务器端ID，由uploadVoice接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function(res) {
                var localId = res.localId; // 返回音频的本地ID
            }
        });
    };

    wx.onVoicePlayEnd({
        success: function(res) {
            var localId = res.localId; // 返回音频的本地ID
            logger('播放完成');
            $onOff.children('i').removeClass('lIng');
        }
    });

    wx.onVoiceRecordEnd({
        // 录音时间超过一分钟没有停止的时候会执行 complete 回调
        complete: function(res) {
            logger('录音超时');
            Progress.localId = res.localId;
            clearTimeout(Progress.progress);
            $watch.html(String(Progress.now || 0)+'"');
            $tools.addClass('show');
        }
    });
    //start
    $start.on('click', function(){
        startRecord();
    });
    //停止
    $progress.on('click', function(e){
        e.stopPropagation();
        if($(this).attr('status') == 'active'){
            stopRecord();
        }else{
            return false
        }
    });
    //播放
    $onOff.on('click', function(){
        if(!$(this).children('i').hasClass('lIng')){
            $(this).children('i').addClass('lIng');
            playVoice();
        }else{
            $(this).children('i').removeClass('lIng');
            pauseVoice();
        }
    });
    //重录
    $restart.on('click', function(e){
        e.stopPropagation();
        $progress.removeAttr('status','active');
        $tools.removeClass('show');
        $start.removeClass('hide');
        $watch.html('0"');
        $onOff.children('i').removeClass('lIng');
        clearTimeout(Progress.progress);
        Progress.refreshCanvas();
    });
});