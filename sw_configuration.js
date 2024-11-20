var swCustom = {
    "MAX_WAIT": 2500,
    "skipWaiting" : true, // Install and replace current Service Worker(testing purposes)
    "verbose" : 0, // Show log messages
    "cacheOnInstall" : [
        "icon.png",
        "partidas.sqlite",
        "index.html",
        "style.css",
        "page01.html",
        "sql.js",
        "sw_configuration.html"
    ],
    "offlineFirstPages" : [
        "icon.png",
        "partidas.sqlite",
        "sql.js",
        "index.html",
        "style.css",
    ],
}