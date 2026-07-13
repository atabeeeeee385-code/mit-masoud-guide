/*
========================================
عرض بلاغات الموجودات والمفقودات
Firestore
========================================
*/

import {
    db
} from "./firebase.js";

import {
    collection,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*
========================================
قائمة القرى
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

const reportsList =
    document.getElementById(
        "lostFoundReportsList"
    );

const reportsCount =
    document.getElementById(
        "lostFoundReportsCount"
    );

const searchInput =
    document.getElementById(
        "lostFoundSearch"
    );

const searchButton =
    document.getElementById(
        "lostFoundSearchButton"
    );

const villageFilter =
    document.getElementById(
        "lostFoundVillageFilter"
    );

const categoryFilter =
    document.getElementById(
        "lostFoundCategoryFilter"
    );

const filterButtons =
    document.querySelectorAll(
        ".lost-found-filters button"
    );

const yearElement =
    document.getElementById("year");

const offlineBanner =
    document.getElementById(
        "offlineBanner"
    );

const installAppBtn =
    document.getElementById(
        "installAppBtn"
    );

const updateNotification =
    document.getElementById(
        "updateNotification"
    );

const updateAppBtn =
    document.getElementById(
        "updateAppBtn"
    );


/*
========================================
متغيرات الصفحة
========================================
*/

let allReports = [];

let activeTypeFilter = "all";

let deferredInstallPrompt = null;

let refreshing = false;


/*
========================================
السنة
========================================
*/

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/*
========================================
تحميل القرى داخل الفلتر
========================================
*/

function loadVillagesFilter() {

    if (!villageFilter) {

        return;

    }

    villages.forEach((village) => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            village;

        option.textContent =
            village;

        villageFilter.appendChild(
            option
        );

    });

}

loadVillagesFilter();


/*
========================================
تنسيق النص العربي
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
        .replace(
            /[\u064B-\u065F\u0670]/g,
            ""
        );

}


/*
========================================
حماية النص قبل العرض
========================================
*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*
========================================
تحويل Firestore Timestamp
========================================
*/

function getTimestampMilliseconds(
    timestamp
) {

    if (!timestamp) {

        return 0;

    }

    if (
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }

    if (
        typeof timestamp.seconds ===
        "number"
    ) {

        return timestamp.seconds * 1000;

    }

    const parsedDate =
        new Date(timestamp).getTime();

    return Number.isNaN(parsedDate)
        ? 0
        : parsedDate;

}


/*
========================================
تنسيق التاريخ
========================================
*/

function formatDate(dateValue) {

    if (!dateValue) {

        return "غير محدد";

    }

    const date =
        new Date(
            `${dateValue}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

    }

    return new Intl.DateTimeFormat(
        "ar-EG",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);

}


/*
========================================
اختصار الوصف
========================================
*/

function shortenText(
    text,
    maximumLength = 170
) {

    const safeText =
        String(text || "");

    if (
        safeText.length <=
        maximumLength
    ) {

        return safeText;

    }

    return `${safeText.slice(
        0,
        maximumLength
    )}...`;

}


/*
========================================
إنشاء رابط واتساب
========================================
*/

function createWhatsAppLink(
    report
) {

    const phone =
        String(report.phone || "")
            .replace(/\D/g, "");

    const internationalPhone =
        phone.startsWith("0")
            ? `20${phone.slice(1)}`
            : phone;

    const reportType =
        report.type === "found"
            ? "الموجود"
            : "المفقود";

    const message =
        `مرحبًا، أتواصل بخصوص بلاغ ${reportType}: ${report.title}`;

    return (
        `https://wa.me/` +
        `${internationalPhone}` +
        `?text=${encodeURIComponent(
            message
        )}`
    );

}


/*
========================================
إنشاء كارت البلاغ
========================================
*/

