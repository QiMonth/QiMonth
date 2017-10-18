importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-messaging.js');
importScripts('./scripts/firebaseInit.js');

var messaging = firebase.messaging();
console.log(self.location, 'self.location')

// 接收到通知并展示
messaging.setBackgroundMessageHandler(function(payload) {
    var payload = payload;
    payload['origin'] = self.location.origin;
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    // var payload = {
    //     collapse_key: "do_not_collapse",
    //     data: {
    //         data: '{"data":{"clAid":"341184599174222592","clNm":"小白猫","to":"100030025010","fr":"100044425732","clTm":1508203797804},"dataType":"call","id":1508203797804}',
    //         type: "2"
    //     },
    //     from: "851484560417",
    //     priority: "high"
    // }
    var data = notificationDataProcessing(payload);
    return self.registration.showNotification(data.title, data.options);
});

// 数据处理;
function notificationDataProcessing(res) {
    var msgType = res.data.type,
        msgData = null;
    msgData = res.data.data;
    if (msgData && typeof msgData == 'string') {
        msgData = JSON.parse(msgData);
    }
    switch (msgType) {
        case '1': // 际信消息; 
            msgData['origin'] = res.origin;
            msgData = showImMsgStyle(msgData);
            break;
        case '2': // 际话消息;
            msgData = showTalkMsgStyle(msgData);
            break;
        default:
    }

    var notifi = {
        title: msgData.title || '',
        options: {
            body: msgData.body || '',
            icon: msgData.icon || './images/userpic.jpg',
            tag: 'GcallOfflineNotification'
        }
    }
    return notifi;
}

// 展示际信(IM)消息的具体处理;
function showImMsgStyle(msgData) {
    if (typeof msgData != 'object') {
        return;
    }
    var resultIm = {},
        origin = msgData.origin,
        title = resultIm['title'];
    if (origin.indexOf('chinaso.gcall.com') != -1) {
        title = '国搜';
    } else if (origin.indexOf('g.gcall.com') != -1) {
        title = '院校';
    } else {
        title = '';
    }
    title += '际客';
    resultIm['body'] = '小白猫';
    resultIm['icon'] = '';
    // req:0 正常消息 1 请求消息
    if (msgData.data.req == 0) {
        var groupChat = '';
        if (parseInt(msgData.data.gt) == 2) {
            groupChat = '在群聊中';
        }
        switch (parseInt(msgData.data.ct)) {
            case 1:
                resultIm['body'] += ':' + '发布的文本内容!';
                break;
            case 2:
                resultIm['body'] += ':' + '[表情]';
                break;
            case 3:
                resultIm['body'] += groupChat + '发送了照片';
                break;
            case 4:
                resultIm['body'] += groupChat + '发送了视频';
                break;
            case 5:
                resultIm['body'] += groupChat + '发送了附件';
                break;
            case 9:
                resultIm['body'] += groupChat + '发送了一条语音消息';
                break;
            default:
        }
        if (parseInt(msgData.data.ht) == 2) {
            resultIm['body'] += '撤回了一条消息';
        }
    }
    return resultIm;
}

// 展示际话(Talk)消息的具体处理;
function showTalkMsgStyle(msgData) {
    if (typeof msgData != 'object') {
        return;
    }
    var resultIm = {},
        title = resultIm['title'];
    title = '';
    switch (msgData.dataType) {
        case 'call':
            title = '音频';
            break;
        case 'call_v':
            title = '视频';
            break;
        case 'call_e':
            title = '企业音频';
            break;
        case 'call_v_e':
            title = '企业视频';
            break;
        default:
    }
    title += '来电';
    resultIm['body'] = msgData.data.clNm + '来电, 点击接听。';
    resultIm['icon'] = '';
    return resultIm;
}
