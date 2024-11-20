var loc = window.location.href;
var currentFolder = window.location.href.substring(0, loc.lastIndexOf('/')) + "/";

const SW_JS = currentFolder + 'sw.js'

async function getServiceWorkers() {
    return navigator.serviceWorker.getRegistrations().then((SWs) => SWs);
}

async function setupServiceWorker ( cb ) {
    console.log("setup Service Worker")
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker NOT supported!');
        return;
    }
    
    navigator.serviceWorker.register(SW_JS).then(function (registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
        if(typeof cb === "function" ) { cb() }
    }).catch(function (err) {
        console.error(err);
    });
} 

async function unregisterServiceWorker(cb) {
    await navigator.serviceWorker.getRegistration(SW_JS).then(function (reg) {
        if( ! reg ) { return; }
        console.log("Unregistering...");
        return reg.unregister();
    }).then(function (res) {
        console.log("Unregistered", res);
    }).catch(function(error) {
        console.error(error);
    });
    if(typeof cb === "function" ) { cb() }
}