/*
========================================
لوحة إدارة دليل شبين
الجزء 1 من 4
========================================
*/

import {
    db,
    auth
} from "./firebase.js";

import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


/*
========================================
بيانات المدير
========================================
*/

const ADMIN_EMAIL =
    "admin@metmasoud.com";


/*
========================================
عناصر إدارة الخدمات
========================================
*/

const pendingList =
    document.getElementById(
        "pendingList"
    );

const approvedList =
    document.getElementById(
        "approvedList"
    );

const rejectedList =
    document.getElementById(
        "rejectedList"
    );

const villageFilter =
    document.getElementById(
        "villageFilter"
    );

const adminSearch =
    document.getElementById(
        "adminSearch"
    );

const updateOldServicesButton =
    document.getElementById(
        "updateOldServicesButton"
    );

const refreshAdminButton =
    document.getElementById(
        "refreshAdminButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const adminMessage =
    document.getElementById(
        "adminMessage"
    );


/*
========================================
عدادات الخدمات
========================================
*/

const totalCount =
    document.getElementById(
        "totalCount"
    );

const pendingCount =
    document.getElementById(
        "pendingCount"
    );

const approvedCount =
    document.getElementById(
        "approvedCount"
    );

const rejectedCount =
    document.getElementById(
        "rejectedCount"
    );

const villagesCount =
    document.getElementById(
        "villagesCount"
    );


/*
========================================
عناصر إدارة البلاغات
========================================
*/

const pendingReportsList =
    document.getElementById(
        "pendingReportsList"
    );

const approvedReportsList =
    document.getElementById(
        "approvedReportsList"
    );

const resolvedReportsList =
    document.getElementById(
        "resolvedReportsList"
    );

const rejectedReportsList =
    document.getElementById(
        "rejectedReportsList"
    );

const adminReportsSearch =
    document.getElementById(
        "adminReportsSearch"
    );

const adminReportsVillageFilter =
    document.getElementById(
        "adminReportsVillageFilter"
    );


/*
========================================
عدادات البلاغات
========================================
*/

const totalReportsCount =
    document.getElementById(
        "totalReportsCount"
    );

const pendingReportsCount =
    document.getElementById(
        "pendingReportsCount"
    );

const approvedReportsCount =
    document.getElementById(
        "approvedReportsCount"
    );

const resolvedReportsCount =
    document.getElementById(
        "resolvedReportsCount"
    );


/*
========================================
التبويبات
========================================
*/

const adminTabButtons =
    document.querySelectorAll(
        ".admin-tab-button"
    );

const servicesAdminPanel =
    document.getElementById(
        "servicesAdminPanel"
    );

const reportsAdminPanel =
    document.getElementById(
        "reportsAdminPanel"
    );


/*
========================================
متغيرات البيانات
========================================
*/

let services = [];

let reports = [];

let isAuthenticated = false;

let isLoadingServices = false;

let isLoadingReports = false;


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
تنسيق النص العربي
========================================
*/

function normalizeArabicText(value) {

    return String(value ?? "")
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

        return String(dateValue);

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

    const parsedTime =
        new Date(timestamp).getTime();

    return Number.isNaN(parsedTime)
        ? 0
        : parsedTime;

}


/*
========================================
اسم قسم الخدمة
========================================
*/

function getCategoryName(category) {

    const categories = {

        health:
            "🏥 الصحة والطوارئ",

        pharmacy:
            "💊 الصيدليات",

        education:
            "🎓 التعليم والمدرسين",

        home:
            "🏠 المنزل والصيانة",

        construction:
            "🏗️ البناء والتشطيبات",

        cars:
            "🚗 السيارات والمواصلات",

        food:
            "🍔 الطعام والديليفري",

        shipping:
            "📦 الشحن والتوصيل",

        shops:
            "🛒 المحلات والتجارة",

        personal:
            "💇 الخدمات الشخصية",

        charity:
            "❤️ العمل الخيري",

        agriculture:
            "🌾 الزراعة والبيطرة",

        technology:
            "💻 التكنولوجيا والصيانة",

        legal:
            "⚖️ المحاماة والمحاسبة",

        events:
            "🎉 المناسبات والتصوير",

        jobs:
            "💼 الوظائف والتدريب",

        government:
            "🏛️ الخدمات الحكومية",

        general:
            "⭐ خدمات عامة"

    };

    return (
        categories[category] ||
        "بدون قسم"
    );

}


/*
========================================
رسائل لوحة الإدارة
========================================
*/

function showAdminMessage(
    message,
    type = "success"
) {

    if (!adminMessage) {

        return;

    }

    adminMessage.textContent =
        message;

    adminMessage.className =
        `admin-message ${type}`.trim();

}


/*
========================================
حالة تحميل الخدمات
========================================
*/

function showServicesLoading() {

    const loadingHTML = `
        <div class="service-card">

            <h3>
                <i class="fa-solid fa-spinner fa-spin"></i>
                جاري تحميل الخدمات...
            </h3>

        </div>
    `;

    if (pendingList) {

        pendingList.innerHTML =
            loadingHTML;

    }

    if (approvedList) {

        approvedList.innerHTML =
            loadingHTML;

    }

    if (rejectedList) {

        rejectedList.innerHTML =
            loadingHTML;

    }

}


/*
========================================
حالة تحميل البلاغات
========================================
*/

function showReportsLoading() {

    const loadingHTML = `
        <div class="service-card">

            <h3>
                <i class="fa-solid fa-spinner fa-spin"></i>
                جاري تحميل البلاغات...
            </h3>

        </div>
    `;

    if (pendingReportsList) {

        pendingReportsList.innerHTML =
            loadingHTML;

    }

    if (approvedReportsList) {

        approvedReportsList.innerHTML =
            loadingHTML;

    }

    if (resolvedReportsList) {

        resolvedReportsList.innerHTML =
            loadingHTML;

    }

    if (rejectedReportsList) {

        rejectedReportsList.innerHTML =
            loadingHTML;

    }

}


/*
========================================
التحقق من تسجيل المدير
========================================
*/

onAuthStateChanged(
    auth,
    async (user) => {

        if (
            !user ||
            user.email !== ADMIN_EMAIL
        ) {

            if (user) {

                await signOut(auth);

            }

            window.location.replace(
                "./admin-login.html"
            );

            return;

        }

        isAuthenticated = true;

        await loadAdminData();

    }
);


/*
========================================
تحميل كل بيانات لوحة الإدارة
========================================
*/

async function loadAdminData() {

    if (!isAuthenticated) {

        return;

    }

    showAdminMessage(
        "جاري تحميل بيانات لوحة الإدارة...",
        "loading"
    );

    await Promise.all([
        loadServices(),
        loadReports()
    ]);

    showAdminMessage(
        "تم تحديث بيانات لوحة الإدارة.",
        "success"
    );

}


/*
========================================
تحميل الخدمات
========================================
*/

async function loadServices() {

    if (
        !isAuthenticated ||
        isLoadingServices
    ) {

        return;

    }

    isLoadingServices = true;

    showServicesLoading();

    try {

        services = [];

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "services"
                )
            );

        snapshot.forEach(
            (documentSnapshot) => {

                services.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );

        services.sort(
            (
                firstService,
                secondService
            ) => {

                return (
                    getTimestampMilliseconds(
                        secondService.createdAt
                    ) -
                    getTimestampMilliseconds(
                        firstService.createdAt
                    )
                );

            }
        );

        loadServiceVillages();

        updateServiceStats();

        filterServices();

    } catch (error) {

        console.error(
            "تعذر تحميل الخدمات:",
            error
        );

        showAdminMessage(
            "حدث خطأ أثناء تحميل الخدمات.",
            "error"
        );

    } finally {

        isLoadingServices = false;

    }

}


