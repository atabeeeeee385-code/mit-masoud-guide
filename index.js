/*
========================================
دليل شبين - الصفحة الرئيسية V2
========================================
*/


/*
========================================
قرى ومناطق مركز شبين الكوم
========================================
*/

const villages = [
    "شبين الكوم",
    "إصطباري",
    "البتانون",
    "بخاتي",
    "الدلاتون",
    "الراهب",
    "السكرية",
    "العسالتة",
    "الماي",
    "بتبس",
    "حصة مليج",
    "دكما",
    "زوير",
    "سلكا",
    "شبرا باص",
    "شبرا خلفون",
    "شنوان",
    "شنوفة",
    "طنبدي",
    "كفر البتانون",
    "كفر الشيخ خليل",
    "كفر العجايزة",
    "كفر المصيلحة",
    "كفر دقماق",
    "كفر شنوان",
    "كفر طنبدي",
    "الكوم الأخضر",
    "مليج",
    "المصيلحة",
    "منشأة بخاتي",
    "منشأة الشريكين",
    "منشأة عصام",
    "منشأة شنوان",
    "ميت الموز",
    "ميت خاقان",
    "ميت خلف",
    "ميت عافية",
    "ميت مسعود",
    "ميت موسى"
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

const villagesCountElement =
    document.getElementById("villagesCount");

const locationButton =
    document.getElementById("locationButton");

const locationMessage =
    document.getElementById("locationMessage");

const notificationButton =
    document.getElementById("notificationButton");

const enableNotificationsButton =
    document.getElementById("enableNotificationsButton");

const headerInstallButton =
    document.getElementById("headerInstallButton");

const heroInstallButton =
    document.getElementById("heroInstallButton");

const installAppBtn =
    document.getElementById("installAppBtn");

const lostFoundQuickButton =
    document.getElementById("lostFoundQuickButton");

const mobileLostFoundButton =
    document.getElementById("mobileLostFoundButton");

const reportLostButton =
    document.getElementById("reportLostButton");

const reportFoundButton =
    document.getElementById("reportFoundButton");

const dailyFeatureTitle =
    document.getElementById("dailyFeatureTitle");

const dailyFeatureText =
    document.getElementById("dailyFeatureText");

const dailyFeatureButton =
    document.getElementById("dailyFeatureButton");

const updateNotification =
    document.getElementById("updateNotification");

const updateAppBtn =
    document.getElementById("updateAppBtn");

const offlineBanner =
    document.getElementById("offlineBanner");


/*
========================================
السنة وعدد القرى
========================================
*/

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}

if (villagesCountElement) {

    villagesCountElement.textContent =
        villages.length;

}


/*
========================================
رسالة صغيرة للمستخدم
========================================
*/

let toastTimer = null;

