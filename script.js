import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*
========================================
بيانات عامة
========================================
*/

let services = [];
let globalServices = [];


const params =
    new URLSearchParams(
        window.location.search
    );

const villageFromUrl =
    params.get("village")?.trim() || "";

const villageName =
    villageFromUrl || "ميت مسعود";


/*
========================================
عناصر الصفحة
========================================
*/

const villageSelect =
    document.getElementById("village");

const serviceForm =
    document.getElementById("serviceForm");

const serviceList =
    document.getElementById("servicesList");

const globalList =
    document.getElementById("globalList");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");


/*
========================================
تحديد القرية القادمة من الرابط
========================================
*/

if (
    villageSelect &&
    villageFromUrl
) {

    villageSelect.value =
        villageFromUrl;

}


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
تنظيف رقم الهاتف
========================================
*/

function cleanPhoneNumber(phone) {

    return String(phone ?? "")
        .replace(/[^\d+]/g, "");

}


/*
========================================
تنظيف رقم واتساب
========================================
*/

function cleanWhatsAppNumber(phone) {

    let number =
        String(phone ?? "")
            .replace(/\D/g, "");

    if (
        number.startsWith("00")
    ) {

        number =
            number.slice(2);

    }

    if (
        number.startsWith("0")
    ) {

        number =
            `20${number.slice(1)}`;

    }

    return number;

}


/*
========================================
قراءة قيمة أي حقل
========================================
*/

function getInputValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


/*
========================================
اسم القسم
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
        "⭐ خدمات عامة"
    );

}


/*
========================================
رابط تفاصيل الخدمة
========================================
*/

function getServiceDetailsUrl(service) {

    return (
        `service.html?id=${encodeURIComponent(
            service.id
        )}` +
        `&village=${encodeURIComponent(
            service.village ||
            villageName
        )}`
    );

}


/*
========================================
إضافة خدمة جديدة
========================================
*/

if (serviceForm) {

    serviceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const submitButton =
                serviceForm.querySelector(
                    'button[type="submit"]'
                );

            const selectedVillage =
                getInputValue("village") ||
                villageFromUrl ||
                "";

            const newService = {

                status:
                    "pending",

                village:
                    selectedVillage,

                category:
                    getInputValue("category"),

                type:
                    "village",

                name:
                    getInputValue("name"),

                job:
                    getInputValue("job"),

                phone:
                    getInputValue("phone"),

                whatsapp:
                    getInputValue("whatsapp"),

                address:
                    getInputValue("address"),

                description:
                    getInputValue("description"),

                facebook:
                    getInputValue("facebook"),

                instagram:
                    getInputValue("instagram"),

                tiktok:
                    getInputValue("tiktok"),

                createdAt:
                    Date.now()

            };


            if (
                !newService.name ||
                !newService.job ||
                !newService.phone ||
                !newService.category ||
                !newService.village
            ) {

                alert(
                    "يرجى إدخال الاسم والمهنة ورقم الهاتف والقسم واختيار القرية."
                );

                return;

            }


            if (
                newService.name.length < 2 ||
                newService.name.length > 100
            ) {

                alert(
                    "الاسم يجب أن يكون من حرفين إلى 100 حرف."
                );

                return;

            }


            if (
                newService.job.length < 2 ||
                newService.job.length > 100
            ) {

                alert(
                    "المهنة أو الخدمة يجب أن تكون من حرفين إلى 100 حرف."
                );

                return;

            }


            if (
                newService.phone.length < 8 ||
                newService.phone.length > 20
            ) {

                alert(
                    "رقم الهاتف يجب أن يكون من 8 إلى 20 رقمًا."
                );

                return;

            }


            try {

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "جاري الإرسال...";

                }


                await addDoc(
                    collection(
                        db,
                        "services"
                    ),
                    newService
                );


                alert(
                    "تم إرسال خدمتك للمراجعة بنجاح ✅"
                );


                serviceForm.reset();


                if (
                    villageSelect &&
                    villageFromUrl
                ) {

                    villageSelect.value =
                        villageFromUrl;

                }

            } catch (error) {

                console.error(
                    "خطأ إضافة الخدمة:",
                    error.code,
                    error.message,
                    error
                );


                if (
                    error.code ===
                    "permission-denied"
                ) {

                    alert(
                        "Firebase رفض حفظ الخدمة.\n\nتأكد من نشر قواعد Firestore وأن البيانات مطابقة للشروط."
                    );

                } else if (
                    error.code ===
                    "unavailable"
                ) {

                    alert(
                        "تعذر الاتصال بـ Firebase.\n\nتحقق من الإنترنت وحاول مرة أخرى."
                    );

                } else {

                    alert(
                        `حدث خطأ أثناء إضافة الخدمة:\n\n${error.code || "unknown-error"}\n${error.message || "حدث خطأ غير معروف"}`
                    );

                }

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "إرسال البيانات";

                }

            }

        }
    );

}
/*
========================================
تحميل خدمات القرية
========================================
*/

