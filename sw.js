const CACHE_NAME = "mit-masoud-guide-v9";
const STATIC_FILES = [
    "./",
    "./index.html",
    "./village.html",
    "./villages.html",
    "./service.html",
    "./all-services.html",
    "./add-service.html",
    "./admin-login.html",
    "./admin.html",

    "./lost-found.html",
    "./add-lost-found.html",

    "./style.css",

    "./index.js",
    "./script.js",
    "./service.js",
    "./all-services.js",
    "./villages.js",
    "./admin-login.js",
    "./admin.js",
    "./firebase.js",
    "./lost-found.js",
    "./add-lost-found.js",

    "./manifest.json",
    "./offline.html",

    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* ========================================
   تثبيت Service Worker
======================================== */

self.addEventListener("install", (event) => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_FILES))

    );

});


/* ========================================
   تفعيل النسخة الجديدة
======================================== */

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
            .then((cacheNames) => {

                return Promise.all(

                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })
            .then(() => self.clients.claim())

    );

});


/* ========================================
   تحديث فوري
======================================== */

self.addEventListener("message", (event) => {

    if (event.data?.type === "SKIP_WAITING") {

        self.skipWaiting();

    }

});


/* ========================================
   التعامل مع الطلبات
======================================== */

self.addEventListener("fetch", (event) => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    /* عدم تخزين Firebase */

    if (

        url.hostname.includes("firebaseio.com") ||
        url.hostname.includes("firestore.googleapis.com") ||
        url.hostname.includes("identitytoolkit.googleapis.com") ||
        url.hostname.includes("securetoken.googleapis.com")

    ) {

        return;

    }


    /* صفحات HTML */

    if (request.mode === "navigate") {

        event.respondWith(

            fetch(request)

                .then((response) => {

                    const copy = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, copy));

                    return response;

                })

                .catch(async () => {

                    return (

                        await caches.match(request) ||

                        await caches.match("./offline.html")

                    );

                })

        );

        return;

    }


    /* CSS / JS / Images */

    event.respondWith(

        caches.match(request)

            .then((cached) => {

                return (

                    cached ||

                    fetch(request).then((response) => {

                        if (

                            response &&
                            response.ok &&
                            response.type !== "opaque"

                        ) {

                            const copy = response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, copy));

                        }

                        return response;

                    })

                );

            })

    );

});