function showToast(message) {

    let toast =
        document.getElementById("appToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "appToast";

        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.bottom = "90px";
        toast.style.zIndex = "30000";
        toast.style.width = "min(90%, 420px)";
        toast.style.padding = "13px 18px";
        toast.style.borderRadius = "14px";
        toast.style.background = "#111827";
        toast.style.color = "white";
        toast.style.textAlign = "center";
        toast.style.fontWeight = "700";
        toast.style.fontSize = "14px";
        toast.style.boxShadow =
            "0 12px 35px rgba(0, 0, 0, 0.25)";
        toast.style.transform =
            "translateX(-50%)";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.hidden = false;

    window.clearTimeout(toastTimer);

    toastTimer =
        window.setTimeout(() => {

            toast.hidden = true;

        }, 3500);

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

    const card =
        document.createElement("article");

    card.className =
        "service-card village-card";


    const title =
        document.createElement("h3");

    title.textContent =
        `🏘️ ${village}`;


    const description =
        document.createElement("p");

    description.textContent =
        `استكشف جميع خدمات ${village}`;


    const buttons =
        document.createElement("div");

    buttons.className =
        "buttons";


    const link =
        document.createElement("a");

    link.className =
        "call";

    link.href =
        `./village.html?village=${encodeURIComponent(village)}`;

    link.textContent =
        "عرض الخدمات";

    link.setAttribute(
        "aria-label",
        `عرض خدمات ${village}`
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


    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        const noResults =
            document.createElement("div");

        noResults.className =
            "no-results";

        noResults.innerHTML = `
            <i class="fa-solid fa-magnifying-glass"></i>

            <h3>
                لا توجد قرية مطابقة
            </h3>

            <p>
                جرّب كتابة الاسم بطريقة مختلفة
            </p>
        `;

        villagesContainer.appendChild(
            noResults
        );

        return;

    }


    const fragment =
        document.createDocumentFragment();


    list.forEach((village) => {

        fragment.appendChild(
            createVillageCard(village)
        );

    });


    villagesContainer.appendChild(
        fragment
    );

}


/*
========================================
البحث عن القرى
========================================
*/

function searchVillages() {

    const searchValue =
        searchInput?.value.trim() || "";

    if (!searchValue) {

        showToast(
            "اكتب اسم القرية أو الخدمة أولًا."
        );

        searchInput?.focus();

        return;

    }

    window.location.href =
        `./villages.html?search=${encodeURIComponent(searchValue)}`;

}

    window.location.href =
        `./villages.html?search=${encodeURIComponent(searchValue)}`;




    const filteredVillages =
        villages.filter((village) => {

            const normalizedVillage =
                normalizeArabicText(village);

            return normalizedVillage.includes(
                searchValue
            );

        });


    displayVillages(filteredVillages);


    const villagesSection =
        document.getElementById("villages");

    if (villagesSection) {

        villagesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

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
تحديد موقع المستخدم
========================================
*/

function updateLocationMessage(
    message,
    type = ""
) {

    if (!locationMessage) {

        return;

    }

    locationMessage.textContent =
        message;

    locationMessage.className =
        `location-message ${type}`.trim();

}


function requestUserLocation() {

    if (!("geolocation" in navigator)) {

        updateLocationMessage(
            "المتصفح لا يدعم تحديد الموقع. اختر قريتك يدويًا.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            "هنستخدم موقعك لعرض الخدمات الأقرب إليك فقط.\n\nهل تريد المتابعة؟"
        );

    if (!confirmed) {

        return;

    }


    updateLocationMessage(
        "جارٍ تحديد موقعك...",
        "loading"
    );


    navigator.geolocation.getCurrentPosition(

        (position) => {

            const locationData = {

                latitude:
                    position.coords.latitude,

                longitude:
                    position.coords.longitude,

                accuracy:
                    position.coords.accuracy,

                savedAt:
                    Date.now()

            };


            localStorage.setItem(
                "shebinUserLocation",
                JSON.stringify(locationData)
            );


            updateLocationMessage(
                "تم تحديد موقعك بنجاح. سيتم استخدامه لعرض أقرب الخدمات.",
                "success"
            );


            showToast(
                "تم حفظ موقعك بنجاح 📍"
            );

        },

        (error) => {

            let message =
                "تعذر تحديد موقعك حاليًا.";


            if (error.code === 1) {

                message =
                    "تم رفض إذن الموقع. يمكنك اختيار قريتك يدويًا.";

            }

            if (error.code === 2) {

                message =
                    "موقعك غير متاح حاليًا.";

            }

            if (error.code === 3) {

                message =
                    "استغرق تحديد الموقع وقتًا طويلًا.";

            }


            updateLocationMessage(
                message,
                "error"
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000

        }

    );

}


if (locationButton) {

    locationButton.addEventListener(
        "click",
        requestUserLocation
    );

}


/*
========================================
إذن الإشعارات
========================================
*/

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        showToast(
            "متصفحك لا يدعم الإشعارات."
        );

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        showToast(
            "الإشعارات مفعلة بالفعل 🔔"
        );

        return;

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        alert(
            "الإشعارات محظورة من إعدادات المتصفح.\n\nيمكنك تفعيلها من إعدادات الموقع."
        );

        return;

    }


    try {

        const permission =
            await Notification.requestPermission();


        if (permission === "granted") {

            showToast(
                "تم تفعيل الإشعارات بنجاح 🔔"
            );


            new Notification(
                "دليل شبين",
                {

                    body:
                        "تم تفعيل إشعارات المنصة بنجاح.",

                    icon:
                        "./icons/icon-192.png"

                }
            );

        } else {

            showToast(
                "لم يتم تفعيل الإشعارات."
            );

        }

    } catch (error) {

        console.error(
            "خطأ في الإشعارات:",
            error
        );

        showToast(
            "تعذر تفعيل الإشعارات."
        );

    }

}


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        requestNotificationPermission
    );

}


if (enableNotificationsButton) {

    enableNotificationsButton.addEventListener(
        "click",
        requestNotificationPermission
    );

}

