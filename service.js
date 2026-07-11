import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// قراءة رقم الخدمة من الرابط
const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id");


// عناصر الصفحة
const serviceDetails = document.getElementById("serviceDetails");
const logoTitle = document.getElementById("logoTitle");
const footerTitle = document.getElementById("footerTitle");
const shareServiceButton = document.getElementById("shareServiceButton");


// بيانات المشاركة
let currentServiceName = "خدمة";
let currentVillageName = "مركز شبين الكوم";


/**
 * حماية النصوص القادمة من قاعدة البيانات.
 */
function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/**
 * تنظيف رقم الهاتف.
 */
function cleanPhoneNumber(phone) {
    return String(phone ?? "")
        .replace(/[^\d+]/g, "");
}


/**
 * تجهيز رقم واتساب.
 * يجب أن يكون الرقم محفوظًا بكود الدولة مثل:
 * 201001234567
 */
function cleanWhatsAppNumber(phone) {
    let number = String(phone ?? "").replace(/\D/g, "");

    if (number.startsWith("00")) {
        number = number.slice(2);
    }

    if (number.startsWith("0")) {
        number = `20${number.slice(1)}`;
    }

    return number;
}


/**
 * السماح فقط بروابط HTTP وHTTPS.
 */
function getSafeUrl(url) {
    if (!url) {
        return "";
    }

    try {
        const parsedUrl = new URL(url);

        if (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        ) {
            return parsedUrl.href;
        }
    } catch (error) {
        return "";
    }

    return "";
}


/**
 * إنشاء رابط منصة اجتماعية.
 */
function createSocialLink(url, title, iconClass) {
    const safeUrl = getSafeUrl(url);

    if (!safeUrl) {
        return "";
    }

    return `
        <a
            href="${escapeHTML(safeUrl)}"
            target="_blank"
            rel="noopener noreferrer"
        >
            <i class="${iconClass}" aria-hidden="true"></i>
            ${escapeHTML(title)}
        </a>
    `;
}


/**
 * تحميل وعرض بيانات الخدمة.
 */
async function loadService() {

    if (!serviceId) {
        serviceDetails.innerHTML = `
            <h3>رابط الخدمة غير صحيح ❌</h3>

            <p>
                لم يتم العثور على رقم الخدمة داخل الرابط.
            </p>
        `;

        disableShareButton();
        return;
    }

    try {

        const docRef = doc(db, "services", serviceId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            serviceDetails.innerHTML = `
                <h3>الخدمة غير موجودة ❌</h3>

                <p>
                    ربما تم حذف الخدمة أو تغيير رابطها.
                </p>
            `;

            disableShareButton();
            return;
        }

        const service = docSnap.data();

        // عرض الخدمات المقبولة فقط
        if (service.status !== "approved") {
            serviceDetails.innerHTML = `
                <h3>هذه الخدمة غير متاحة حاليًا ❌</h3>

                <p>
                    الخدمة ما زالت تحت المراجعة.
                </p>
            `;

            disableShareButton();
            return;
        }

        const villageName = service.village || "ميت مسعود";
        const serviceName = service.name || "مقدم الخدمة";
        const serviceJob = service.job || "خدمة عامة";
        const serviceAddress = service.address || villageName;
        const serviceDescription =
            service.description || `خدمة داخل ${villageName}`;

        const phone = cleanPhoneNumber(service.phone);
        const whatsappNumber = cleanWhatsAppNumber(
            service.whatsapp || service.phone
        );

        currentServiceName = serviceName;
        currentVillageName = villageName;

        // تغيير عنوان المتصفح
        document.title =
            `${serviceName} - ${serviceJob} - دليل خدمات ${villageName}`;

        // تغيير عنوان الهيدر
        if (logoTitle) {
            logoTitle.innerHTML = `
                <i
                    class="fa-solid fa-location-dot"
                    aria-hidden="true"
                ></i>

                <span>
                    دليل خدمات ${escapeHTML(villageName)}
                </span>
            `;
        }

        // تغيير عنوان الفوتر
        if (footerTitle) {
            footerTitle.textContent =
                `دليل خدمات ${villageName}`;
        }

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

        const whatsappButton = whatsappNumber
            ? `
                <a
                    class="whatsapp"
                    href="https://wa.me/${escapeHTML(whatsappNumber)}"
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

        const socialLinks = [
            createSocialLink(
                service.facebook,
                "فيسبوك",
                "fa-brands fa-facebook"
            ),
            createSocialLink(
                service.instagram,
                "إنستجرام",
                "fa-brands fa-instagram"
            ),
            createSocialLink(
                service.tiktok,
                "تيك توك",
                "fa-brands fa-tiktok"
            )
        ].filter(Boolean).join("");

        serviceDetails.innerHTML = `

            <h2>
                <i
                    class="fa-solid fa-user"
                    aria-hidden="true"
                ></i>

                ${escapeHTML(serviceName)}
            </h2>

            <h3>
                <i
                    class="fa-solid fa-screwdriver-wrench"
                    aria-hidden="true"
                ></i>

                ${escapeHTML(serviceJob)}
            </h3>

            <p>
                <i
                    class="fa-solid fa-location-dot"
                    aria-hidden="true"
                ></i>

                ${escapeHTML(serviceAddress)}
            </p>

            <p>
                <i
                    class="fa-solid fa-house"
                    aria-hidden="true"
                ></i>

                القرية: ${escapeHTML(villageName)}
            </p>

            <p>
                <i
                    class="fa-solid fa-file-lines"
                    aria-hidden="true"
                ></i>

                ${escapeHTML(serviceDescription)}
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
                            لا توجد أرقام تواصل متاحة لهذه الخدمة.
                        </p>
                    `
            }

            ${
                socialLinks
                    ? `
                        <div class="social-links">
                            ${socialLinks}
                        </div>
                    `
                    : ""
            }

            <a
                href="village.html?village=${encodeURIComponent(villageName)}"
                class="details-btn"
            >
                <i
                    class="fa-solid fa-arrow-right"
                    aria-hidden="true"
                ></i>

                العودة إلى خدمات القرية
            </a>
        `;

        enableShareButton();

    } catch (error) {

        console.error("حدث خطأ أثناء تحميل الخدمة:", error);

        serviceDetails.innerHTML = `
            <h3>حدث خطأ أثناء تحميل البيانات ❌</h3>

            <p>
                تأكد من اتصال الإنترنت، ثم حاول مرة أخرى.
            </p>

            <button
                type="button"
                class="details-btn"
                id="retryButton"
            >
                إعادة المحاولة
            </button>
        `;

        disableShareButton();

        const retryButton = document.getElementById("retryButton");

        if (retryButton) {
            retryButton.addEventListener("click", loadService);
        }
    }
}


