/*
========================================
بيانات قرى مركز شبين الكوم
========================================
*/

const villages = [
    "ميت مسعود",
    "شبين الكوم",
    "البتانون",
    "إصطباري",
    "شنوان",
    "كفر البتانون",
    "كفر الشيخ إبراهيم",
    "بخاتي",
    "المصيلحة",
    "ميت خلف",
    "منشأة سلطان",
    "كفر طنبدى",
    "طنبدى",
    "الماي",
    "دكما",
    "زوير",
    "الراهب",
    "البتانون الجديدة",
    "ميت عافية",
    "كفر المصلحة",
    "منشأة السلام",
    "كفر دقماق",
    "كفر العرب",
    "ميت موسى",
    "كفر الغنامية",
    "سرس الليان",
    "الحصوة",
    "الماحوزة",
    "بابل",
    "طوخ طنبشا",
    "الراهبين",
    "شنواي",
    "تلبنت قيصر"
];


/*
========================================
عناصر الصفحة
========================================
*/

const villagesContainer =
    document.getElementById("villagesContainer");

const searchInput =
    document.getElementById("villageSearch");

const searchButton =
    document.getElementById("searchButton");

const yearElement =
    document.getElementById("year");

const installAppBtn =
    document.getElementById("installAppBtn");

const updateNotification =
    document.getElementById("updateNotification");

const updateAppBtn =
    document.getElementById("updateAppBtn");


/*
========================================
السنة الحالية
========================================
*/

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/*
========================================
تنسيق النص العربي للبحث
========================================
*/

function normalizeArabicText(text) {

    if (typeof text !== "string") {
        return "";
    }

    return text
        .trim()
        .toLowerCase()
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ـ/g, "")
        .replace(/[\u064B-\u065F\u0670]/g, "");

}


/*
========================================
إنشاء كارت القرية
========================================
*/

function createVillageCard(village) {

    const card = document.createElement("article");

    card.className = "service-card";


    const title = document.createElement("h3");

    title.textContent = `🏘️ ${village}`;


    const description = document.createElement("p");

    description.textContent = `دليل خدمات ${village}`;


    const buttons = document.createElement("div");

    buttons.className = "buttons";


    const link = document.createElement("a");

    link.className = "call";

    link.textContent = "دخول";

    link.href =
        `./village.html?village=${encodeURIComponent(village)}`;

    link.setAttribute(
        "aria-label",
        `عرض خدمات قرية ${village}`
    );


    buttons.appendChild(link);

    card.appendChild(title);

    card.appendChild(description);

    card.appendChild(buttons);


    return card;

}


/*
========================================
عرض القرى
========================================
*/

function displayVillages(list) {

    if (!villagesContainer) {
        return;
    }

    villagesContainer.innerHTML = "";


    if (!Array.isArray(list) || list.length === 0) {

        const noResults =
            document.createElement("p");

        noResults.className = "no-results";

        noResults.textContent =
            "لا توجد قرية مطابقة لعملية البحث";


        villagesContainer.appendChild(noResults);

        return;

    }


    const fragment =
        document.createDocumentFragment();


    list.forEach((village) => {

        fragment.appendChild(
            createVillageCard(village)
        );

    });


    villagesContainer.appendChild(fragment);

}


/*
========================================
البحث عن القرى
========================================
*/

function searchVillages() {

    if (!searchInput) {
        return;
    }

    const searchValue =
        normalizeArabicText(searchInput.value);


    if (!searchValue) {

        displayVillages(villages);

        return;

    }


    const filteredVillages =
        villages.filter((village) => {

            const normalizedVillage =
                normalizeArabicText(village);

            return normalizedVillage.includes(searchValue);

        });


    displayVillages(filteredVillages);

}


/*
========================================
تشغيل البحث
========================================
*/

if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchVillages
    );


    searchInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                searchVillages();

            }

        }
    );

}


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchVillages
    );

}


/*
========================================
عرض القرى عند فتح الصفحة
========================================
*/

displayVillages(villages);
/*
========================================
إعدادات تثبيت تطبيق PWA
========================================
*/

let deferredInstallPrompt = null;


