import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let services = [];

const serviceList = document.querySelector(".service-list");
const allSearch = document.getElementById("allSearch");

// تحميل الخدمات من Firebase
async function loadServices() {

    services = [];

    const querySnapshot = await getDocs(collection(db, "services"));

    querySnapshot.forEach((doc) => {

        services.push({
            id: doc.id,
            ...doc.data()
        });

    });

    // الأحدث أولاً
    services.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    displayServices(services);

}



// عرض الخدمات
function displayServices(data) {

    if (!serviceList) return;

    serviceList.innerHTML = "";

    if (data.length === 0) {

        serviceList.innerHTML = `
        <div class="service-card">

            <h3>لا توجد خدمات ❌</h3>

            <p>جرب البحث عن خدمة أخرى.</p>

        </div>
        `;

        return;

    }



    data.forEach(service => {

        serviceList.innerHTML += `

        <div class="service-card">

            <h3>👤 ${service.name}</h3>

            <span>🔧 ${service.job}</span>

            <p>📍 ${service.address || "ميت مسعود"}</p>

            <p>📝 ${service.description || "خدمة داخل ميت مسعود"}</p>

            <div class="buttons">

                <a class="call"
                href="tel:${service.phone}">

                📞 اتصال

                </a>

                <a class="whatsapp"
                href="https://wa.me/${service.whatsapp || service.phone}"
                target="_blank">

                💬 واتساب

                </a>

            </div>

            <br>

            <a class="details-btn"
            href="service.html?id=${service.id}">

            عرض التفاصيل

            </a>

        </div>

        `;

    });

}



// البحث
if (allSearch) {

    allSearch.addEventListener("keyup", function () {

        let value = allSearch.value.toLowerCase();

        let filtered = services.filter(service =>

            service.name.toLowerCase().includes(value) ||

            service.job.toLowerCase().includes(value) ||

            (service.address &&
                service.address.toLowerCase().includes(value)) ||

            (service.description &&
                service.description.toLowerCase().includes(value))

        );

        displayServices(filtered);

    });

}



// فلترة الأقسام
window.filterAll = function (category) {

    if (category === "") {

        displayServices(services);

        return;

    }

    let filtered = services.filter(service =>

        service.job.includes(category)

    );

    displayServices(filtered);

};


// تحميل الخدمات عند فتح الصفحة
loadServices();