/*
========================================
الموجودات والمفقودات
========================================
*/

function openLostFoundPage(type = "") {

    if (type === "lost" || type === "found") {

        window.location.href =
            `./add-lost-found.html?type=${type}`;

        return;

    }

    window.location.href =
        "./lost-found.html";

}


if (lostFoundQuickButton) {

    lostFoundQuickButton.addEventListener(
        "click",
        () => openLostFoundPage()
    );

}


if (mobileLostFoundButton) {

    mobileLostFoundButton.addEventListener(
        "click",
        () => openLostFoundPage()
    );

}


if (reportLostButton) {

    reportLostButton.addEventListener(
        "click",
        () => openLostFoundPage("lost")
    );

}


if (reportFoundButton) {

    reportFoundButton.addEventListener(
        "click",
        () => openLostFoundPage("found")
    );

}

/*
========================================
ميزة اليوم
========================================
*/

const dailyFeatures = [

    {

        title:
            "اعرض الخدمات القريبة منك",

        text:
            "استخدم موقعك للوصول إلى الخدمات الأقرب إليك.",

        action:
            requestUserLocation

    },

    {

        title:
            "ثبّت دليل شبين كتطبيق",

        text:
            "ادخل إلى المنصة بسرعة من شاشة هاتفك الرئيسية.",

        action:
            handleInstallRequest

    },

    {
    title:
        "الموجودات والمفقودات",

    text:
        "سجل بلاغًا عن شيء مفقود أو تم العثور عليه.",

    action:
        () => {

            window.location.href =
                "./lost-found.html";

        }

},

    {

        title:
            "أضف خدمتك مجانًا",

        text:
            "سجل خدمتك لتظهر لأهالي مركز شبين الكوم.",

        action:
            () => {

                window.location.href =
                    "./add-service.html";

            }

    }

];


const dailyFeatureIndex =
    new Date().getDate() %
    dailyFeatures.length;


const currentDailyFeature =
    dailyFeatures[
        dailyFeatureIndex
    ];


if (dailyFeatureTitle) {

    dailyFeatureTitle.textContent =
        currentDailyFeature.title;

}


if (dailyFeatureText) {

    dailyFeatureText.textContent =
        currentDailyFeature.text;

}


if (dailyFeatureButton) {

    dailyFeatureButton.addEventListener(
        "click",
        currentDailyFeature.action
    );

}


/*
========================================
تثبيت تطبيق PWA
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

        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||

        window.navigator.standalone ===
            true

    );

}


/*
========================================
هل الجهاز iPhone أو iPad؟
========================================
*/

function isIOSDevice() {

    return /iphone|ipad|ipod/i.test(
        window.navigator.userAgent
    );

}


/*
========================================
شرح تثبيت iPhone
========================================
*/

function showIOSInstallInstructions() {

    alert(
        "لتثبيت التطبيق على iPhone:\n\n1- افتح الموقع في Safari.\n2- اضغط زر المشاركة.\n3- اختر «إضافة إلى الشاشة الرئيسية».\n4- اضغط «إضافة»."
    );

}


/*
========================================
طلب تثبيت التطبيق
========================================
*/

async function handleInstallRequest() {

    if (isAppInstalled()) {

        showToast(
            "التطبيق مثبت بالفعل ✅"
        );

        return;

    }


    if (isIOSDevice()) {

        showIOSInstallInstructions();

        return;

    }


    if (!deferredInstallPrompt) {

        alert(
            "لتثبيت التطبيق افتح قائمة المتصفح، ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»."
        );

        return;

    }


    deferredInstallPrompt.prompt();


    const choice =
        await deferredInstallPrompt.userChoice;


    if (
        choice.outcome ===
        "accepted"
    ) {

        showToast(
            "تم تثبيت التطبيق بنجاح 🎉"
        );

    }


    deferredInstallPrompt = null;


    if (installAppBtn) {

        installAppBtn.hidden = true;

    }

}


/*
========================================
حدث توفر التثبيت
========================================
*/

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredInstallPrompt =
            event;


        if (
            installAppBtn &&
            !isAppInstalled()
        ) {

            installAppBtn.hidden =
                false;

        }

    }
);


/*
========================================
أزرار التثبيت
========================================
*/

if (headerInstallButton) {

    headerInstallButton.addEventListener(
        "click",
        handleInstallRequest
    );

}