/*
========================================
تحميل البلاغات
========================================
*/

async function loadReports() {

    if (
        !isAuthenticated ||
        isLoadingReports
    ) {

        return;

    }

    isLoadingReports = true;

    showReportsLoading();

    try {

        reports = [];

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "lostFoundReports"
                )
            );

        snapshot.forEach(
            (documentSnapshot) => {

                reports.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );

        reports.sort(
            (
                firstReport,
                secondReport
            ) => {

                return (
                    getTimestampMilliseconds(
                        secondReport.createdAt
                    ) -
                    getTimestampMilliseconds(
                        firstReport.createdAt
                    )
                );

            }
        );

        loadReportVillages();

        updateReportStats();

        filterReports();

    } catch (error) {

        console.error(
            "تعذر تحميل البلاغات:",
            error
        );

        showAdminMessage(
            "حدث خطأ أثناء تحميل البلاغات.",
            "error"
        );

    } finally {

        isLoadingReports = false;

    }

}
/*
========================================
تحميل قرى الخدمات داخل الفلتر
========================================
*/

function loadServiceVillages() {

    if (!villageFilter) {

        return;

    }

    const selectedVillage =
        villageFilter.value;

    villageFilter.innerHTML = `
        <option value="">
            كل القرى
        </option>
    `;

    const serviceVillages = [
        ...new Set(
            services
                .map(
                    (service) =>
                        service.village
                )
                .filter(Boolean)
        )
    ].sort(
        (firstVillage, secondVillage) =>
            firstVillage.localeCompare(
                secondVillage,
                "ar"
            )
    );

    serviceVillages.forEach(
        (village) => {

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

        }
    );

    if (
        serviceVillages.includes(
            selectedVillage
        )
    ) {

        villageFilter.value =
            selectedVillage;

    }

}


