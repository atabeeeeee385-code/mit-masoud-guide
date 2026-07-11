import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


let services = [];


// عناصر الصفحة
const serviceList =
    document.getElementById("allServicesList");

const allSearch =
    document.getElementById("allSearch");

const allSearchButton =
    document.getElementById("allSearchButton");


// معرفة القرية من الرابط
const params =
    new URLSearchParams(window.location.search);

const villageName =
    params.get("village")?.trim() || "ميت مسعود";


/* =========================================
   دوال مساعدة
========================================= */


// حماية النصوص القادمة من Firebase
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// تحسين البحث في النصوص العربية
function normalizeArabicText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/[\u064B-\u065F\u0670]/g, "");
}


// تنظيف رقم الاتصال
function cleanPhoneNumber(phone) {
    return String(phone ?? "")
        .replace(/[^\d+]/g, "");
}


// تجهيز رقم واتساب المصري
function cleanWhatsAppNumber(phone) {
    let number =
        String(phone ?? "").replace(/\D/g, "");

    if (number.startsWith("00")) {
        number = number.slice(2);
    }

    if (number.startsWith("0")) {
        number = `20${number.slice(1)}`;
    }

    return number;
}


// إنشاء رابط تفاصيل الخدمة
function getServiceDetailsUrl(service) {
    return (
        `service.html?id=${encodeURIComponent(service.id)}` +
        `&village=${encodeURIComponent(villageName)}`
    );
}


/* =========================================
   تحميل الخدمات
========================================= */

async function loadServices() {

    if (!serviceList) {
        return;
    }

    serviceList.innerHTML = `
        <div class="service-card">
            <h3>جاري تحميل الخدمات...</h3>
        </div>
    `;

    try {

        services = [];

        const servicesQuery = query(
            collection(db, "services"),
            where("village", "==", villageName),
            where("type", "==", "village"),
            where("status", "==", "approved")
        );

        const querySnapshot =
            await getDocs(servicesQuery);

        querySnapshot.forEach((serviceDocument) => {

            services.push({
                id: serviceDocument.id,
                ...serviceDocument.data()
            });

        });

        services.sort((a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        );

        displayServices(services);

    } catch (error) {

        console.error(
            "حدث خطأ أثناء تحميل الخدمات:",
            error
        );

        serviceList.innerHTML = `
            <div class="service-card">

                <h3>
                    تعذر تحميل خدمات
                    ${escapeHTML(villageName)} ❌
                </h3>

                <p>
                    تأكد من اتصال الإنترنت ثم حاول مرة أخرى.
                </p>

                <button
                    type="button"
                    class="details-btn"
                    id="retryAllServicesButton"
                >
                    إعادة المحاولة
                </button>

            </div>
        `;

        const retryButton =
            document.getElementById(
                "retryAllServicesButton"
            );

        if (retryButton) {
            retryButton.addEventListener(
                "click",
                loadServices
            );
        }
    }
}


/* =========================================
   إنشاء بطاقة الخدمة
========================================= */

function createServiceCard(service) {

    const serviceName =
        service.name || "مقدم خدمة";

    const serviceJob =
        service.job || "خدمة عامة";

    const serviceAddress =
        service.address ||
        service.village ||
        villageName;

    const serviceDescription =
        service.description ||
        `خدمة داخل ${villageName}`;

    const phone =
        cleanPhoneNumber(service.phone);

    const whatsapp =
        cleanWhatsAppNumber(
            service.whatsapp ||
            service.phone
        );

    const card =
        document.createElement("div");

    card.className = "service-card";


    const callButton = phone
        ? `
            <a
                class="call"
                href="tel:${escapeHTML(phone)}"
            >
                <i
                    class="fa-solid fa-phone"
                    aria-hidden="true"
                ></i>

                اتصال
            </a>
        `
        : "";


    const whatsappButton = whatsapp
        ? `
            <a
                class="whatsapp"
                href="https://wa.me/${escapeHTML(whatsapp)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <i
                    class="fa-brands fa-whatsapp"
                    aria-hidden="true"
                ></i>

                واتساب
            </a>
        `
        : "";


    card.innerHTML = `

        <h3>
            👤 ${escapeHTML(serviceName)}
        </h3>

        <span>
            🔧 ${escapeHTML(serviceJob)}
        </span>

        <p>
            📍 ${escapeHTML(serviceAddress)}
        </p>

        <p>
            📝 ${escapeHTML(serviceDescription)}
        </p>

        ${
            callButton || whatsappButton
                ? `
                    <div class="buttons">
                        ${callButton}
                        ${whatsappButton}
                    </div>
                `
                : `
                    <p class="no-results">
                        لا توجد أرقام تواصل متاحة.
                    </p>
                `
        }

        <div class="buttons service-extra-buttons">

            <a
                class="details-btn"
                href="${getServiceDetailsUrl(service)}"
            >
                عرض التفاصيل
            </a>

            <button
                type="button"
                class="share service-share-button"
            >
                <i
                    class="fa-solid fa-share-nodes"
                    aria-hidden="true"
                ></i>

                مشاركة
            </button>

        </div>
    `;


    const shareButton =
        card.querySelector(
            ".service-share-button"
        );

    if (shareButton) {
        shareButton.addEventListener(
            "click",
            () => shareService(service, shareButton)
        );
    }

    return card;
}


/* =========================================
   عرض الخدمات
========================================= */

function displayServices(data) {

    if (!serviceList) {
        return;
    }

    serviceList.innerHTML = "";

    if (data.length === 0) {

        serviceList.innerHTML = `
            <div class="service-card">

                <h3>
                    لا توجد خدمات مطابقة في
                    ${escapeHTML(villageName)} حاليًا ❌
                </h3>

                <p>
                    ابحث بكلمة أخرى أو أضف خدمتك.
                </p>

                <a
                    class="details-btn"
                    href="add-service.html?village=${encodeURIComponent(villageName)}"
                >
                    أضف خدمتك
                </a>

            </div>
        `;

        return;
    }

    const fragment =
        document.createDocumentFragment();

    data.forEach((service) => {
        fragment.appendChild(
            createServiceCard(service)
        );
    });

    serviceList.appendChild(fragment);
}


/* =========================================
   البحث
========================================= */

function searchServices() {

    if (!allSearch) {
        return;
    }

    const searchValue =
        normalizeArabicText(allSearch.value);

    if (!searchValue) {
        displayServices(services);
        return;
    }

    const filteredServices =
        services.filter((service) => {

            const searchableText =
                normalizeArabicText([
                    service.name,
                    service.job,
                    service.address,
                    service.description,
                    service.category
                ].join(" "));

            return searchableText.includes(
                searchValue
            );
        });

    displayServices(filteredServices);
}


if (allSearch) {

    allSearch.addEventListener(
        "input",
        searchServices
    );

    allSearch.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                searchServices();
            }

        }
    );
}