/*
========================================
هل التطبيق مثبت؟
========================================
*/

function isAppInstalled() {

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );

}

if (isAppInstalled() && installAppBtn) {

    installAppBtn.hidden = true;

}


/*
========================================
إظهار زر التثبيت
========================================
*/

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredInstallPrompt = event;

        if (installAppBtn && !isAppInstalled()) {

            installAppBtn.hidden = false;

        }

    }
);


/*
========================================
تثبيت التطبيق
========================================
*/

if (installAppBtn) {

    installAppBtn.addEventListener(
        "click",
        async () => {

            if (!deferredInstallPrompt) {

                alert(
                    "يمكنك تثبيت التطبيق من قائمة المتصفح."
                );

                return;

            }

            deferredInstallPrompt.prompt();

            const choice =
                await deferredInstallPrompt.userChoice;

            if (choice.outcome === "accepted") {

                console.log("تم تثبيت التطبيق");

            }

            deferredInstallPrompt = null;

            installAppBtn.hidden = true;

        }
    );

}


/*
========================================
بعد تثبيت التطبيق
========================================
*/

window.addEventListener(
    "appinstalled",
    () => {

        deferredInstallPrompt = null;

        if (installAppBtn) {

            installAppBtn.hidden = true;

        }

        console.log("تم تثبيت التطبيق");

    }
);


/*
========================================
Service Worker
========================================
*/

let refreshing = false;

async function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) {

        return;

    }

    try {

        const registration =
            await navigator.serviceWorker.register(
                "./sw.js"
            );

        console.log(
            "Service Worker Registered",
            registration.scope
        );

        await registration.update();

        if (
            registration.waiting &&
            navigator.serviceWorker.controller
        ) {

            showUpdateNotification();

        }

        registration.addEventListener(
            "updatefound",
            () => {

                const newWorker =
                    registration.installing;

                if (!newWorker) return;

                newWorker.addEventListener(
                    "statechange",
                    () => {

                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {

                            showUpdateNotification();

                        }

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

    }

}

window.addEventListener(
    "load",
    registerServiceWorker
);
/*
========================================
إظهار إشعار التحديث
========================================
*/

function showUpdateNotification() {

    if (updateNotification) {
        updateNotification.hidden = false;
    }

}


/*
========================================
إخفاء إشعار التحديث
========================================
*/

function hideUpdateNotification() {

    if (updateNotification) {
        updateNotification.hidden = true;
    }

}


/*
========================================
تحديث التطبيق
========================================
*/

if (updateAppBtn) {

    updateAppBtn.addEventListener(
        "click",
        async () => {

            try {

                const registration =
                    await navigator.serviceWorker.getRegistration("./");

                if (
                    registration &&
                    registration.waiting
                ) {

                    updateAppBtn.disabled = true;

                    updateAppBtn.textContent =
                        "جارٍ التحديث...";

                    registration.waiting.postMessage({
                        type: "SKIP_WAITING"
                    });

                } else {

                    hideUpdateNotification();

                    window.location.reload();

                }

            } catch (error) {

                console.error(
                    "حدث خطأ أثناء تحديث التطبيق:",
                    error
                );

                window.location.reload();

            }

        }
    );

}


/*
========================================
إعادة تحميل الصفحة بعد تفعيل التحديث
========================================
*/

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {

            if (refreshing) {
                return;
            }

            refreshing = true;

            window.location.reload();

        }
    );

}


/*
========================================
حالة الاتصال بالإنترنت
========================================
*/

function updateOnlineStatus() {

    if (navigator.onLine) {

        document.body.classList.remove("offline");

        console.log("الاتصال بالإنترنت متاح");

    } else {

        document.body.classList.add("offline");

        console.log("لا يوجد اتصال بالإنترنت");

    }

}


/*
========================================
متابعة تغيير حالة الإنترنت
========================================
*/

window.addEventListener(
    "online",
    updateOnlineStatus
);

window.addEventListener(
    "offline",
    updateOnlineStatus
);


/*
========================================
تشغيل حالة الاتصال عند فتح الصفحة
========================================
*/

updateOnlineStatus();
