import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let services = [];

const serviceForm = document.getElementById("serviceForm");

if (serviceForm) {
  serviceForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newService = {
      name: document.getElementById("name").value,
      job: document.getElementById("job").value,
      phone: document.getElementById("phone").value,
      whatsapp: document.getElementById("whatsapp").value,
      address: document.getElementById("address").value,
      description: document.getElementById("description").value,
      facebook: document.getElementById("facebook").value,
      instagram: document.getElementById("instagram").value,
      tiktok: document.getElementById("tiktok").value,
      createdAt: Date.now()
    };

    try {
      await addDoc(collection(db, "services"), newService);

      alert("تم إضافة خدمتك بنجاح ✅");

      serviceForm.reset();

      loadServices();

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إضافة الخدمة");
    }
  });
}

const serviceList = document.querySelector(".service-list");

async function loadServices() {

  services = [];

  const querySnapshot = await getDocs(collection(db, "services"));

  querySnapshot.forEach((doc) => {
    services.push({
      id: doc.id,
      ...doc.data()
    });
  });

  displayServices(services);
}

function displayServices(data) {

  if (!serviceList) return;

  serviceList.innerHTML = "";

  if (data.length === 0) {

    serviceList.innerHTML = `
      <div class="service-card">
        <h3>لا توجد خدمات حتى الآن</h3>
        <p>كن أول من يضيف خدمته في دليل خدمات ميت مسعود 🚀</p>
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

          <a class="call" href="tel:${service.phone}">
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
if (searchInput) {

  searchInput.addEventListener("keyup", function () {

    let value = searchInput.value.toLowerCase();

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

window.filterCategory = function (category) {

  let filtered = services.filter(service =>

    service.job.includes(category)

  );

  displayServices(filtered);

  const servicesSection = document.querySelector(".services");

  if (servicesSection) {

    window.scrollTo({

      top: servicesSection.offsetTop,

      behavior: "smooth"

    });

  }

};

// تحميل الخدمات عند فتح الصفحة
loadServices();