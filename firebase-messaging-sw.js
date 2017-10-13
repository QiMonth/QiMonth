importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.5.1/firebase-messaging.js'); 
// Initialize Firebase
var config = {
    apiKey: "AIzaSyAKW6Aul80UFW2LZcgcyoh4AaeszH943Z4",
    authDomain: "qimonth.firebaseapp.com",
    databaseURL: "https://qimonth.firebaseio.com",
    projectId: "qimonth",
    storageBucket: "qimonth.appspot.com",
    messagingSenderId: "561356343570"
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(payload => {
//     console.log('[worker] Received push notification: ', payload);
//     return self.registration.showNotification(payload.title, payload);
// });


