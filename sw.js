const CACHE_NAME =
    "mit-masoud-guide-v12";

const CORE_FILES = [
    "./",
    "./index.html",
    "./villages.html",
    "./village.html",
    "./service.html",
    "./all-services.html",
    "./add-service.html",
    "./lost-found.html",
    "./add-lost-found.html",
    "./admin-login.html",
    "./admin.html",
    "./offline.html",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/*
========================================
تثبيت Service Worker
========================================
*/

self.addEventListener(
    "install",
    (event) => {

        self.skipWaiting();

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then((cache) => {

                    return cache.addAll(
                        CORE_FILES
                    );

                })

        );

    }
);


/*
========================================
حذف الكاش القديم
========================================
*/

self.addEventListener(
    "activate",
    (event) => {

        event.waitUntil(

            caches
                .keys()
                .then((cacheNames) => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                (cacheName) =>
                                    cacheName !==
                                    CACHE_NAME
                            )
                            .map(
                                (cacheName) =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                })
                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


/*
========================================
التحديث الفوري
========================================
*/

self.addEventListener(
    "message",
    (event) => {

        if (
            event.data?.type ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/*
========================================
معالجة الطلبات
========================================
*/

self.addEventListener(
    "fetch",
    (event) => {

        const request =
            event.request;

        if (
            request.method !== "GET"
        ) {

            return;

        }


        const requestUrl =
            new URL(request.url);


        /*
        Firebase يعمل من الإنترنت
        */

        const externalHosts = [
            "firebaseio.com",
            "firestore.googleapis.com",
            "identitytoolkit.googleapis.com",
            "securetoken.googleapis.com",
            "gstatic.com",
            "googleapis.com",
            "cdnjs.cloudflare.com",
            "fonts.googleapis.com",
            "fonts.gstatic.com"
        ];


        const isExternalRequest =
            externalHosts.some(
                (host) =>
                    requestUrl.hostname.includes(
                        host
                    )
            );


        if (isExternalRequest) {

            return;

        }


        /*
        صفحات HTML:
        الإنترنت أولًا
        */

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then((response) => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const copy =
                                response.clone();

                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    (cache) => {

                                        cache.put(
                                            request,
                                            copy
                                        );

                                    }
                                );

                        }

                        return response;

                    })

                    .catch(async () => {

                        const cachedPage =
                            await caches.match(
                                request
                            );

                        if (cachedPage) {

                            return cachedPage;

                        }

                        return caches.match(
                            "./offline.html"
                        );

                    })

            );

            return;

        }


        /*
        JavaScript وCSS:
        الإنترنت أولًا
        لمنع النسخ القديمة
        */

        const isCodeFile =
            requestUrl.pathname.endsWith(
                ".js"
            ) ||
            requestUrl.pathname.endsWith(
                ".css"
            );


        if (isCodeFile) {

            event.respondWith(

                fetch(request)

                    .then((response) => {

                        if (
                            response &&
                            response.ok
                        ) {

                            const copy =
                                response.clone();

                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    (cache) => {

                                        cache.put(
                                            request,
                                            copy
                                        );

                                    }
                                );

                        }

                        return response;

                    })

                    .catch(() => {

                        return caches.match(
                            request
                        );

                    })

            );

            return;

        }


        /*
        الصور والملفات الأخرى:
        الكاش أولًا
        */

        event.respondWith(

            caches
                .match(request)
                .then(
                    (cachedResponse) => {

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }

                        return fetch(request)
                            .then(
                                (response) => {

                                    if (
                                        response &&
                                        response.ok
                                    ) {

                                        const copy =
                                            response.clone();

                                        caches
                                            .open(
                                                CACHE_NAME
                                            )
                                            .then(
                                                (
                                                    cache
                                                ) => {

                                                    cache.put(
                                                        request,
                                                        copy
                                                    );

                                                }
                                            );

                                    }

                                    return response;

                                }
                            );

                    }
                )

        );

    }
);