/*
========================================
تحميل قرى البلاغات داخل الفلتر
========================================
*/

function loadReportVillages() {

    if (!adminReportsVillageFilter) {

        return;

    }

    const selectedVillage =
        adminReportsVillageFilter.value;

    adminReportsVillageFilter.innerHTML = `
        <option value="">
            كل القرى
        </option>
    `;

    const reportVillages = [
        ...new Set(
            reports
                .map(
                    (report) =>
                        report.village
                )
                .filter(Boolean)
        )
    ].sort(
        (firstVillage, secondVillage) =>
            firstVillage.localeCompare(
                secondVillage,
                "ar"
            )
    );

    reportVillages.forEach(
        (village) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                village;

            option.textContent =
                village;

            adminReportsVillageFilter
                .appendChild(option);

        }
    );

    if (
        reportVillages.includes(
            selectedVillage
        )
    ) {

        adminReportsVillageFilter.value =
            selectedVillage;

    }

}


/*
========================================
تحديث إحصائيات الخدمات
========================================
*/

function updateServiceStats() {

    if (totalCount) {

        totalCount.textContent =
            String(services.length);

    }

    if (pendingCount) {

        pendingCount.textContent =
            String(
                services.filter(
                    (service) =>
                        service.status ===
                        "pending"
                ).length
            );

    }

    if (approvedCount) {

        approvedCount.textContent =
            String(
                services.filter(
                    (service) =>
                        service.status ===
                        "approved"
                ).length
            );

    }

    if (rejectedCount) {

        rejectedCount.textContent =
            String(
                services.filter(
                    (service) =>
                        service.status ===
                        "rejected"
                ).length
            );

    }

    if (villagesCount) {

        villagesCount.textContent =
            String(
                new Set(
                    services
                        .map(
                            (service) =>
                                service.village
                        )
                        .filter(Boolean)
                ).size
            );

    }

}


/*
========================================
تحديث إحصائيات البلاغات
========================================
*/

function updateReportStats() {

    if (totalReportsCount) {

        totalReportsCount.textContent =
            String(reports.length);

    }

    if (pendingReportsCount) {

        pendingReportsCount.textContent =
            String(
                reports.filter(
                    (report) =>
                        report.status ===
                        "pending"
                ).length
            );

    }

    if (approvedReportsCount) {

        approvedReportsCount.textContent =
            String(
                reports.filter(
                    (report) =>
                        report.status ===
                        "approved"
                ).length
            );

    }

    if (resolvedReportsCount) {

        resolvedReportsCount.textContent =
            String(
                reports.filter(
                    (report) =>
                        report.status ===
                        "resolved"
                ).length
            );

    }

}


/*
========================================
فلترة الخدمات
========================================
*/

function filterServices() {

    const selectedVillage =
        villageFilter?.value || "";

    const searchValue =
        normalizeArabicText(
            adminSearch?.value || ""
        );

    const filteredServices =
        services.filter(
            (service) => {

                const matchesVillage =
                    !selectedVillage ||
                    service.village ===
                        selectedVillage;

                const searchableText =
                    normalizeArabicText(
                        [
                            service.name,
                            service.job,
                            service.village,
                            service.phone,
                            service.address,
                            service.description,
                            getCategoryName(
                                service.category
                            )
                        ].join(" ")
                    );

                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );

                return (
                    matchesVillage &&
                    matchesSearch
                );

            }
        );

    displayServices(
        filteredServices.filter(
            (service) =>
                service.status ===
                "pending"
        ),
        pendingList,
        "pending"
    );

    displayServices(
        filteredServices.filter(
            (service) =>
                service.status ===
                "approved"
        ),
        approvedList,
        "approved"
    );

    displayServices(
        filteredServices.filter(
            (service) =>
                service.status ===
                "rejected"
        ),
        rejectedList,
        "rejected"
    );

}


