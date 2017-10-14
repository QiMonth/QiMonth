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

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
    console.log('[worker] Received push notification: ', payload);
    return self.registration.showNotification(payload.title, payload);
});
