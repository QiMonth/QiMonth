/*
 *
 *  Push Notifications codelab
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

/* eslint-env browser, es6 */
'use strict';

function base64UrlToUint8Array(base64UrlData) {
    var padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
    var base64 = (base64UrlData + padding).replace(/\-/g, '+').replace(/_/g, '/');

    var rawData = window.atob(base64);
    var buffer = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        buffer[i] = rawData.charCodeAt(i);
    }
    return buffer;
}

function uint8ArrayToBase64Url(uint8Array, start, end) {
    start = start || 0;
    end = end || uint8Array.byteLength;

    var base64 = window.btoa(String.fromCharCode.apply(null, uint8Array.subarray(start, end)));
    return base64.replace(/\=/g, '') // eslint-disable-line no-useless-escape
        .replace(/\+/g, '-').replace(/\//g, '_');
}

function cryptoKeyToUrlBase64(publicKey, privateKey) {
    var promises = [];
    promises.push(crypto.subtle.exportKey('jwk', publicKey).then(function(jwk) {
        var x = base64UrlToUint8Array(jwk.x);
        var y = base64UrlToUint8Array(jwk.y);

        var publicKey = new Uint8Array(65);
        publicKey.set([0x04], 0);
        publicKey.set(x, 1);
        publicKey.set(y, 33);

        return publicKey;
    }));

    promises.push(crypto.subtle.exportKey('jwk', privateKey).then(function(jwk) {
        return base64UrlToUint8Array(jwk.d);
    }));

    return Promise.all(promises).then(function(exportedKeys) {
        return {
            'public': uint8ArrayToBase64Url(exportedKeys[0]),
            'private': uint8ArrayToBase64Url(exportedKeys[1])
        };
    });
}

function generateNewKeys() {
    return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']).then(function(keys) {
        return cryptoKeyToUrlBase64(keys.publicKey, keys.privateKey);
    });
}

function returnPublicKey() {
    var promiseChain = Promise.resolve(generateNewKeys());
    return promiseChain.then(function(keys) {
        return keys.public;
    })
}

console.log(returnPublicKey(), 'returnPublicKey()')

const applicationServerPublicKey = 'BBlFAjKhyO_LVoaUB0ZxpA8ZSylfJa8AVCtFbZv-8XS-Zfnhbo1n3zH82DTYRgJLDGx8VKdBUOb-cu5JwD-MrZ4';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('sw.js')
        .then(function(swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function initialiseUI() {
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
            // TODO: Unsubscribe user
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            isSubscribed = !(subscription === null);

            updateSubscriptionOnServer(subscription);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;
        initialiseUI();
    })


function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
        .then(function(subscription) {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}
