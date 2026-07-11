import { db, auth } from "./firebase.js";

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


const ADMIN_EMAIL =
    "admin@metmasoud.com";


const pendingList =
    document.getElementById("pendingList");

const approvedList =
    document.getElementById("approvedList");

const rejectedList =
    document.getElementById("rejectedList");

const villageFilter =
    document.getElementById("villageFilter");

const adminSearch =
    document.getElementById("adminSearch");

const updateOldServicesButton =
    document.getElementById(
        "updateOldServicesButton"
    );

const logoutButton =
    document.getElementById("logoutButton");

const adminMessage =
    document.getElementById("adminMessage");


const totalCount =
    document.getElementById("totalCount");

const pendingCount =
    document.getElementById("pendingCount");

const approvedCount =
    document.getElementById("approvedCount");

const rejectedCount =
    document.getElementById("rejectedCount");

const villagesCount =
    document.getElementById("villagesCount");


let services = [];
let isAuthenticated = false;


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


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


function getCategoryName(category) {

    const categories = {
        health: "🏥 الصحة والطوارئ",
        pharmacy: "💊 الصيدليات",
        education: "🎓 التعليم والمدرسين",
        home: "🏠 المنزل والصيانة",
        construction: "🏗️ البناء والتشطيبات",
        cars: "🚗 السيارات والمواصلات",
        food: "🍔 الطعام والديليفري",
        shipping: "📦 الشحن والتوصيل",
        shops: "🛒 المحلات والتجارة",
        personal: "💇 الخدمات الشخصية",
        charity: "❤️ العمل الخيري",
        agriculture: "🌾 الزراعة والبيطرة",
        technology: "💻 التكنولوجيا والصيانة",
        legal: "⚖️ المحاماة والمحاسبة",
        events: "🎉 المناسبات والتصوير",
        jobs: "💼 الوظائف والتدريب",
        government: "🏛️ الخدمات الحكومية",
        general: "⭐ خدمات عامة"
    };

    return categories[category] ||
        "بدون قسم";
}


function showAdminMessage(
    message,
    type = "success"
) {

    if (!adminMessage) {
        return;
    }

    adminMessage.textContent = message;

    adminMessage.className =
        type === "error"
            ? "admin-message error"
            : "admin-message success";

}


onAuthStateChanged(auth, async (user) => {

    if (
        !user ||
        user.email !== ADMIN_EMAIL
    ) {

        if (user) {
            await signOut(auth);
        }

        window.location.replace(
            "admin-login.html"
        );

        return;
    }

    isAuthenticated = true;

    loadServices();

});


async function loadServices() {

    if (!isAuthenticated) {
        return;
    }

    try {

        services = [];

        const snapshot =
            await getDocs(
                collection(db, "services")
            );

        snapshot.forEach((item) => {

            services.push({
                id: item.id,
                ...item.data()
            });

        });

        services.sort((a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
        );

        loadVillages();
        updateStats();
        filterServices();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "حدث خطأ أثناء تحميل الخدمات.",
            "error"
        );

    }

}


function loadVillages() {

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

    const villages = [
        ...new Set(
            services
                .map(
                    (service) =>
                        service.village
                )
                .filter(Boolean)
        )
    ].sort((a, b) =>
        a.localeCompare(b, "ar")
    );

    villages.forEach((village) => {

        const option =
            document.createElement("option");

        option.value = village;
        option.textContent = village;

        villageFilter.appendChild(option);

    });

    if (
        villages.includes(selectedVillage)
    ) {

        villageFilter.value =
            selectedVillage;

    }

}


function updateStats() {

    totalCount.textContent =
        services.length;

    pendingCount.textContent =
        services.filter(
            (service) =>
                service.status === "pending"
        ).length;

    approvedCount.textContent =
        services.filter(
            (service) =>
                service.status === "approved"
        ).length;

    rejectedCount.textContent =
        services.filter(
            (service) =>
                service.status === "rejected"
        ).length;

    villagesCount.textContent =
        new Set(
            services
                .map(
                    (service) =>
                        service.village
                )
                .filter(Boolean)
        ).size;

}