if (heroInstallButton) {

    heroInstallButton.addEventListener(
        "click",
        handleInstallRequest
    );

}


if (installAppBtn) {

    installAppBtn.addEventListener(
        "click",
        handleInstallRequest
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

        deferredInstallPrompt =
            null;


        if (installAppBtn) {

            installAppBtn.hidden =
                true;

        }


        showToast(
            "تم تثبيت دليل شبين بنجاح 🎉"
        );

    }
);


/*
========================================
Service Worker
========================================
*/

let refreshing = false;


async function registerServiceWorker() {

    if (
        !(
            "serviceWorker"
            in navigator
        )
    ) {

        return;

    }


    try {

        const registration =
            await navigator
                .serviceWorker
                .register(
                    "./sw.js"
                );


        console.log(
            "Service Worker Registered:",
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


                if (!newWorker) {

                    return;

                }


                newWorker.addEventListener(
                    "statechange",
                    () => {

                        if (
                            newWorker.state ===
                                "installed" &&

                            navigator
                                .serviceWorker
                                .controller
                        ) {

                            showUpdateNotification();

                        }

                    }
                );

            }
        );

    } catch (error) {

        console.error(
            "فشل تسجيل Service Worker:",
            error
        );

    }

}


/*
========================================
تشغيل Service Worker
========================================
*/

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

        updateNotification.hidden =
            false;

    }

}


/*
========================================
إخفاء إشعار التحديث
========================================
*/

function hideUpdateNotification() {

    if (updateNotification) {

        updateNotification.hidden =
            true;

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
                    await navigator
                        .serviceWorker
                        .getRegistration(
                            "./"
                        );


                if (
                    registration &&
                    registration.waiting
                ) {

                    updateAppBtn.disabled =
                        true;

                    updateAppBtn.textContent =
                        "جارٍ التحديث...";


                    registration
                        .waiting
                        .postMessage({

                            type:
                                "SKIP_WAITING"

                        });

                } else {

                    hideUpdateNotification();

                    window.location.reload();

                }

            } catch (error) {

                console.error(
                    "خطأ أثناء التحديث:",
                    error
                );

                window.location.reload();

            }

        }
    );

}


/*
========================================
إعادة التحميل بعد التحديث
========================================
*/

if (
    "serviceWorker"
    in navigator
) {

    navigator
        .serviceWorker
        .addEventListener(
            "controllerchange",
            () => {

                if (refreshing) {

                    return;

                }


                refreshing =
                    true;


                window.location.reload();

            }
        );

}


/*
========================================
حالة الإنترنت
========================================
*/

function updateOnlineStatus() {

    const isOnline =
        navigator.onLine;


    document.body.classList.toggle(
        "offline",
        !isOnline
    );


    if (offlineBanner) {

        offlineBanner.hidden =
            isOnline;

    }

}


/*
========================================
متابعة حالة الإنترنت
========================================
*/

window.addEventListener(
    "online",
    () => {

        updateOnlineStatus();

        showToast(
            "عاد الاتصال بالإنترنت ✅"
        );

    }
);


window.addEventListener(
    "offline",
    updateOnlineStatus
);


/*
========================================
تشغيل حالة الإنترنت
========================================
*/

updateOnlineStatus();
/*
========================================
البانر المتغير
========================================
*/

const homeSlides = [
    {
        icon: "fa-solid fa-box-open",
        title: "الموجودات والمفقودات",
        text: "قريبًا تقدر تضيف بلاغ وتبحث عن الأشياء المفقودة.",
        buttonText: "اعرف المزيد",
        action: "lost"
    },
    {
        icon: "fa-solid fa-store",
        title: "عندك خدمة؟",
        text: "أضف خدمتك مجانًا لتصل إلى أهالي مركز شبين الكوم.",
        buttonText: "أضف خدمتك",
        action: "add-service"
    },
    {
        icon: "fa-solid fa-map-location-dot",
        title: "استكشف قرى المركز",
        text: "اختر قريتك واعرض الخدمات المتاحة داخلها بسهولة.",
        buttonText: "عرض القرى",
        action: "villages"
    },
    {
        icon: "fa-solid fa-mobile-screen-button",
        title: "ثبّت دليل شبين",
        text: "استخدم المنصة كتطبيق على هاتفك وادخل إليها بسرعة.",
        buttonText: "تثبيت التطبيق",
        action: "install"
    }
];