function createReportCard(report) {

    const typeText =
        report.type === "found"
            ? "موجود"
            : "مفقود";

    const typeClass =
        report.type === "found"
            ? "found"
            : "lost";

    const typeIcon =
        report.type === "found"
            ? "fa-solid fa-hand-holding"
            : "fa-solid fa-magnifying-glass";

    const isResolved =
        report.status === "resolved";

    const statusText =
        isResolved
            ? "تم التسليم"
            : "نشط";

    const statusClass =
        isResolved
            ? "resolved"
            : "active";

    const safeImageUrl =
        escapeHTML(
            report.imageUrl || ""
        );

    const imageHTML =
        safeImageUrl
            ? `
                <div class="lost-found-report-image">

                    <img
                        src="${safeImageUrl}"
                        alt="${escapeHTML(
                            report.title
                        )}"
                        loading="lazy">

                </div>
            `
            : `
                <div class="lost-found-report-image no-image">

                    <i class="fa-solid fa-image"></i>

                    <span>
                        لا توجد صورة
                    </span>

                </div>
            `;

    const reporterName =
        report.reporterName
            ? escapeHTML(
                report.reporterName
            )
            : "غير محدد";

    const safePhone =
        String(report.phone || "")
            .replace(/[^\d+]/g, "");

    const whatsappLink =
        createWhatsAppLink(report);

    return `
        <article
            class="lost-found-report-card"
            data-report-id="${escapeHTML(
                report.id
            )}">

            ${imageHTML}

            <div class="lost-found-report-body">

                <div class="lost-found-report-top">

                    <span
                        class="report-type-badge ${typeClass}">

                        <i class="${typeIcon}"></i>

                        ${typeText}

                    </span>

                    <span
                        class="report-status-badge ${statusClass}">

                        ${statusText}

                    </span>

                </div>

                <h3>
                    ${escapeHTML(
                        report.title
                    )}
                </h3>

                <p class="lost-found-report-description">

                    ${escapeHTML(
                        shortenText(
                            report.description
                        )
                    )}

                </p>

                <div class="lost-found-report-details">

                    <span>

                        <i class="fa-solid fa-tag"></i>

                        ${escapeHTML(
                            report.category
                        )}

                    </span>

                    <span>

                        <i class="fa-solid fa-location-dot"></i>

                        ${escapeHTML(
                            report.village
                        )}

                    </span>

                    <span>

                        <i class="fa-solid fa-map-pin"></i>

                        ${escapeHTML(
                            report.location
                        )}

                    </span>

                    <span>

                        <i class="fa-regular fa-calendar"></i>

                        ${escapeHTML(
                            formatDate(
                                report.date
                            )
                        )}

                    </span>

                    ${
                        report.time
                            ? `
                                <span>

                                    <i class="fa-regular fa-clock"></i>

                                    ${escapeHTML(
                                        report.time
                                    )}

                                </span>
                            `
                            : ""
                    }

                    <span>

                        <i class="fa-regular fa-user"></i>

                        ${reporterName}

                    </span>

                </div>

                <div class="lost-found-report-actions">

                    <a
                        href="tel:${escapeHTML(
                            safePhone
                        )}"
                        class="report-call-button">

                        <i class="fa-solid fa-phone"></i>

                        اتصال

                    </a>

                    <a
                        href="${escapeHTML(
                            whatsappLink
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="report-whatsapp-button">

                        <i class="fa-brands fa-whatsapp"></i>

                        واتساب

                    </a>

                </div>

            </div>

        </article>
    `;

}


/*
========================================
حالة التحميل
========================================
*/

function renderLoadingState() {

    if (!reportsList) {

        return;

    }

    reportsList.innerHTML = `
        <div class="lost-found-loading-card">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h3>
                جاري تحميل البلاغات...
            </h3>

        </div>
    `;

}


/*
========================================
حالة عدم وجود نتائج
========================================
*/

function renderEmptyState() {

    if (!reportsList) {

        return;

    }

    reportsList.innerHTML = `
        <div class="lost-found-empty-state">

            <div class="lost-found-empty-icon">

                <i class="fa-solid fa-box-open"></i>

            </div>

            <h3>
                لا توجد بلاغات مطابقة
            </h3>

            <p>

                لا توجد بلاغات منشورة
                مطابقة للبحث أو الفلاتر الحالية.

            </p>

            <a
                href="./add-lost-found.html"
                class="add-first-report-button">

                <i class="fa-solid fa-circle-plus"></i>

                إضافة بلاغ جديد

            </a>

        </div>
    `;

}


/*
========================================
عرض رسالة خطأ
========================================
*/

function renderErrorState(
    message
) {

    if (!reportsList) {

        return;

    }

    reportsList.innerHTML = `
        <div class="lost-found-empty-state">

            <div class="lost-found-empty-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                تعذر تحميل البلاغات
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                class="add-first-report-button"
                onclick="window.location.reload()">

                <i class="fa-solid fa-rotate"></i>

                إعادة المحاولة

            </button>

        </div>
    `;

}


/*
========================================
عرض البلاغات
========================================
*/

function renderReports(reports) {

    if (!reportsList) {

        return;

    }

    reportsList.innerHTML = "";

    if (
        !Array.isArray(reports) ||
        reports.length === 0
    ) {

        renderEmptyState();

        if (reportsCount) {

            reportsCount.textContent =
                "0";

        }

        return;

    }

    const fragment =
        document.createDocumentFragment();

    reports.forEach((report) => {

        const wrapper =
            document.createElement("div");

        wrapper.innerHTML =
            createReportCard(
                report
            ).trim();

        const card =
            wrapper.firstElementChild;

        if (card) {

            fragment.appendChild(card);

        }

    });

    reportsList.appendChild(
        fragment
    );

    if (reportsCount) {

        reportsCount.textContent =
            String(reports.length);

    }

}


/*
========================================
تطبيق البحث والفلاتر
========================================
*/

