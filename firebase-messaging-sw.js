importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-messaging.js');
// Initialize Firebase
var config = {
    apiKey: "AIzaSyDHZTrl00SP05ao8jsj1E80gFV2LC2x-fQ",
    authDomain: "gcall-4a0f8.firebaseapp.com",
    databaseURL: "https://gcall-4a0f8.firebaseio.com",
    projectId: "gcall-4a0f8",
    storageBucket: "gcall-4a0f8.appspot.com",
    messagingSenderId: "851484560417"
};

firebase.initializeApp(config);

var messaging = firebase.messaging();

// 接收到通知并展示
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = '亲！你有新消息';
    var notificationOptions = {
        body: 'Background Message body.',
        icon: './images/icon.png'
    }; 
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