/*
========================================
فلترة البلاغات
========================================
*/

function filterReports() {

    const selectedVillage =
        adminReportsVillageFilter
            ?.value || "";

    const searchValue =
        normalizeArabicText(
            adminReportsSearch?.value || ""
        );

    const filteredReports =
        reports.filter(
            (report) => {

                const matchesVillage =
                    !selectedVillage ||
                    report.village ===
                        selectedVillage;

                const searchableText =
                    normalizeArabicText(
                        [
                            report.title,
                            report.description,
                            report.category,
                            report.village,
                            report.location,
                            report.phone,
                            report.reporterName,
                            report.type,
                            report.status
                        ].join(" ")
                    );

                const matchesSearch =
                    !searchValue ||
                    searchableText.includes(
                        searchValue
                    );

                return (
                    matchesVillage &&
                    matchesSearch
                );

            }
        );

    displayReports(
        filteredReports.filter(
            (report) =>
                report.status ===
                "pending"
        ),
        pendingReportsList,
        "pending"
    );

    displayReports(
        filteredReports.filter(
            (report) =>
                report.status ===
                "approved"
        ),
        approvedReportsList,
        "approved"
    );

    displayReports(
        filteredReports.filter(
            (report) =>
                report.status ===
                "resolved"
        ),
        resolvedReportsList,
        "resolved"
    );

    displayReports(
        filteredReports.filter(
            (report) =>
                report.status ===
                "rejected"
        ),
        rejectedReportsList,
        "rejected"
    );

}


/*
========================================
عرض الخدمات
========================================
*/

function displayServices(
    data,
    container,
    status
) {

    if (!container) {

        return;

    }

    container.innerHTML = "";

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const messages = {

            pending:
                "لا توجد خدمات معلقة ⏳",

            approved:
                "لا توجد خدمات مقبولة ✅",

            rejected:
                "لا توجد خدمات مرفوضة ❌"

        };

        container.innerHTML = `
            <div class="service-card">

                <h3>
                    ${messages[status]}
                </h3>

            </div>
        `;

        return;

    }

    const fragment =
        document.createDocumentFragment();

    data.forEach(
        (service) => {

            fragment.appendChild(
                createAdminServiceCard(
                    service,
                    status
                )
            );

        }
    );

    container.appendChild(
        fragment
    );

}


/*
========================================
قائمة أقسام الخدمات
========================================
*/

function createCategorySelect(service) {

    const categories = [

        [
            "health",
            "🏥 الصحة والطوارئ"
        ],

        [
            "pharmacy",
            "💊 الصيدليات"
        ],

        [
            "education",
            "🎓 التعليم والمدرسين"
        ],

        [
            "home",
            "🏠 المنزل والصيانة"
        ],

        [
            "construction",
            "🏗️ البناء والتشطيبات"
        ],

        [
            "cars",
            "🚗 السيارات والمواصلات"
        ],

        [
            "food",
            "🍔 الطعام والديليفري"
        ],

        [
            "shipping",
            "📦 الشحن والتوصيل"
        ],

        [
            "shops",
            "🛒 المحلات والتجارة"
        ],

        [
            "personal",
            "💇 الخدمات الشخصية"
        ],

        [
            "charity",
            "❤️ العمل الخيري"
        ],

        [
            "agriculture",
            "🌾 الزراعة والبيطرة"
        ],

        [
            "technology",
            "💻 التكنولوجيا والصيانة"
        ],

        [
            "legal",
            "⚖️ المحاماة والمحاسبة"
        ],

        [
            "events",
            "🎉 المناسبات والتصوير"
        ],

        [
            "jobs",
            "💼 الوظائف والتدريب"
        ],

        [
            "government",
            "🏛️ الخدمات الحكومية"
        ],

        [
            "general",
            "⭐ خدمات عامة"
        ]

    ];

    const options =
        categories
            .map(
                ([value, title]) => `
                    <option
                        value="${value}"
                        ${
                            service.category ===
                            value
                                ? "selected"
                                : ""
                        }>

                        ${title}

                    </option>
                `
            )
            .join("");

    return `
        <label>
            القسم
        </label>

        <select
            class="service-category-select">

            <option value="">
                اختر القسم
            </option>

            ${options}

        </select>
    `;

}