async function loadServices() {

    if (!serviceList) {

        return;

    }


    serviceList.innerHTML = `
        <div class="service-card">

            <h3>
                جاري تحميل خدمات القرية...
            </h3>

        </div>
    `;


    try {

        services = [];


        const servicesQuery =
            query(
                collection(
                    db,
                    "services"
                ),
                where(
                    "village",
                    "==",
                    villageName
                ),
                where(
                    "type",
                    "==",
                    "village"
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


        snapshot.forEach(
            (serviceDocument) => {

                services.push({

                    id:
                        serviceDocument.id,

                    ...serviceDocument.data()

                });

            }
        );


        services.sort(
            (a, b) =>
                (b.createdAt || 0) -
                (a.createdAt || 0)
        );


        displayServices(
            services
        );

    } catch (error) {

        console.error(
            "خطأ تحميل خدمات القرية:",
            error
        );


        serviceList.innerHTML = `
            <div class="service-card">

                <h3>
                    تعذر تحميل خدمات
                    ${escapeHTML(villageName)}
                    ❌
                </h3>

                <p>
                    تأكد من اتصال الإنترنت.
                </p>

                <button
                    type="button"
                    class="details-btn"
                    id="retryServicesButton">

                    إعادة المحاولة

                </button>

            </div>
        `;


        document
            .getElementById(
                "retryServicesButton"
            )
            ?.addEventListener(
                "click",
                loadServices
            );

    }

}


/*
========================================
تحميل الخدمات العامة
========================================
*/

async function loadGlobalServices() {

    if (!globalList) {

        return;

    }


    globalList.innerHTML = `
        <div class="service-card">

            <h3>
                جاري تحميل الخدمات المهمة...
            </h3>

        </div>
    `;


    try {

        globalServices = [];


        const globalQuery =
            query(
                collection(
                    db,
                    "services"
                ),
                where(
                    "type",
                    "==",
                    "global"
                ),
                where(
                    "status",
                    "==",
                    "approved"
                )
            );


        const snapshot =
            await getDocs(
                globalQuery
            );


        snapshot.forEach(
            (serviceDocument) => {

                globalServices.push({

                    id:
                        serviceDocument.id,

                    ...serviceDocument.data()

                });

            }
        );


        globalServices.sort(
            (a, b) =>
                (b.createdAt || 0) -
                (a.createdAt || 0)
        );


        displayGlobalServices(
            globalServices
        );

    } catch (error) {

        console.error(
            "خطأ تحميل الخدمات العامة:",
            error
        );


        globalList.innerHTML = `
            <div class="service-card">

                <h3>
                    تعذر تحميل الخدمات المهمة ❌
                </h3>

            </div>
        `;

    }

}


/*
========================================
إنشاء كارت خدمة
========================================
*/

function createServiceCard(
    service,
    isGlobal = false
) {

    const serviceName =
        service.name ||
        "مقدم خدمة";

    const serviceJob =
        service.job ||
        "خدمة عامة";

    const serviceVillage =
        service.village ||
        villageName;

    const serviceAddress =
        service.address ||
        serviceVillage;

    const serviceDescription =
        service.description ||
        `خدمة داخل ${serviceVillage}`;

    const phone =
        cleanPhoneNumber(
            service.phone
        );

    const whatsapp =
        cleanWhatsAppNumber(
            service.whatsapp ||
            service.phone
        );

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "service-card";


    const callButton =
        phone
            ? `
                <a
                    class="call"
                    href="tel:${escapeHTML(
                        phone
                    )}">

                    📞 اتصال

                </a>
            `
            : "";


    const whatsappButton =
        whatsapp
            ? `
                <a
                    class="whatsapp"
                    href="https://wa.me/${escapeHTML(
                        whatsapp
                    )}"
                    target="_blank"
                    rel="noopener noreferrer">

                    💬 واتساب

                </a>
            `
            : "";


    card.innerHTML = `

        <h3>
            👤 ${escapeHTML(
                serviceName
            )}
        </h3>

        <span>
            🔧 ${escapeHTML(
                serviceJob
            )}
        </span>

        <p>
            📂 ${escapeHTML(
                getCategoryName(
                    service.category
                )
            )}
        </p>

        ${
            isGlobal
                ? `
                    <p>
                        ⭐ متاح لكل القرى
                    </p>
                `
                : `
                    <p>
                        📍 ${escapeHTML(
                            serviceAddress
                        )}
                    </p>

                    <p>
                        📝 ${escapeHTML(
                            serviceDescription
                        )}
                    </p>
                `
        }

        <div class="buttons">

            ${callButton}

            ${whatsappButton}

        </div>

        <div class="buttons service-extra-buttons">

            <a
                class="details-btn"
                href="${getServiceDetailsUrl(
                    service
                )}">

                عرض التفاصيل

            </a>

            <button
                type="button"
                class="share service-share-button">

                <i class="fa-solid fa-share-nodes"></i>

                مشاركة

            </button>

        </div>
    `;


    const shareButton =
        card.querySelector(
            ".service-share-button"
        );


    shareButton?.addEventListener(
        "click",
        () => {

            shareService(
                service,
                shareButton
            );

        }
    );


    return card;

}
/*
========================================
عرض خدمات القرية
========================================
*/

function displayServices(data) {

    if (!serviceList) {

        return;

    }


    serviceList.innerHTML =
        "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        serviceList.innerHTML = `
            <div class="service-card">

                <h3>
                    لا توجد خدمات مطابقة في
                    ${escapeHTML(villageName)}
                    حاليًا
                </h3>

                <p>
                    يمكنك إضافة خدمتك الآن.
                </p>

                <a
                    class="details-btn"
                    href="add-service.html?village=${encodeURIComponent(
                        villageName
                    )}">

                    أضف خدمتك

                </a>

            </div>
        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    data.forEach(
        (service) => {

            fragment.appendChild(
                createServiceCard(
                    service
                )
            );

        }
    );


    serviceList.appendChild(
        fragment
    );

}


