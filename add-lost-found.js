/*
========================================
إضافة بلاغ موجودات ومفقودات - Firestore
الجزء 1 من 2
========================================
*/

import {
    db
} from "./firebase.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*
========================================
قائمة القرى والمناطق
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

const form =
    document.getElementById("lostFoundForm");

const reportTypeLost =
    document.getElementById("reportTypeLost");

const reportTypeFound =
    document.getElementById("reportTypeFound");

const pageTitle =
    document.getElementById("addReportPageTitle");

const pageDescription =
    document.getElementById("addReportPageDescription");

const itemTitleInput =
    document.getElementById("itemTitle");

const itemCategorySelect =
    document.getElementById("itemCategory");

const descriptionInput =
    document.getElementById("itemDescription");

const descriptionCounter =
    document.getElementById("descriptionCounter");

const villageSelect =
    document.getElementById("reportVillage");

const locationInput =
    document.getElementById("reportLocation");

const reportDateInput =
    document.getElementById("reportDate");

const reportTimeInput =
    document.getElementById("reportTime");

const reporterNameInput =
    document.getElementById("reporterName");

const phoneInput =
    document.getElementById("reportPhone");

const privacyAgreement =
    document.getElementById("privacyAgreement");

const imageInput =
    document.getElementById("itemImage");

const chooseImageButton =
    document.getElementById("chooseImageButton");

const removeImageButton =
    document.getElementById("removeImageButton");

const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

const imagePreview =
    document.getElementById("imagePreview");

const submitButton =
    document.getElementById("submitLostFoundButton");

const formMessage =
    document.getElementById("lostFoundFormMessage");

const yearElement =
    document.getElementById("year");

const offlineBanner =
    document.getElementById("offlineBanner");


/*
========================================
إعداد السنة
========================================
*/

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/*
========================================
تحميل القرى داخل القائمة
========================================
*/

function loadVillages() {

    if (!villageSelect) {

        return;

    }

    villages.forEach((village) => {

        const option =
            document.createElement("option");

        option.value =
            village;

        option.textContent =
            village;

        villageSelect.appendChild(option);

    });

}

loadVillages();


/*
========================================
نوع البلاغ من رابط الصفحة
========================================
*/

const pageParams =
    new URLSearchParams(
        window.location.search
    );

const requestedType =
    pageParams.get("type");


function applyReportType(type) {

    if (type === "found") {

        if (reportTypeFound) {

            reportTypeFound.checked =
                true;

        }

        if (pageTitle) {

            pageTitle.textContent =
                "الإبلاغ عن شيء موجود";

        }

        if (pageDescription) {

            pageDescription.textContent =
                "اكتب بيانات الشيء الذي عثرت عليه لمساعدة صاحبه في الوصول إليه.";

        }

        document.title =
            "الإبلاغ عن شيء موجود - دليل شبين";

        return;

    }


    if (reportTypeLost) {

        reportTypeLost.checked =
            true;

    }

    if (pageTitle) {

        pageTitle.textContent =
            "الإبلاغ عن شيء مفقود";

    }

    if (pageDescription) {

        pageDescription.textContent =
            "اكتب بيانات الشيء المفقود بدقة لمساعدة الآخرين في التعرف عليه.";

    }

    document.title =
        "الإبلاغ عن شيء مفقود - دليل شبين";

}


applyReportType(
    requestedType === "found"
        ? "found"
        : "lost"
);


reportTypeLost?.addEventListener(
    "change",
    () => {

        applyReportType("lost");

    }
);


reportTypeFound?.addEventListener(
    "change",
    () => {

        applyReportType("found");

    }
);


/*
========================================
إعداد تاريخ اليوم
========================================
*/

if (reportDateInput) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    reportDateInput.max =
        today;

    if (!reportDateInput.value) {

        reportDateInput.value =
            today;

    }

}


/*
========================================
عداد حروف الوصف
========================================
*/

function updateDescriptionCounter() {

    if (
        !descriptionInput ||
        !descriptionCounter
    ) {

        return;

    }

    const currentLength =
        descriptionInput.value.length;

    descriptionCounter.textContent =
        `${currentLength} / 1000`;

}


descriptionInput?.addEventListener(
    "input",
    updateDescriptionCounter
);


updateDescriptionCounter();


