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

function clearKeys() {
    window.localStorage.removeItem('server-keys');
}

function storeKeys(keys) {
    window.localStorage.setItem('server-keys', JSON.stringify(keys));
}

function getStoredKeys() {
    var storage = window.localStorage.getItem('server-keys');
    if (storage) {
        return JSON.parse(storage);
    }

    return null;
}

function displayKeys(keys) {
    var publicElement = document.querySelector('.js-public-key');
    var privateElement = document.querySelector('.js-private-key');
    var refreshBtn = document.querySelector('.js-refresh-keys');

    publicElement.textContent = keys['public'];
    privateElement.textContent = keys['private'];

    refreshBtn.disabled = false;
}

function updateKeys() {
    var storedKeys = getStoredKeys();
    var promiseChain = Promise.resolve(storedKeys);
    if (!storedKeys) {
        promiseChain = generateNewKeys().then(function(newKeys) {
            storeKeys(newKeys);
            return newKeys;
        });
    }

    return promiseChain.then(function(keys) {
        displayKeys(keys);
    });
}

function initialiseKeys() {
    var refreshBtn = document.querySelector('.js-refresh-keys');
    refreshBtn.addEventListener('click', function() {
        refreshBtn.disabled = true;

        clearKeys();

        updateKeys();
    });

    updateKeys();
}

window.addEventListener('load', function() {
    initialiseKeys();
});