/*
========================================
عرض الخدمات العامة
========================================
*/

function displayGlobalServices(data) {

    if (!globalList) {

        return;

    }


    globalList.innerHTML =
        "";


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        globalList.innerHTML = `
            <div class="service-card">

                <h3>
                    لا توجد خدمات عامة حاليًا
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
                createServiceCard(
                    service,
                    true
                )
            );

        }
    );


    globalList.appendChild(
        fragment
    );

}


/*
========================================
البحث داخل خدمات القرية
========================================
*/

function searchServices() {

    if (!searchInput) {

        return;

    }


    const searchValue =
        normalizeArabicText(
            searchInput.value
        );


    if (!searchValue) {

        displayServices(
            services
        );

        return;

    }


    const filteredServices =
        services.filter(
            (service) => {

                const searchableText =
                    normalizeArabicText(
                        [
                            service.name,
                            service.job,
                            service.description,
                            service.address,
                            service.category,
                            getCategoryName(
                                service.category
                            )
                        ].join(" ")
                    );

                return searchableText.includes(
                    searchValue
                );

            }
        );


    displayServices(
        filteredServices
    );

}


/*
========================================
أحداث البحث
========================================
*/

searchInput?.addEventListener(
    "input",
    searchServices
);


searchInput?.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            searchServices();

        }

    }
);


searchButton?.addEventListener(
    "click",
    searchServices
);


/*
========================================
فلترة الأقسام
========================================
*/

window.filterCategory =
    function (category) {

        const filteredServices =
            services.filter(
                (service) =>
                    service.category ===
                    category
            );


        displayServices(
            filteredServices
        );


        document
            .querySelector(
                ".services"
            )
            ?.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "start"
            });

    };


/*
========================================
مشاركة الخدمة
========================================
*/

async function shareService(
    service,
    shareButton
) {

    const serviceName =
        service.name ||
        "خدمة";

    const serviceJob =
        service.job ||
        "خدمة عامة";

    const serviceVillage =
        service.village ||
        villageName;

    const serviceUrl =
        new URL(
            getServiceDetailsUrl(
                service
            ),
            window.location.href
        ).href;


    const shareData = {

        title:
            `${serviceName} - ${serviceJob}`,

        text:
            `شاهد بيانات ${serviceName} في ${serviceVillage}`,

        url:
            serviceUrl

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

            return;

        }


        await navigator
            .clipboard
            .writeText(
                serviceUrl
            );


        const oldContent =
            shareButton.innerHTML;


        shareButton.innerHTML =
            "✅ تم نسخ الرابط";


        window.setTimeout(
            () => {

                shareButton.innerHTML =
                    oldContent;

            },
            2000
        );

    } catch (error) {

        if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                "خطأ مشاركة الخدمة:",
                error
            );


            alert(
                "تعذر مشاركة الخدمة."
            );

        }

    }

}
/*
========================================
تشغيل تحميل البيانات
========================================
*/

loadServices();

loadGlobalServices();