function filterServices() {

    const selectedVillage =
        villageFilter?.value || "";

    const searchValue =
        normalizeArabicText(
            adminSearch?.value || ""
        );

    const filtered =
        services.filter((service) => {

            const villageMatch =
                !selectedVillage ||
                service.village === selectedVillage;

            const searchableText =
                normalizeArabicText([
                    service.name,
                    service.job,
                    service.village,
                    service.phone,
                    service.address,
                    service.description,
                    getCategoryName(
                        service.category
                    )
                ].join(" "));

            const searchMatch =
                !searchValue ||
                searchableText.includes(
                    searchValue
                );

            return (
                villageMatch &&
                searchMatch
            );

        });

    displayServices(
        filtered.filter(
            (service) =>
                service.status === "pending"
        ),
        pendingList,
        "pending"
    );

    displayServices(
        filtered.filter(
            (service) =>
                service.status === "approved"
        ),
        approvedList,
        "approved"
    );

    displayServices(
        filtered.filter(
            (service) =>
                service.status === "rejected"
        ),
        rejectedList,
        "rejected"
    );

}


function displayServices(
    data,
    container,
    status
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (data.length === 0) {

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
                <h3>${messages[status]}</h3>
            </div>
        `;

        return;
    }

    const fragment =
        document.createDocumentFragment();

    data.forEach((service) => {

        fragment.appendChild(
            createAdminServiceCard(
                service,
                status
            )
        );

    });

    container.appendChild(fragment);

}


function createCategorySelect(service) {

    const categories = [

        ["health", "🏥 الصحة والطوارئ"],
        ["pharmacy", "💊 الصيدليات"],
        ["education", "🎓 التعليم والمدرسين"],
        ["home", "🏠 المنزل والصيانة"],
        ["construction", "🏗️ البناء والتشطيبات"],
        ["cars", "🚗 السيارات والمواصلات"],
        ["food", "🍔 الطعام والديليفري"],
        ["shipping", "📦 الشحن والتوصيل"],
        ["shops", "🛒 المحلات والتجارة"],
        ["personal", "💇 الخدمات الشخصية"],
        ["charity", "❤️ العمل الخيري"],
        ["agriculture", "🌾 الزراعة والبيطرة"],
        ["technology", "💻 التكنولوجيا والصيانة"],
        ["legal", "⚖️ المحاماة والمحاسبة"],
        ["events", "🎉 المناسبات والتصوير"],
        ["jobs", "💼 الوظائف والتدريب"],
        ["government", "🏛️ الخدمات الحكومية"],
        ["general", "⭐ خدمات عامة"]

    ];

    const options =
        categories.map(
            ([value, title]) => `
                <option
                    value="${value}"
                    ${
                        service.category === value
                            ? "selected"
                            : ""
                    }
                >
                    ${title}
                </option>
            `
        ).join("");

    return `
        <label>
            القسم
        </label>

        <select class="service-category-select">

            <option value="">
                اختر القسم
            </option>

            ${options}

        </select>
    `;

}


function createAdminServiceCard(
    service,
    status
) {

    const card =
        document.createElement("div");

    card.className =
        "service-card";

    card.innerHTML = `

        <h3>
            👤 ${escapeHTML(
                service.name || "بدون اسم"
            )}
        </h3>

        <p>
            🔧 ${escapeHTML(
                service.job || "بدون مهنة"
            )}
        </p>

        <p>
            🏘️ ${escapeHTML(
                service.village || "غير محددة"
            )}
        </p>

        <p>
            📞 ${escapeHTML(
                service.phone || "غير متوفر"
            )}
        </p>

        <p>
            📂 ${escapeHTML(
                getCategoryName(
                    service.category
                )
            )}
        </p>

        <p>
            ${
                service.type === "global"
                    ? "⭐ كل القرى"
                    : "🏘️ داخل القرية فقط"
            }
        </p>

        ${
            status === "pending"
                ? `
                    ${createCategorySelect(service)}

                    <div class="buttons">

                        <button
                            type="button"
                            class="call save-category-button"
                        >
                            حفظ القسم 💾
                        </button>

                        <button
                            type="button"
                            class="call make-global-button"
                        >
                            ⭐ كل القرى
                        </button>

                        <button
                            type="button"
                            class="call approve-button"
                        >
                            قبول ✅
                        </button>

                        <button
                            type="button"
                            class="call reject-button"
                        >
                            رفض ❌
                        </button>

                        <button
                            type="button"
                            class="call delete-button"
                        >
                            حذف 🗑
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
                            href="service.html?id=${encodeURIComponent(service.id)}"
                            target="_blank"
                        >
                            عرض
                        </a>

                        <button
                            type="button"
                            class="call make-global-button"
                        >
                            ⭐ كل القرى
                        </button>

                        <button
                            type="button"
                            class="call make-village-button"
                        >
                            🏘️ قرية فقط
                        </button>

                        <button
                            type="button"
                            class="call reject-button"
                        >
                            رفض ❌
                        </button>

                        <button
                            type="button"
                            class="call delete-button"
                        >
                            حذف 🗑
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
                            class="call approve-button"
                        >
                            قبول مرة أخرى ✅
                        </button>

                        <button
                            type="button"
                            class="call delete-button"
                        >
                            حذف نهائيًا 🗑
                        </button>

                    </div>
                `
                : ""
        }
    `;

    bindCardActions(
        card,
        service
    );

    return card;

}


function bindCardActions(
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

                alert(
                    "تم حفظ القسم ✅"
                );

                loadServices();

            }
        );


    card
        .querySelector(
            ".make-global-button"
        )
        ?.addEventListener(
            "click",
            () => changeType(
                service.id,
                "global"
            )
        );


    card
        .querySelector(
            ".make-village-button"
        )
        ?.addEventListener(
            "click",
            () => changeType(
                service.id,
                "village"
            )
        );


    card
        .querySelector(
            ".approve-button"
        )
        ?.addEventListener(
            "click",
            () => changeStatus(
                service.id,
                "approved"
            )
        );


    card
        .querySelector(
            ".reject-button"
        )
        ?.addEventListener(
            "click",
            () => changeStatus(
                service.id,
                "rejected"
            )
        );


    card
        .querySelector(
            ".delete-button"
        )
        ?.addEventListener(
            "click",
            () => deleteService(
                service.id,
                service.name
            )
        );

}


async function changeType(
    id,
    type
) {

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

    alert(
        "تم تغيير نوع الظهور ✅"
    );

    loadServices();

}


async function changeStatus(
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

    alert(
        status === "approved"
            ? "تم قبول الخدمة ✅"
            : "تم رفض الخدمة ❌"
    );

    loadServices();

}


async function deleteService(
    id,
    name
) {

    if (
        !confirm(
            `هل تريد حذف خدمة ${name || ""}؟`
        )
    ) {
        return;
    }

    await deleteDoc(
        doc(
            db,
            "services",
            id
        )
    );

    alert(
        "تم حذف الخدمة ✅"
    );

    loadServices();

}


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
                collection(db, "services")
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

            let hasUpdates = false;

            group.forEach((item) => {

                const data =
                    item.data();

                const update = {};

                if (!data.type) {
                    update.type = "village";
                }

                if (!data.category) {
                    update.category = "general";
                }

                if (!data.status) {
                    update.status = "approved";
                }

                if (!data.createdAt) {
                    update.createdAt =
                        Date.now();
                }

                if (
                    Object.keys(update).length > 0
                ) {

                    batch.update(
                        doc(
                            db,
                            "services",
                            item.id
                        ),
                        update
                    );

                    hasUpdates = true;

                }

            });

            if (hasUpdates) {
                await batch.commit();
            }

        }

        alert(
            "تم تحديث الخدمات القديمة ✅"
        );

        loadServices();

    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء التحديث."
        );

    }

}


async function logout() {

    await signOut(auth);

    window.location.replace(
        "admin-login.html"
    );

}


villageFilter?.addEventListener(
    "change",
    filterServices
);

adminSearch?.addEventListener(
    "input",
    filterServices
);

updateOldServicesButton?.addEventListener(
    "click",
    updateOldServices
);

logoutButton?.addEventListener(
    "click",
    logout
);