/*
========================================
إنشاء كارت خدمة للإدارة
========================================
*/

function createAdminServiceCard(
    service,
    status
) {

    const card =
        document.createElement("article");

    card.className =
        "service-card admin-service-card";

    card.innerHTML = `

        <div class="admin-card-status ${escapeHTML(status)}">

            ${
                status === "pending"
                    ? "معلقة"
                    : status === "approved"
                        ? "مقبولة"
                        : "مرفوضة"
            }

        </div>

        <h3>

            <i class="fa-solid fa-user"></i>

            ${escapeHTML(
                service.name ||
                "بدون اسم"
            )}

        </h3>

        <p>

            <i class="fa-solid fa-screwdriver-wrench"></i>

            ${escapeHTML(
                service.job ||
                "بدون مهنة"
            )}

        </p>

        <p>

            <i class="fa-solid fa-location-dot"></i>

            ${escapeHTML(
                service.village ||
                "غير محددة"
            )}

        </p>

        <p>

            <i class="fa-solid fa-phone"></i>

            ${escapeHTML(
                service.phone ||
                "غير متوفر"
            )}

        </p>

        <p>

            <i class="fa-solid fa-folder"></i>

            ${escapeHTML(
                getCategoryName(
                    service.category
                )
            )}

        </p>

        <p>

            <i class="fa-solid fa-eye"></i>

            ${
                service.type === "global"
                    ? "تظهر في كل القرى"
                    : "تظهر داخل القرية فقط"
            }

        </p>

        ${
            service.address
                ? `
                    <p>

                        <i class="fa-solid fa-map-pin"></i>

                        ${escapeHTML(
                            service.address
                        )}

                    </p>
                `
                : ""
        }

        ${
            status === "pending"
                ? `
                    ${createCategorySelect(
                        service
                    )}

                    <div class="buttons">

                        <button
                            type="button"
                            class="call save-category-button">

                            حفظ القسم

                        </button>

                        <button
                            type="button"
                            class="call make-global-button">

                            كل القرى

                        </button>

                        <button
                            type="button"
                            class="call approve-button">

                            قبول

                        </button>

                        <button
                            type="button"
                            class="call reject-button">

                            رفض

                        </button>

                        <button
                            type="button"
                            class="call delete-button">

                            حذف

                        </button>

                    </div>
                `
                : ""
        }

        ${
            status === "approved"
                ? `
                    <div class="buttons">

                        <a
                            class="details-btn"
                            href="./service.html?id=${encodeURIComponent(
                                service.id
                            )}"
                            target="_blank"
                            rel="noopener noreferrer">

                            عرض

                        </a>

                        <button
                            type="button"
                            class="call make-global-button">

                            كل القرى

                        </button>

                        <button
                            type="button"
                            class="call make-village-button">

                            قرية فقط

                        </button>

                        <button
                            type="button"
                            class="call reject-button">

                            رفض

                        </button>

                        <button
                            type="button"
                            class="call delete-button">

                            حذف

                        </button>

                    </div>
                `
                : ""
        }

        ${
            status === "rejected"
                ? `
                    <div class="buttons">

                        <button
                            type="button"
                            class="call approve-button">

                            قبول مرة أخرى

                        </button>

                        <button
                            type="button"
                            class="call delete-button">

                            حذف نهائيًا

                        </button>

                    </div>
                `
                : ""
        }
    `;

    bindServiceCardActions(
        card,
        service
    );

    return card;

}
/*
========================================
ربط أزرار كارت الخدمة
========================================
*/

