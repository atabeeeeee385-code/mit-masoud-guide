/*
========================================
صفحة البحث في القرى والخدمات
========================================
*/

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*
========================================
قرى مركز شبين الكوم
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
    document.getElementById(
        "villagesContainer"
    );

const searchInput =
    document.getElementById(
        "villageSearch"
    );

const searchButton =
    document.getElementById(
        "searchButton"
    );


/*
========================================
بيانات الخدمات
========================================
*/

let approvedServices = [];

let servicesLoaded = false;


/*
========================================
حماية النص
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
اسم القسم
========================================
*/

function getCategoryName(category) {

    const categories = {

        health:
            "الصحة والطوارئ",

        pharmacy:
            "الصيدليات",

        education:
            "التعليم والمدرسين",

        home:
            "المنزل والصيانة",

        construction:
            "البناء والتشطيبات",

        cars:
            "السيارات والمواصلات",

        food:
            "الطعام والديليفري",

        shipping:
            "الشحن والتوصيل",

        shops:
            "المحلات والتجارة",

        personal:
            "الخدمات الشخصية",

        charity:
            "العمل الخيري",

        agriculture:
            "الزراعة والبيطرة",

        technology:
            "التكنولوجيا والصيانة",

        legal:
            "المحاماة والمحاسبة",

        events:
            "المناسبات والتصوير",

        jobs:
            "الوظائف والتدريب",

        government:
            "الخدمات الحكومية",

        general:
            "خدمات عامة"

    };

    return (
        categories[category] ||
        "خدمات عامة"
    );

}


/*
========================================
تنظيف رقم الهاتف
========================================
*/

function cleanPhoneNumber(phone) {

    return String(phone || "")
        .replace(/[^\d+]/g, "");

}


/*
========================================
تنظيف رقم واتساب
========================================
*/

function cleanWhatsAppNumber(phone) {

    let number =
        String(phone || "")
            .replace(/\D/g, "");

    if (number.startsWith("00")) {

        number =
            number.slice(2);

    }

    if (number.startsWith("0")) {

        number =
            `20${number.slice(1)}`;

    }

    return number;

}


/*
========================================
إنشاء كارت قرية
========================================
*/

function createVillageCard(village) {

    return `
        <a
            class="service-card village-search-result"
            href="./village.html?village=${encodeURIComponent(
                village
            )}">

            <h3>
                🏘️ ${escapeHTML(village)}
            </h3>

            <p>
                عرض جميع خدمات القرية
            </p>

            <div class="buttons">

                <span class="call">
                    دخول
                </span>

            </div>

        </a>
    `;

}


/*
========================================
إنشاء كارت خدمة
========================================
*/

function createServiceCard(service) {

    const serviceName =
        service.name ||
        "مقدم خدمة";

    const serviceJob =
        service.job ||
        "خدمة عامة";

    const serviceVillage =
        service.village ||
        "غير محددة";

    const phone =
        cleanPhoneNumber(
            service.phone
        );

    const whatsapp =
        cleanWhatsAppNumber(
            service.whatsapp ||
            service.phone
        );

    const callButton =
        phone
            ? `
                <a
                    href="tel:${escapeHTML(phone)}"
                    class="call">

                    📞 اتصال

                </a>
            `
            : "";

    const whatsappButton =
        whatsapp
            ? `
                <a
                    href="https://wa.me/${escapeHTML(
                        whatsapp
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="whatsapp">

                    💬 واتساب

                </a>
            `
            : "";

    return `
        <article class="service-card service-search-result">

            <h3>
                👤 ${escapeHTML(serviceName)}
            </h3>

            <p>
                🔧 ${escapeHTML(serviceJob)}
            </p>

            <p>
                📂 ${escapeHTML(
                    getCategoryName(
                        service.category
                    )
                )}
            </p>

            <p>
                🏘️ ${escapeHTML(
                    serviceVillage
                )}
            </p>

            ${
                service.description
                    ? `
                        <p>
                            📝 ${escapeHTML(
                                service.description
                            )}
                        </p>
                    `
                    : ""
            }

            <div class="buttons">

                ${callButton}

                ${whatsappButton}

            </div>

            <div class="buttons">

                <a
                    href="./service.html?id=${encodeURIComponent(
                        service.id
                    )}&village=${encodeURIComponent(
                        serviceVillage
                    )}"
                    class="details-btn">

                    عرض التفاصيل

                </a>

                <a
                    href="./village.html?village=${encodeURIComponent(
                        serviceVillage
                    )}"
                    class="share">

                    خدمات القرية

                </a>

            </div>

        </article>
    `;

}


/*
========================================
عرض الصفحة الرئيسية للقرى
========================================
*/