function applyFilters() {

    const searchValue =
        normalizeArabicText(
            searchInput?.value || ""
        );

    const selectedVillage =
        villageFilter?.value || "";

    const selectedCategory =
        categoryFilter?.value || "";

    const filteredReports =
        allReports.filter(
            (report) => {

                const searchableText =
                    normalizeArabicText(
                        [
                            report.title,
                            report.description,
                            report.category,
                            report.village,
                            report.location,
                            report.reporterName
                        ].join(" ")
                    );

                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );

                const matchesVillage =
                    !selectedVillage ||
                    report.village ===
                        selectedVillage;

                const matchesCategory =
                    !selectedCategory ||
                    report.category ===
                        selectedCategory;

                let matchesType = true;

                if (
                    activeTypeFilter ===
                    "lost"
                ) {

                    matchesType =
                        report.type ===
                            "lost" &&
                        report.status !==
                            "resolved";

                }

                if (
                    activeTypeFilter ===
                    "found"
                ) {

                    matchesType =
                        report.type ===
                            "found" &&
                        report.status !==
                            "resolved";

                }

                if (
                    activeTypeFilter ===
                    "resolved"
                ) {

                    matchesType =
                        report.status ===
                        "resolved";

                }

                return (
                    matchesSearch &&
                    matchesVillage &&
                    matchesCategory &&
                    matchesType
                );

            }
        );

    renderReports(
        filteredReports
    );

}


/*
========================================
أزرار الفلاتر
========================================
*/

filterButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    (currentButton) => {

                        currentButton
                            .classList
                            .remove(
                                "active"
                            );

                    }
                );

                button.classList.add(
                    "active"
                );

                activeTypeFilter =
                    button.dataset.filter ||
                    "all";

                applyFilters();

            }
        );

    }
);


/*
========================================
تشغيل البحث
========================================
*/

searchInput?.addEventListener(
    "input",
    applyFilters
);

searchInput?.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            applyFilters();

        }

    }
);

searchButton?.addEventListener(
    "click",
    applyFilters
);

villageFilter?.addEventListener(
    "change",
    applyFilters
);

categoryFilter?.addEventListener(
    "change",
    applyFilters
);


/*
========================================
الاستماع لبلاغات Firestore
========================================
*/

function listenForReports() {

    renderLoadingState();

    const reportsQuery =
        query(
            collection(
                db,
                "lostFoundReports"
            ),
            where(
                "status",
                "in",
                [
                    "approved",
                    "resolved"
                ]
            )
        );

    onSnapshot(

        reportsQuery,

        (snapshot) => {

            allReports =
                snapshot.docs.map(
                    (documentSnapshot) => {

                        return {

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        };

                    }
                );


            allReports.sort(
                (
                    firstReport,
                    secondReport
                ) => {

                    const firstTime =
                        getTimestampMilliseconds(
                            firstReport.createdAt
                        );

                    const secondTime =
                        getTimestampMilliseconds(
                            secondReport.createdAt
                        );

                    return (
                        secondTime -
                        firstTime
                    );

                }
            );


            applyFilters();

        },

        (error) => {

            console.error(
                "تعذر قراءة البلاغات:",
                error
            );

            let message =
                "حدث خطأ أثناء الاتصال بقاعدة البيانات.";

            if (
                error?.code ===
                "permission-denied"
            ) {

                message =
                    "تم رفض قراءة البلاغات. تأكد من نشر قواعد Firestore الجديدة.";

            }

            if (
                error?.code ===
                "unavailable"
            ) {

                message =
                    "خدمة Firebase غير متاحة مؤقتًا أو لا يوجد اتصال بالإنترنت.";

            }

            renderErrorState(
                message
            );

            if (reportsCount) {

                reportsCount.textContent =
                    "0";

            }

        }

    );

}

listenForReports();


/*
========================================
تثبيت التطبيق
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


installAppBtn?.addEventListener(
    "click",
    async () => {

        if (!deferredInstallPrompt) {

            alert(
                "افتح قائمة المتصفح واختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية."
            );

            return;

        }

        deferredInstallPrompt.prompt();

        await deferredInstallPrompt
            .userChoice;

        deferredInstallPrompt =
            null;

        installAppBtn.hidden =
            true;

    }
);


/*
========================================
Service Worker
========================================
*/

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

        await registration.update();

        if (
            registration.waiting &&
            navigator
                .serviceWorker
                .controller &&
            updateNotification
        ) {

            updateNotification.hidden =
                false;

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
                                .controller &&
                            updateNotification
                        ) {

                            updateNotification.hidden =
                                false;

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


window.addEventListener(
    "load",
    registerServiceWorker
);


updateAppBtn?.addEventListener(
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
                registration?.waiting
            ) {

                registration
                    .waiting
                    .postMessage({

                        type:
                            "SKIP_WAITING"

                    });

                return;

            }

            window.location.reload();

        } catch (error) {

            console.error(
                "تعذر تحديث التطبيق:",
                error
            );

            window.location.reload();

        }

    }
);


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

                refreshing = true;

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


window.addEventListener(
    "online",
    updateOnlineStatus
);

window.addEventListener(
    "offline",
    updateOnlineStatus
);

updateOnlineStatus();