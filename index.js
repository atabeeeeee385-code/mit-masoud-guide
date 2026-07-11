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

const container = document.getElementById("villagesContainer");
const searchInput = document.getElementById("villageSearch");
const searchButton = document.getElementById("searchButton");

function normalizeArabicText(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/[\u064B-\u065F\u0670]/g, "");
}

function createVillageCard(village) {

    const card = document.createElement("div");
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
    link.href = `village.html?village=${encodeURIComponent(village)}`;

    buttons.appendChild(link);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(buttons);

    return card;
}

function displayVillages(list) {

    container.innerHTML = "";

    if (list.length === 0) {

        container.innerHTML = `
            <p class="no-results">
                لا توجد قرية مطابقة لعملية البحث
            </p>
        `;

        return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach(village => {
        fragment.appendChild(createVillageCard(village));
    });

    container.appendChild(fragment);
}

function searchVillages() {

    const value = normalizeArabicText(searchInput.value);

    if (!value) {
        displayVillages(villages);
        return;
    }

    const filtered = villages.filter(village =>
        normalizeArabicText(village).includes(value)
    );

    displayVillages(filtered);
}

displayVillages(villages);

searchInput.addEventListener("input", searchVillages);

searchButton.addEventListener("click", searchVillages);

searchInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        searchVillages();
    }

});