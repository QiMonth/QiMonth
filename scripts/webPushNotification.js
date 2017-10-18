var messaging = firebase.messaging();

// 申请接收通知的权限
messaging.requestPermission().then(function() {
    messaging.getToken()
        .then(function(currentToken) {
            if (currentToken) {
                sendTokenToServer(currentToken);
                console.log('token：', currentToken);
            } else {
                setTokenSentToServer(false);
            }
        })
        .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
            setTokenSentToServer(false);
        });
})["catch"](function(err) {
    console.log('Unable to get permission to notify.', err);
    setTokenSentToServer(false);
});

// 接收数据
messaging.onMessage(function(payload) {
    console.log('onMessage', payload);
});

// [START 监控令牌刷新]
messaging.onTokenRefresh(function() {
    // 检索当前的注册令牌
    messaging.getToken()
        .then(function(refreshedToken) {
            console.log('获取token：', refreshedToken);
            setTokenSentToServer(false);
            sendTokenToServer(refreshedToken);
        })
        .catch(function(err) {
            console.log('Unable to retrieve refreshed token ', err);
            setTokenSentToServer(false);
        });
});

// 把token发送给服务器;
function sendTokenToServer(currentToken) {
    window.localStorage.setItem('currentToken', currentToken);
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        setTokenSentToServer(true, currentToken);
        console.log('发送的Token：', currentToken);
    } else {
        console.log('你的token已经发送到服务器，不需要再次发送了');
    }
}

// 检查token是否发送到服务器
function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') == 1;
}

// 设置token是否发送到服务器;
function setTokenSentToServer(sent) {
    var num = 0;
    if (sent) {
        num = 1;
    } else {
        window.localStorage.removeItem('currentToken');
    }
    window.localStorage.setItem('sentToServer', num);
}
