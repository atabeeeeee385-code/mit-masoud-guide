const CACHE_NAME = "mit-masoud-guide-v2";

const STATIC_FILES = [
    "./",
    "./index.html",
    "./village.html",
    "./service.html",
    "./all-services.html",
    "./add-service.html",
    "./admin-login.html",
    "./admin.html",

    "./style.css",

    "./index.js",
    "./script.js",
    "./service.js",
    "./all-services.js",
    "./admin-login.js",
    "./admin.js",
    "./firebase.js",

    "./manifest.json",
    "./offline.html",

    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* تثبيت الـ Service Worker وتخزين الملفات */

self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_FILES);
        })
    );

});


/* حذف النسخ القديمة من الكاش */

self.addEventListener("activate", (event) => {

    event.waitUntil(
        caches.keys().then((cacheNames) => {

            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );

        }).then(() => self.clients.claim())
    );

});


/* تفعيل النسخة الجديدة عند الضغط على زر التحديث */

self.addEventListener("message", (event) => {

    if (
        event.data &&
        event.data.type === "SKIP_WAITING"
    ) {
        self.skipWaiting();
    }

});


/* التعامل مع طلبات الموقع */

self.addEventListener("fetch", (event) => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);


    /* ترك Firebase يعمل من الإنترنت مباشرة */

    const firebaseHosts = [
        "firebaseio.com",
        "firestore.googleapis.com",
        "identitytoolkit.googleapis.com",
        "securetoken.googleapis.com"
    ];

    const isFirebaseRequest = firebaseHosts.some((host) =>
        requestUrl.hostname.includes(host)
    );

    if (isFirebaseRequest) {
        return;
    }


    /* صفحات HTML: الإنترنت أولًا ثم النسخة المخزنة */

    if (request.mode === "navigate") {

        event.respondWith(
            fetch(request)
                .then((response) => {

                    if (response && response.ok) {

                        const responseCopy = response.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseCopy);
                        });

                    }

                    return response;

                })
                .catch(async () => {

                    const cachedPage = await caches.match(request);

                    if (cachedPage) {
                        return cachedPage;
                    }

                    return caches.match("./offline.html");

                })
        );

        return;
    }


    /* CSS وJavaScript والصور: الكاش أولًا */

    event.respondWith(
        caches.match(request).then((cachedResponse) => {

            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((networkResponse) => {

                if (
                    !networkResponse ||
                    !networkResponse.ok ||
                    networkResponse.type === "opaque"
                ) {
                    return networkResponse;
                }

                const responseCopy = networkResponse.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseCopy);
                });

                return networkResponse;

            });

        })
    );

});