function bindServiceCardActions(
    card,
    service
) {

    card
        .querySelector(
            ".save-category-button"
        )
        ?.addEventListener(
            "click",
            async () => {

                const category =
                    card.querySelector(
                        ".service-category-select"
                    )?.value;

                if (!category) {

                    alert(
                        "اختر القسم أولًا."
                    );

                    return;

                }

                try {

                    await updateDoc(
                        doc(
                            db,
                            "services",
                            service.id
                        ),
                        {
                            category
                        }
                    );

                    showAdminMessage(
                        "تم حفظ قسم الخدمة.",
                        "success"
                    );

                    await loadServices();

                } catch (error) {

                    console.error(error);

                    showAdminMessage(
                        "تعذر حفظ القسم.",
                        "error"
                    );

                }

            }
        );


    card
        .querySelector(
            ".make-global-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeServiceType(
                    service.id,
                    "global"
                );

            }
        );


    card
        .querySelector(
            ".make-village-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeServiceType(
                    service.id,
                    "village"
                );

            }
        );


    card
        .querySelector(
            ".approve-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeServiceStatus(
                    service.id,
                    "approved"
                );

            }
        );


    card
        .querySelector(
            ".reject-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeServiceStatus(
                    service.id,
                    "rejected"
                );

            }
        );


    card
        .querySelector(
            ".delete-button"
        )
        ?.addEventListener(
            "click",
            () => {

                deleteService(
                    service.id,
                    service.name
                );

            }
        );

}


/*
========================================
تغيير نوع ظهور الخدمة
========================================
*/

async function changeServiceType(
    id,
    type
) {

    const confirmed =
        confirm(
            type === "global"
                ? "هل تريد إظهار الخدمة في كل القرى؟"
                : "هل تريد إظهار الخدمة داخل قريتها فقط؟"
        );

    if (!confirmed) {

        return;

    }

    try {

        await updateDoc(
            doc(
                db,
                "services",
                id
            ),
            {
                type
            }
        );

        showAdminMessage(
            "تم تغيير نوع ظهور الخدمة.",
            "success"
        );

        await loadServices();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "تعذر تغيير نوع ظهور الخدمة.",
            "error"
        );

    }

}


/*
========================================
تغيير حالة الخدمة
========================================
*/

async function changeServiceStatus(
    id,
    status
) {

    const message =
        status === "approved"
            ? "هل تريد قبول الخدمة؟"
            : "هل تريد رفض الخدمة؟";

    if (!confirm(message)) {

        return;

    }

    try {

        await updateDoc(
            doc(
                db,
                "services",
                id
            ),
            {
                status
            }
        );

        showAdminMessage(
            status === "approved"
                ? "تم قبول الخدمة."
                : "تم رفض الخدمة.",
            "success"
        );

        await loadServices();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "تعذر تحديث حالة الخدمة.",
            "error"
        );

    }

}


/*
========================================
حذف خدمة
========================================
*/

async function deleteService(
    id,
    name
) {

    const confirmed =
        confirm(
            `هل تريد حذف خدمة ${name || ""}؟`
        );

    if (!confirmed) {

        return;

    }

    try {

        await deleteDoc(
            doc(
                db,
                "services",
                id
            )
        );

        showAdminMessage(
            "تم حذف الخدمة.",
            "success"
        );

        await loadServices();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "تعذر حذف الخدمة.",
            "error"
        );

    }

}


/*
========================================
عرض البلاغات
========================================
*/

function displayReports(
    data,
    container,
    status
) {

    if (!container) {

        return;

    }

    container.innerHTML = "";

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        const messages = {

            pending:
                "لا توجد بلاغات معلقة",

            approved:
                "لا توجد بلاغات مقبولة",

            resolved:
                "لا توجد بلاغات تم تسليمها",

            rejected:
                "لا توجد بلاغات مرفوضة"

        };

        container.innerHTML = `
            <div class="service-card">

                <h3>
                    ${messages[status]}
                </h3>

            </div>
        `;

        return;

    }

    const fragment =
        document.createDocumentFragment();

    data.forEach(
        (report) => {

            fragment.appendChild(
                createAdminReportCard(
                    report,
                    status
                )
            );

        }
    );

    container.appendChild(
        fragment
    );

}


/*
========================================
إنشاء كارت بلاغ للإدارة
========================================
*/

