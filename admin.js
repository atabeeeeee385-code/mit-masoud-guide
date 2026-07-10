import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// التأكد من تسجيل الدخول
if (localStorage.getItem("adminLogin") !== "true") {
  window.location.href = "admin-login.html";
}

// تسجيل الخروج
window.logout = function () {
  localStorage.removeItem("adminLogin");
  window.location.href = "admin-login.html";
};

const serviceList = document.querySelector(".service-list");

let services = [];

// تحميل الخدمات من Firebase
async function loadServices() {

  services = [];

  const querySnapshot = await getDocs(collection(db, "services"));

  querySnapshot.forEach((document) => {

    services.push({
      id: document.id,
      ...document.data()
    });

  });

  displayAdmin();

}

// عرض الخدمات
function displayAdmin() {

  if (!serviceList) return;

  serviceList.innerHTML = "";

  if (services.length === 0) {

    serviceList.innerHTML = `
      <div class="service-card">
        <h3>لا توجد خدمات</h3>
      </div>
    `;

    return;

  }

  services.forEach((service) => {

    serviceList.innerHTML += `

      <div class="service-card">

        <h3>👤 ${service.name}</h3>

        <span>🔧 ${service.job}</span>

        <p>📍 ${service.address || "ميت مسعود"}</p>

        <p>📞 ${service.phone}</p>

        <div class="buttons">

          <a class="details-btn"
             href="service.html?id=${service.id}">
             عرض
          </a>

          <button
            onclick="deleteService('${service.id}')"
            style="
              background:#dc2626;
              color:white;
              border:none;
              padding:10px;
              border-radius:8px;
              cursor:pointer;
            ">
            حذف
          </button>

        </div>

      </div>

    `;

  });

}

// حذف خدمة
window.deleteService = async function (id) {

  const confirmDelete = confirm("هل تريد حذف هذه الخدمة؟");

  if (!confirmDelete) return;

  try {

    await deleteDoc(doc(db, "services", id));

    alert("تم حذف الخدمة بنجاح ✅");

    loadServices();

  } catch (error) {

    console.error(error);

    alert("حدث خطأ أثناء الحذف");

  }

};

loadServices();