if (allSearchButton) {
    allSearchButton.addEventListener(
        "click",
        searchServices
    );
}


/* =========================================
   فلترة المهن
========================================= */

window.filterAll = function (category) {

    updateActiveFilterButton(category);

    if (category === "") {
        displayServices(services);
        return;
    }

    const normalizedCategory =
        normalizeArabicText(category);

    const filteredServices =
        services.filter((service) => {

            const serviceJob =
                normalizeArabicText(service.job);

            return serviceJob.includes(
                normalizedCategory
            );
        });

    displayServices(filteredServices);
};


// تغيير شكل زر الفلترة المحدد
function updateActiveFilterButton(category) {

    const buttons =
        document.querySelectorAll(
            ".category-filter button"
        );

    buttons.forEach((button) => {

        const buttonFilter =
            button.dataset.filter || "";

        button.classList.toggle(
            "active",
            buttonFilter === category
        );

    });
}


/* =========================================
   مشاركة الخدمة
========================================= */

async function shareService(
    service,
    shareButton
) {

    const serviceName =
        service.name || "خدمة";

    const serviceJob =
        service.job || "خدمة عامة";

    const serviceUrl =
        new URL(
            getServiceDetailsUrl(service),
            window.location.href
        ).href;

    const shareData = {
        title:
            `${serviceName} - ${serviceJob}`,

        text:
            `شاهد بيانات ${serviceName}، ` +
            `${serviceJob} في ${villageName}`,

        url: serviceUrl
    };

    try {

        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(
                serviceUrl
            );
        } else {
            copyTextFallback(serviceUrl);
        }

        showCopiedMessage(shareButton);

    } catch (error) {

        if (error.name === "AbortError") {
            return;
        }

        console.error(
            "حدث خطأ أثناء المشاركة:",
            error
        );

        alert(
            "تعذر مشاركة الخدمة، حاول مرة أخرى."
        );
    }
}


// نسخ الرابط للمتصفحات القديمة
function copyTextFallback(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    textarea.remove();
}


// إظهار رسالة النسخ داخل الزر
function showCopiedMessage(button) {

    if (!button) {
        return;
    }

    const originalContent =
        button.innerHTML;

    button.disabled = true;

    button.innerHTML = `
        <i
            class="fa-solid fa-check"
            aria-hidden="true"
        ></i>

        تم نسخ الرابط
    `;

    setTimeout(() => {

        button.innerHTML = originalContent;
        button.disabled = false;

    }, 2000);
}


/* =========================================
   تشغيل تحميل البيانات
========================================= */

loadServices();