function createAdminReportCard(
    report,
    status
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "service-card admin-report-card";

    const typeText =
        report.type === "found"
            ? "موجود"
            : "مفقود";

    const statusText = {

        pending:
            "معلق",

        approved:
            "مقبول",

        resolved:
            "تم التسليم",

        rejected:
            "مرفوض"

    }[status] || status;

    const imageHTML =
        report.imageUrl
            ? `
                <img
                    src="${escapeHTML(
                        report.imageUrl
                    )}"
                    alt="${escapeHTML(
                        report.title
                    )}"
                    class="admin-report-image">
            `
            : "";

    card.innerHTML = `

        ${imageHTML}

        <div
            class="admin-card-status ${escapeHTML(
                status
            )}">

            ${escapeHTML(
                statusText
            )}

        </div>

        <h3>

            <i class="fa-solid fa-box-open"></i>

            ${escapeHTML(
                report.title ||
                "بدون عنوان"
            )}

        </h3>

        <p>

            <strong>
                النوع:
            </strong>

            ${escapeHTML(
                typeText
            )}

        </p>

        <p>

            <strong>
                التصنيف:
            </strong>

            ${escapeHTML(
                report.category ||
                "غير محدد"
            )}

        </p>

        <p>

            <strong>
                القرية:
            </strong>

            ${escapeHTML(
                report.village ||
                "غير محددة"
            )}

        </p>

        <p>

            <strong>
                المكان:
            </strong>

            ${escapeHTML(
                report.location ||
                "غير محدد"
            )}

        </p>

        <p>

            <strong>
                التاريخ:
            </strong>

            ${escapeHTML(
                formatDate(
                    report.date
                )
            )}

        </p>

        <p>

            <strong>
                الوصف:
            </strong>

            ${escapeHTML(
                report.description ||
                "لا يوجد وصف"
            )}

        </p>

        <p>

            <strong>
                مقدم البلاغ:
            </strong>

            ${escapeHTML(
                report.reporterName ||
                "غير محدد"
            )}

        </p>

        <p>

            <strong>
                الهاتف:
            </strong>

            ${escapeHTML(
                report.phone ||
                "غير متوفر"
            )}

        </p>

        <div class="buttons">

            ${
                status === "pending"
                    ? `
                        <button
                            type="button"
                            class="call approve-report-button">

                            قبول

                        </button>

                        <button
                            type="button"
                            class="call reject-report-button">

                            رفض

                        </button>
                    `
                    : ""
            }

            ${
                status === "approved"
                    ? `
                        <button
                            type="button"
                            class="call resolve-report-button">

                            تم التسليم

                        </button>

                        <button
                            type="button"
                            class="call reject-report-button">

                            رفض

                        </button>
                    `
                    : ""
            }

            ${
                status === "resolved"
                    ? `
                        <button
                            type="button"
                            class="call approve-report-button">

                            إعادة للنشر

                        </button>
                    `
                    : ""
            }

            ${
                status === "rejected"
                    ? `
                        <button
                            type="button"
                            class="call approve-report-button">

                            قبول مرة أخرى

                        </button>
                    `
                    : ""
            }

            <button
                type="button"
                class="call delete-report-button">

                حذف

            </button>

        </div>
    `;

    bindReportCardActions(
        card,
        report
    );

    return card;

}


/*
========================================
ربط أزرار البلاغ
========================================
*/

function bindReportCardActions(
    card,
    report
) {

    card
        .querySelector(
            ".approve-report-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeReportStatus(
                    report.id,
                    "approved"
                );

            }
        );


    card
        .querySelector(
            ".reject-report-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeReportStatus(
                    report.id,
                    "rejected"
                );

            }
        );


    card
        .querySelector(
            ".resolve-report-button"
        )
        ?.addEventListener(
            "click",
            () => {

                changeReportStatus(
                    report.id,
                    "resolved"
                );

            }
        );


    card
        .querySelector(
            ".delete-report-button"
        )
        ?.addEventListener(
            "click",
            () => {

                deleteReport(
                    report.id,
                    report.title
                );

            }
        );

}


/*
========================================
تغيير حالة البلاغ
========================================
*/

async function changeReportStatus(
    id,
    status
) {

    const messages = {

        approved:
            "هل تريد قبول هذا البلاغ؟",

        rejected:
            "هل تريد رفض هذا البلاغ؟",

        resolved:
            "هل تم تسليم الشيء إلى صاحبه؟"

    };

    if (
        !confirm(
            messages[status] ||
            "هل تريد تحديث حالة البلاغ؟"
        )
    ) {

        return;

    }

    try {

        await updateDoc(
            doc(
                db,
                "lostFoundReports",
                id
            ),
            {
                status,
                updatedAt:
                    Date.now()
            }
        );

        showAdminMessage(
            "تم تحديث حالة البلاغ.",
            "success"
        );

        await loadReports();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "تعذر تحديث حالة البلاغ.",
            "error"
        );

    }

}