/**
 * مشاركة الخدمة.
 */
async function shareService() {

    const shareData = {
        title: `${currentServiceName} - دليل خدمات ${currentVillageName}`,
        text:
            `شاهد بيانات ${currentServiceName} على دليل خدمات ` +
            `${currentVillageName}`,
        url: window.location.href
    };

    try {

        // قائمة المشاركة الأصلية على الموبايل والمتصفحات المدعومة
        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }

        // نسخ الرابط كحل بديل
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(window.location.href);
        } else {
            copyLinkFallback(window.location.href);
        }

        showShareSuccess();

    } catch (error) {

        // المستخدم أغلق نافذة المشاركة
        if (error.name === "AbortError") {
            return;
        }

        console.error("حدث خطأ أثناء المشاركة:", error);

        alert("تعذر مشاركة الخدمة، حاول نسخ الرابط يدويًا.");
    }
}


/**
 * نسخ الرابط في المتصفحات القديمة.
 */
function copyLinkFallback(url) {
    const textArea = document.createElement("textarea");

    textArea.value = url;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);

    textArea.select();
    document.execCommand("copy");

    textArea.remove();
}


/**
 * إظهار رسالة نجاح مؤقتة داخل زر المشاركة.
 */
function showShareSuccess() {

    if (!shareServiceButton) {
        return;
    }

    const originalContent = shareServiceButton.innerHTML;

    shareServiceButton.innerHTML = `
        <i
            class="fa-solid fa-check"
            aria-hidden="true"
        ></i>

        تم نسخ الرابط
    `;

    setTimeout(() => {
        shareServiceButton.innerHTML = originalContent;
    }, 2000);
}


/**
 * تعطيل زر المشاركة.
 */
function disableShareButton() {
    if (shareServiceButton) {
        shareServiceButton.disabled = true;
    }
}


/**
 * تفعيل زر المشاركة.
 */
function enableShareButton() {
    if (shareServiceButton) {
        shareServiceButton.disabled = false;
    }
}


// ربط زر المشاركة
if (shareServiceButton) {
    shareServiceButton.addEventListener("click", shareService);
}


// تحميل الخدمة عند فتح الصفحة
loadService();