/*
========================================
تنظيف رقم الهاتف
========================================
*/

phoneInput?.addEventListener(
    "input",
    () => {

        phoneInput.value =
            phoneInput.value
                .replace(/\D/g, "")
                .slice(0, 11);

    }
);


/*
========================================
معاينة الصورة محليًا فقط
========================================
*/

let selectedImageFile = null;

let previewObjectURL = "";


chooseImageButton?.addEventListener(
    "click",
    () => {

        imageInput?.click();

    }
);


imageInput?.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files?.[0];

        if (!file) {

            return;

        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            showMessage(
                "اختر صورة بصيغة JPG أو PNG أو WEBP.",
                "error"
            );

            imageInput.value = "";

            selectedImageFile = null;

            return;

        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showMessage(
                "حجم الصورة يجب ألا يزيد عن 5 ميجابايت.",
                "error"
            );

            imageInput.value = "";

            selectedImageFile = null;

            return;

        }

        if (previewObjectURL) {

            URL.revokeObjectURL(
                previewObjectURL
            );

        }

        selectedImageFile =
            file;

        previewObjectURL =
            URL.createObjectURL(file);

        if (imagePreview) {

            imagePreview.src =
                previewObjectURL;

        }

        if (imagePreviewContainer) {

            imagePreviewContainer.hidden =
                false;

        }

        showMessage(
            "تم اختيار الصورة. سيتم تفعيل رفع الصور بعد ربط خدمة الصور.",
            "success"
        );

    }
);


removeImageButton?.addEventListener(
    "click",
    () => {

        selectedImageFile =
            null;

        if (imageInput) {

            imageInput.value = "";

        }

        if (previewObjectURL) {

            URL.revokeObjectURL(
                previewObjectURL
            );

            previewObjectURL = "";

        }

        if (imagePreview) {

            imagePreview.removeAttribute(
                "src"
            );

        }

        if (imagePreviewContainer) {

            imagePreviewContainer.hidden =
                true;

        }

        showMessage("");

    }
);


/*
========================================
عرض رسائل النجاح والخطأ
========================================
*/

