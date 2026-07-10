import { db } from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// جلب ID من الرابط
const params = new URLSearchParams(window.location.search);
const serviceId = params.get("id");

// مكان عرض التفاصيل
const serviceDetails = document.getElementById("serviceDetails");

async function loadService() {

  try {

    const docRef = doc(db, "services", serviceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {

      serviceDetails.innerHTML = `
        <h3>الخدمة غير موجودة ❌</h3>
        <p>تأكد من الرابط أو أضف الخدمة من جديد.</p>
      `;

      return;
    }

    const service = docSnap.data();

    serviceDetails.innerHTML = `

      <h2>👤 ${service.name}</h2>

      <h3>🔧 ${service.job}</h3>

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

      <div class="social-links">

        ${service.facebook ? `<a href="${service.facebook}" target="_blank">فيسبوك</a>` : ""}

        ${service.instagram ? `<a href="${service.instagram}" target="_blank">إنستجرام</a>` : ""}

        ${service.tiktok ? `<a href="${service.tiktok}" target="_blank">تيك توك</a>` : ""}

      </div>

      <br>

      <a href="index.html" class="details-btn">
        ⬅ العودة للرئيسية
      </a>

    `;

  } catch (error) {

    console.error(error);

    serviceDetails.innerHTML = `
      <h3>حدث خطأ أثناء تحميل البيانات ❌</h3>
    `;

  }

}

loadService();