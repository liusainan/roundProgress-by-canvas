/**
 * Created by sainan.liu on 2016/8/3.
 */
var DOC = document;
var IsWeixin = /MicroMessenger/i.test(window.navigator.userAgent);
if (IsWeixin) {
    //微信分享
    //for weixin_xiaozhaoji
    //fix bug
    var Weixin = {

        appid: '',
        isReady: false,
        jsApiList: [
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'hideOptionMenu',
            'hideMenuItems',
            'showMenuItems',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'chooseWXPay',
            'openLocation',
            'getLocation',
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'onVoicePlayEnd',
            'uploadVoice',
            'downloadVoice'
        ],

        init: function() {
            if ('undefined' !== typeof wx && 'undefined' !== typeof wx.ready) {
                //微信6.0.2分享接口不能使用-图片处理
                Weixin.setImgToBody();
                //初始化config
                Weixin.initConfig();
                //通过ready接口处理成功验证
                wx.ready(function() {
                    Weixin.isReady = true;
                    Weixin.checkJsApi();
                });
                // 通过error接口处理失败验证
                wx.error(function(res) {
                    // alert(res.errMsg);
                });

            }
        },

        // 通过config接口注入权限验证配置
        initConfig: function() {
            var config;
            if (typeof js_sdk_config != 'undefined') {
                config = Weixin.extend({
                    debug: false,
                    jsApiList: Weixin.jsApiList
                }, js_sdk_config);
                wx.config(config);
            }
        },

        checkJsApi: function() {
            try {
                wx.checkJsApi({
                    jsApiList: Weixin.jsApiList,
                    success: function(res) {
                        // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                        (!res || !res.checkResult || !res.checkResult.onMenuShareTimeline) ? Weixin.addOldEvent(): Weixin.addEvent();
                    }
                });
            } catch (e) {
                Weixin.addOldEvent();
            }
        },

        addEvent: function() {
            var weixinJSBridge,
                resource = Weixin.getResource(),
                shareData = {//分享到朋友
                    title: resource['title'],
                    desc: resource['desc'],
                    link: resource['link'] || location.href,
                    imgUrl: resource['imgUrl'],
                    success: function(){
                        dj['getPageData']('wxshareCallback') && dj['getPageData']('wxshareCallback')();
                        dj['getPageData']('sharePV') && dj['getPageData']('sharePV')(1);
                    },
                    cancel: function(){
                        dj['getPageData']('sharePV') && dj['getPageData']('sharePV')(0);
                    }
                },
                shareData_appmsg = {//分享到朋友圈
                    title: resource['title'] + " " + resource['desc'],
                    desc: resource['desc'],
                    link: resource['link'] || location.href,
                    imgUrl: resource['imgUrl'],
                    success: function(){
                        dj['getPageData']('wxshareCallback') && dj['getPageData']('wxshareCallback')();
                        dj['getPageData']('sharePV') && dj['getPageData']('sharePV')(3);
                    },
                    cancel: function(){
                        dj['getPageData']('sharePV') && dj['getPageData']('sharePV')(2);
                    }
                };
            wx.onMenuShareAppMessage(shareData);
            wx.onMenuShareTimeline(shareData_appmsg);
        },
        addOldEvent: function() {
            var weixinJSBridge,
                resource = Weixin.getResource(),
                addEveDetail = function() {
                    if ('undefined' !== typeof WeixinJSBridge) {
                        weixinJSBridge = WeixinJSBridge;
                        weixinJSBridge['on']('menu:share:appmessage', Weixin.shareFriend);
                        weixinJSBridge['on']('menu:share:timeline', Weixin.shareTimeline);
                        //weixinJSBridge['on']('menu:share:weibo', Weixin.shareWeibo, false);
                        //weixinJSBridge['on']('menu:share:email', Weixin.shareMail, false);
                        weixinJSBridge['call']('showOptionMenu');
                    }
                };

            if ('undefined' !== typeof WeixinJSBridge) {
                addEveDetail();
            } else {
                DOC.addEventListener('WeixinJSBridgeReady', addEveDetail);
            }
        },

        extend: function(dest, source) {
            var property, item;
            for (var property in source) {
                item = source[property];
                if (item !== null) {
                    dest[property] = (typeof(item) == 'object' && !(item.nodeType) && !(item instanceof Array)) ? RR.fn.prototype.extend({}, item) : item;
                }
            }
            return dest;
        },

        getResource: function() {
            var elMetas = DOC.getElementsByTagName('meta'),
                i = 0,
                l = elMetas.length,
                elMeta,
                propertyValue,
                match,
                _result = {};

            for (; i < l; i++) {
                elMeta = elMetas[i];
                propertyValue = elMeta.getAttribute('property') || '';
                if (match = propertyValue.match(/^og:([^\s]+)/i)) {
                    _result[match[1]] = elMeta.getAttribute('content') || ''
                }
            };

            var result = {
                'img_url': _result['image'] || '',
                'imgUrl': _result['image'] || '',
                'img_width': '150',
                'img_height': '150',
                'link': _result['url'] || location.href,
                'desc': (_result['description'] || '').replace(/\s+/, ' '),
                'title': (_result['title'] || DOC.getElementsByTagName('title')[0].innerHTML || '').replace(/\s+/, ' '),
                'content': (_result['content'] || '').replace(/\s+/, ' ')
            };

            if ('' === result['content']) {
                result['content'] = result['title'] + (result['desc'] ? ' ' + result['desc'] : '');
            }

            return result;
        },

        callback: function() {},

        hideOptionMenu: function() {
            var timer,
                timerFun = function() {
                    if (Weixin.isReady) {
                        wx.hideOptionMenu();
                        clearTimeout(timer);
                    }
                };
            if ('undefined' !== typeof WeixinJSBridge) {
                weixinJSBridge['call']('hideOptionMenu');
            } else {
                timer = setInterval(function() {
                    timerFun();
                }, 300);
            }

        },
        showOptionMenu: function() {
            var timer,
                timerFun = function() {
                    if (Weixin.isReady) {
                        wx.showOptionMenu();
                        clearTimeout(timer);
                    }
                };
            if ('undefined' !== typeof WeixinJSBridge) {
                weixinJSBridge['call']('showOptionMenu');
            } else {
                timer = setInterval(function() {
                    timerFun();
                }, 300);
            }

        },

        // 发送给好友
        shareFriend: function() {
            var data = Weixin.getResource();
            WeixinJSBridge['invoke']('sendAppMessage', Weixin.extend(data, {
                    'appid': Weixin.appid
                }),
                Weixin.callback
            );

        },

        // 分享到朋友圈
        shareTimeline: function() {
            var data = Weixin.getResource(),
                desc = data['desc'];
            WeixinJSBridge['invoke']('shareTimeline', Weixin.extend(data, {
                    'title': data['content']
                }),
                Weixin.callback
            );

        },

        // 分享到微博
        shareWeibo: function() {
            var data = Weixin.getResource(),
                desc = data['desc'];

            WeixinJSBridge['invoke']('shareWeibo', {
                    'img_url': data['imgUrl'] || '',
                    'url': data['link'],
                    'title': desc,
                    'content': data['content'] + ' ' + data['link'] + ''
                },
                Weixin.callback
            );
        },

        //收藏
        shareAppMessage: function() {
            var data = Weixin.getResource();

            WeixinJSBridge['invoke']('sendAppMessage', data,
                Weixin.callback
            );
        },

        // 发送邮件
        shareMail: function() {
            var data = Weixin.getResource();
            WeixinJSBridge['invoke']('sendEmail', {
                    'title': data['title'],
                    'content': data['content'] + "\r\n" + data['link']
                },
                Weixin.callback
            );
        },

        report: function(type, msg) {
            //alert(type + ': ' + msg);
        },

        //微信6.0.2分享接口不能使用-图片处理
        setImgToBody: function() {
            var d = Weixin.getResource(),
                img,
                appendImgToBody = function() {
                    document.body.insertAdjacentHTML('afterbegin', ' <div style="display:none"> <img src="' + d.imgUrl + '"/></div>');
                };
            if (!d || !d.imgUrl) {
                return;
            }
            img = new Image();
            img.onload = appendImgToBody;
            img.src = d.imgUrl;
        }
    };

    Weixin.init();
}