function createHomeSlider() {
    const quickSection =
        document.querySelector(".quick-section");

    if (!quickSection) {
        return;
    }

    const sliderSection =
        document.createElement("section");

    sliderSection.className =
        "home-slider-section";

    sliderSection.innerHTML = `
        <div class="container">

            <div class="home-slider">

                <button
                    type="button"
                    class="slider-arrow slider-next"
                    aria-label="الشريحة التالية">

                    <i class="fa-solid fa-chevron-right"></i>

                </button>

                <div class="slider-content">

                    <div class="slider-icon" id="sliderIcon">
                        <i class="${homeSlides[0].icon}"></i>
                    </div>

                    <div class="slider-text">

                        <span>
                            جديد في المنصة
                        </span>

                        <h2 id="sliderTitle">
                            ${homeSlides[0].title}
                        </h2>

                        <p id="sliderDescription">
                            ${homeSlides[0].text}
                        </p>

                        <button
                            type="button"
                            id="sliderActionButton">

                            ${homeSlides[0].buttonText}

                        </button>

                    </div>

                </div>

                <button
                    type="button"
                    class="slider-arrow slider-previous"
                    aria-label="الشريحة السابقة">

                    <i class="fa-solid fa-chevron-left"></i>

                </button>

                <div
                    class="slider-dots"
                    id="sliderDots">
                </div>

            </div>

        </div>
    `;

    quickSection.before(sliderSection);

    startHomeSlider();
}

function startHomeSlider() {
    const sliderIcon =
        document.getElementById("sliderIcon");

    const sliderTitle =
        document.getElementById("sliderTitle");

    const sliderDescription =
        document.getElementById("sliderDescription");

    const sliderActionButton =
        document.getElementById("sliderActionButton");

    const sliderDots =
        document.getElementById("sliderDots");

    const nextButton =
        document.querySelector(".slider-next");

    const previousButton =
        document.querySelector(".slider-previous");

    if (
        !sliderIcon ||
        !sliderTitle ||
        !sliderDescription ||
        !sliderActionButton ||
        !sliderDots
    ) {
        return;
    }

    let currentSlide = 0;
    let sliderTimer = null;

    function renderDots() {
        sliderDots.innerHTML = "";

        homeSlides.forEach((slide, index) => {
            const dot =
                document.createElement("button");

            dot.type = "button";
            dot.className =
                index === currentSlide
                    ? "slider-dot active"
                    : "slider-dot";

            dot.setAttribute(
                "aria-label",
                `عرض الشريحة ${index + 1}`
            );

            dot.addEventListener("click", () => {
                currentSlide = index;
                renderSlide();
                restartTimer();
            });

            sliderDots.appendChild(dot);
        });
    }

    function runSlideAction(action) {
        if (action === "villages") {
            window.location.href =
                "./villages.html";
            return;
        }

        if (action === "add-service") {
            window.location.href =
                "./add-service.html";
            return;
        }

        if (action === "install") {
            if (
                typeof handleInstallRequest ===
                "function"
            ) {
                handleInstallRequest();
            }
            return;
        }

 if (action === "lost") {

    window.location.href =
        "./lost-found.html";

}
    }

    function renderSlide() {
        const slide =
            homeSlides[currentSlide];

        sliderIcon.innerHTML =
            `<i class="${slide.icon}"></i>`;

        sliderTitle.textContent =
            slide.title;

        sliderDescription.textContent =
            slide.text;

        sliderActionButton.textContent =
            slide.buttonText;

        sliderActionButton.onclick = () => {
            runSlideAction(slide.action);
        };

        renderDots();
    }

    function nextSlide() {
        currentSlide =
            (currentSlide + 1) %
            homeSlides.length;

        renderSlide();
    }

    function previousSlide() {
        currentSlide =
            (
                currentSlide -
                1 +
                homeSlides.length
            ) %
            homeSlides.length;

        renderSlide();
    }

    function restartTimer() {
        window.clearInterval(sliderTimer);

        sliderTimer =
            window.setInterval(
                nextSlide,
                5000
            );
    }

    nextButton?.addEventListener(
        "click",
        () => {
            nextSlide();
            restartTimer();
        }
    );

    previousButton?.addEventListener(
        "click",
        () => {
            previousSlide();
            restartTimer();
        }
    );

    renderSlide();
    restartTimer();
}

createHomeSlider();