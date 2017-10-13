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
var fcmToken = null;

// Request permission for push notifications.
messaging.requestPermission()
    .then(() => {
        log('Have permission to send push notifications');
        return messaging.getToken();
    })
    .then(token => {
        fcmToken = token;
        log(`Received FCM token: ${token}`);
    })
    .catch(err => {
        log(err);
    });

// Handle incoming messages.
messaging.onMessage(payload => {
    log(`Received push notification: ${JSON.stringify(payload)}`);
    const { body, title } = payload.notification;
    toastr.info(body, title);
});

// Handlers for buttons.
function onOnSiteNotificationClick() {
    log('Sending on-site push notification...');
    fetch(`/push?token=${fcmToken}`);
}

function onOffSiteNotificationClick() {
    log('Sending off-site push notification...');
    log('The page will be redirected for demo purposes');
    setTimeout(() => {
        fetch(`/push?token=${fcmToken}&sleep=2`);
        window.location = 'http://google.com';
    }, 3000);
}

// Simple logging to page element.
const $log = $('#log');

function log(message) {
    $log.append(`<br/>${message}`);
}