function showMessage(
    message,
    type = ""
) {

    if (!formMessage) {

        return;

    }

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message ${type}`.trim();

}


/*
========================================
التحقق من الهاتف المصري
========================================
*/

function isValidEgyptianPhone(phone) {

    return /^01[0125][0-9]{8}$/.test(
        phone
    );

}


/*
========================================
قراءة نوع البلاغ
========================================
*/

function getSelectedReportType() {

    return document.querySelector(
        'input[name="reportType"]:checked'
    )?.value || "";

}


/*
========================================
قراءة بيانات الفورم
========================================
*/

function getFormData() {

    return {

        type:
            getSelectedReportType(),

        title:
            itemTitleInput?.value.trim()
            || "",

        category:
            itemCategorySelect?.value
            || "",

        description:
            descriptionInput?.value.trim()
            || "",

        village:
            villageSelect?.value
            || "",

        location:
            locationInput?.value.trim()
            || "",

        date:
            reportDateInput?.value
            || "",

        time:
            reportTimeInput?.value
            || "",

        reporterName:
            reporterNameInput?.value.trim()
            || "",

        phone:
            phoneInput?.value.trim()
            || "",

        privacyAccepted:
            Boolean(
                privacyAgreement?.checked
            )

    };

}


/*
========================================
التحقق من بيانات البلاغ
========================================
*/

function validateReportData(data) {

    if (
        !["lost", "found"].includes(
            data.type
        )
    ) {

        return "اختر نوع البلاغ: مفقود أو موجود.";

    }

    if (
        data.title.length < 3
    ) {

        return "اكتب عنوانًا واضحًا لا يقل عن 3 أحرف.";

    }

    if (
        data.title.length > 100
    ) {

        return "عنوان البلاغ يجب ألا يزيد عن 100 حرف.";

    }

    if (!data.category) {

        return "اختر نوع الشيء.";

    }

    if (
        data.description.length < 10
    ) {

        return "اكتب وصفًا لا يقل عن 10 أحرف.";

    }

    if (
        data.description.length > 1000
    ) {

        return "الوصف يجب ألا يزيد عن 1000 حرف.";

    }

    if (!data.village) {

        return "اختر القرية أو المنطقة.";

    }

    if (
        data.location.length < 3
    ) {

        return "اكتب مكان الفقد أو العثور بالتفصيل.";

    }

    if (
        data.location.length > 200
    ) {

        return "وصف المكان يجب ألا يزيد عن 200 حرف.";

    }

    if (!data.date) {

        return "اختر تاريخ الفقد أو العثور.";

    }

    if (
        !isValidEgyptianPhone(
            data.phone
        )
    ) {

        return "اكتب رقم هاتف مصري صحيح مكونًا من 11 رقمًا.";

    }

    if (
        data.reporterName.length > 100
    ) {

        return "اسم مقدم البلاغ يجب ألا يزيد عن 100 حرف.";

    }

    if (!data.privacyAccepted) {

        return "يجب الموافقة على نشر بيانات التواصل.";

    }

    return "";

}
/*
========================================
إرسال البلاغ إلى Firestore
========================================
*/

form?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        showMessage("");

        if (!navigator.onLine) {

            showMessage(
                "لا يوجد اتصال بالإنترنت. حاول مرة أخرى بعد عودة الاتصال.",
                "error"
            );

            return;

        }

        const reportData =
            getFormData();

        const validationError =
            validateReportData(
                reportData
            );

        if (validationError) {

            showMessage(
                validationError,
                "error"
            );

            return;

        }

        const originalButtonContent =
            submitButton?.innerHTML || "";

        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                جارٍ نشر البلاغ...
            `;

        }

        try {

            const firestoreReport = {

                type:
                    reportData.type,

                title:
                    reportData.title,

                category:
                    reportData.category,

                description:
                    reportData.description,

                village:
                    reportData.village,

                location:
                    reportData.location,

                date:
                    reportData.date,

                time:
                    reportData.time,

                reporterName:
                    reportData.reporterName,

                phone:
                    reportData.phone,

                imageUrl:
                    "",

                imagePath:
                    "",

                status:
                    "pending",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            await addDoc(
                collection(
                    db,
                    "lostFoundReports"
                ),
                firestoreReport
            );


            form.reset();


            applyReportType(
                requestedType === "found"
                    ? "found"
                    : "lost"
            );


            if (reportDateInput) {

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                reportDateInput.value =
                    today;

            }


            updateDescriptionCounter();


            selectedImageFile =
                null;


            if (imageInput) {

                imageInput.value =
                    "";

            }


            if (previewObjectURL) {

                URL.revokeObjectURL(
                    previewObjectURL
                );

                previewObjectURL =
                    "";

            }


            if (imagePreview) {

                imagePreview.removeAttribute(
                    "src"
                );

            }


            if (imagePreviewContainer) {

                imagePreviewContainer.hidden =
                    true;

            }


            showMessage(
                "تم إرسال البلاغ بنجاح، وسيظهر بعد مراجعة الإدارة.",
                "success"
            );


            window.setTimeout(
                () => {

                    window.location.href =
                        "./lost-found.html";

                },
                1800
            );

        } catch (error) {

            console.error(
                "تعذر إرسال البلاغ إلى Firestore:",
                error
            );


            let errorMessage =
                "تعذر إرسال البلاغ. حاول مرة أخرى.";


            if (
                error?.code ===
                "permission-denied"
            ) {

                errorMessage =
                    "تم رفض الحفظ من قواعد Firestore. تأكد من نشر القواعد الجديدة.";

            }


            if (
                error?.code ===
                "unavailable"
            ) {

                errorMessage =
                    "خدمة Firebase غير متاحة مؤقتًا. حاول مرة أخرى.";

            }


            showMessage(
                errorMessage,
                "error"
            );

        } finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    originalButtonContent;

            }

        }

    }
);


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
    () => {

        updateOnlineStatus();

        showMessage(
            "عاد الاتصال بالإنترنت.",
            "success"
        );

    }
);


window.addEventListener(
    "offline",
    () => {

        updateOnlineStatus();

        showMessage(
            "لا يوجد اتصال بالإنترنت.",
            "error"
        );

    }
);


updateOnlineStatus();


/*
========================================
تنظيف رابط معاينة الصورة
========================================
*/

window.addEventListener(
    "beforeunload",
    () => {

        if (previewObjectURL) {

            URL.revokeObjectURL(
                previewObjectURL
            );

        }

    }
);