function renderAllVillages() {

    if (!villagesContainer) {

        return;

    }

    villagesContainer.innerHTML =
        villages
            .map(createVillageCard)
            .join("");

}


/*
========================================
رسالة التحميل
========================================
*/

function renderLoading() {

    if (!villagesContainer) {

        return;

    }

    villagesContainer.innerHTML = `
        <div class="no-results">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <h3>
                جاري البحث...
            </h3>

        </div>
    `;

}


/*
========================================
عدم وجود نتائج
========================================
*/

function renderNoResults(searchValue) {

    if (!villagesContainer) {

        return;

    }

    villagesContainer.innerHTML = `
        <div class="no-results">

            <i class="fa-solid fa-magnifying-glass"></i>

            <h3>
                لا توجد نتائج مطابقة
            </h3>

            <p>
                لم نعثر على قرية أو خدمة باسم
                «${escapeHTML(searchValue)}»
            </p>

        </div>
    `;

}


/*
========================================
تحميل الخدمات المقبولة
========================================
*/

async function loadApprovedServices() {

    if (servicesLoaded) {

        return;

    }

    const servicesQuery =
        query(
            collection(
                db,
                "services"
            ),
            where(
                "status",
                "==",
                "approved"
            )
        );

    const snapshot =
        await getDocs(
            servicesQuery
        );

    approvedServices =
        snapshot.docs.map(
            (documentSnapshot) => {

                return {

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                };

            }
        );

    servicesLoaded = true;

}


/*
========================================
البحث في القرى والخدمات
========================================
*/

async function searchVillagesAndServices() {

    const originalSearchValue =
        searchInput?.value.trim() ||
        "";

    const searchValue =
        normalizeArabicText(
            originalSearchValue
        );

    if (!searchValue) {

        renderAllVillages();

        return;

    }

    renderLoading();

    try {

        await loadApprovedServices();

        const matchedVillages =
            villages.filter(
                (village) => {

                    return normalizeArabicText(
                        village
                    ).includes(
                        searchValue
                    );

                }
            );

        const matchedServices =
            approvedServices.filter(
                (service) => {

                    const searchableText =
                        normalizeArabicText(
                            [
                                service.name,
                                service.job,
                                service.category,
                                getCategoryName(
                                    service.category
                                ),
                                service.village,
                                service.address,
                                service.description
                            ].join(" ")
                        );

                    return searchableText.includes(
                        searchValue
                    );

                }
            );

        if (
            matchedVillages.length === 0 &&
            matchedServices.length === 0
        ) {

            renderNoResults(
                originalSearchValue
            );

            return;

        }

        let resultsHTML = "";

        if (
            matchedVillages.length > 0
        ) {

            resultsHTML += `
                <div
                    class="section-title"
                    style="grid-column: 1 / -1;">

                    <span>
                        نتائج القرى
                    </span>

                    <h2>
                        القرى المطابقة
                    </h2>

                </div>
            `;

            resultsHTML +=
                matchedVillages
                    .map(createVillageCard)
                    .join("");

        }

        if (
            matchedServices.length > 0
        ) {

            resultsHTML += `
                <div
                    class="section-title"
                    style="
                        grid-column: 1 / -1;
                        margin-top: 25px;
                    ">

                    <span>
                        نتائج الخدمات
                    </span>

                    <h2>
                        الخدمات المطابقة
                    </h2>

                </div>
            `;

            resultsHTML +=
                matchedServices
                    .map(createServiceCard)
                    .join("");

        }

        villagesContainer.innerHTML =
            resultsHTML;

    } catch (error) {

        console.error(
            "تعذر البحث:",
            error
        );

        villagesContainer.innerHTML = `
            <div class="no-results">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    تعذر تنفيذ البحث
                </h3>

                <p>
                    تأكد من اتصال الإنترنت وحاول مرة أخرى.
                </p>

            </div>
        `;

    }

}


/*
========================================
أحداث البحث
========================================
*/

searchInput?.addEventListener(
    "input",
    () => {

        window.clearTimeout(
            searchInput.searchTimer
        );

        searchInput.searchTimer =
            window.setTimeout(
                searchVillagesAndServices,
                350
            );

    }
);


searchInput?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchVillagesAndServices();

        }

    }
);


searchButton?.addEventListener(
    "click",
    searchVillagesAndServices
);


/*
========================================
استقبال البحث من الصفحة الرئيسية
========================================
*/

const incomingSearch =
    new URLSearchParams(
        window.location.search
    ).get("search");

if (
    incomingSearch &&
    searchInput
) {

    searchInput.value =
        incomingSearch;

    searchVillagesAndServices();

} else {

    renderAllVillages();

}