/*
========================================
حذف بلاغ
========================================
*/

async function deleteReport(
    id,
    title
) {

    if (
        !confirm(
            `هل تريد حذف البلاغ: ${title || ""}؟`
        )
    ) {

        return;

    }

    try {

        await deleteDoc(
            doc(
                db,
                "lostFoundReports",
                id
            )
        );

        showAdminMessage(
            "تم حذف البلاغ.",
            "success"
        );

        await loadReports();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "تعذر حذف البلاغ.",
            "error"
        );

    }

}
/*
========================================
تحديث الخدمات القديمة
========================================
*/

async function updateOldServices() {

    if (
        !confirm(
            "هل تريد تحديث الخدمات القديمة؟"
        )
    ) {

        return;

    }

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "services"
                )
            );

        const documents =
            snapshot.docs;

        for (
            let start = 0;
            start < documents.length;
            start += 450
        ) {

            const batch =
                writeBatch(db);

            const group =
                documents.slice(
                    start,
                    start + 450
                );

            let hasUpdates =
                false;

            group.forEach(
                (documentSnapshot) => {

                    const data =
                        documentSnapshot.data();

                    const update = {};

                    if (!data.type) {

                        update.type =
                            "village";

                    }

                    if (!data.category) {

                        update.category =
                            "general";

                    }

                    if (!data.status) {

                        update.status =
                            "approved";

                    }

                    if (!data.createdAt) {

                        update.createdAt =
                            Date.now();

                    }

                    if (
                        Object.keys(update)
                            .length > 0
                    ) {

                        batch.update(
                            doc(
                                db,
                                "services",
                                documentSnapshot.id
                            ),
                            update
                        );

                        hasUpdates =
                            true;

                    }

                }
            );

            if (hasUpdates) {

                await batch.commit();

            }

        }

        showAdminMessage(
            "تم تحديث الخدمات القديمة.",
            "success"
        );

        await loadServices();

    } catch (error) {

        console.error(
            "تعذر تحديث الخدمات القديمة:",
            error
        );

        showAdminMessage(
            "حدث خطأ أثناء تحديث الخدمات القديمة.",
            "error"
        );

    }

}


/*
========================================
تبديل تبويبات الإدارة
========================================
*/

function activateAdminTab(
    tabName
) {

    adminTabButtons.forEach(
        (button) => {

            const isActive =
                button.dataset.adminTab ===
                tabName;

            button.classList.toggle(
                "active",
                isActive
            );

        }
    );

    servicesAdminPanel
        ?.classList
        .toggle(
            "active",
            tabName === "services"
        );

    reportsAdminPanel
        ?.classList
        .toggle(
            "active",
            tabName === "reports"
        );

}


adminTabButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                activateAdminTab(
                    button.dataset.adminTab ||
                    "services"
                );

            }
        );

    }
);


/*
========================================
تسجيل الخروج
========================================
*/

async function logout() {

    try {

        await signOut(auth);

        window.location.replace(
            "./admin-login.html"
        );

    } catch (error) {

        console.error(
            "تعذر تسجيل الخروج:",
            error
        );

        showAdminMessage(
            "تعذر تسجيل الخروج.",
            "error"
        );

    }

}


/*
========================================
أحداث البحث والفلترة
========================================
*/

villageFilter
    ?.addEventListener(
        "change",
        filterServices
    );

adminSearch
    ?.addEventListener(
        "input",
        filterServices
    );

adminReportsVillageFilter
    ?.addEventListener(
        "change",
        filterReports
    );

adminReportsSearch
    ?.addEventListener(
        "input",
        filterReports
    );


/*
========================================
أزرار التحكم
========================================
*/

updateOldServicesButton
    ?.addEventListener(
        "click",
        updateOldServices
    );

refreshAdminButton
    ?.addEventListener(
        "click",
        async () => {

            await loadAdminData();

        }
    );

logoutButton
    ?.addEventListener(
        "click",
        logout
    );


/*
========================================
تشغيل التبويب الافتراضي
========================================
*/

activateAdminTab(
    "services"
);