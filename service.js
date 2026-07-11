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




// عناصر تغيير اسم القرية

const logoTitle = document.getElementById("logoTitle");

const footerTitle = document.getElementById("footerTitle");





async function loadService() {


  try {


    const docRef = doc(db, "services", serviceId);


    const docSnap = await getDoc(docRef);




    if (!docSnap.exists()) {


      serviceDetails.innerHTML = `

      <h3>
      الخدمة غير موجودة ❌
      </h3>

      `;


      return;


    }





    const service = docSnap.data();




    // التأكد أن الخدمة مقبولة

    if(service.status !== "approved"){


      serviceDetails.innerHTML = `

      <h3>
      هذه الخدمة غير متاحة حاليا ❌
      </h3>

      <p>
      الخدمة ما زالت تحت المراجعة.
      </p>

      `;


      return;


    }





    const villageName = service.village || "ميت مسعود";




    // تغيير العناوين

    document.title =
    "تفاصيل الخدمة - دليل خدمات " + villageName;



    if(logoTitle){

      logoTitle.textContent =
      "📍 دليل خدمات " + villageName;

    }



    if(footerTitle){

      footerTitle.textContent =
      "دليل خدمات " + villageName;

    }







    serviceDetails.innerHTML = `


      <h2>
      👤 ${service.name}
      </h2>



      <h3>
      🔧 ${service.job}
      </h3>




      <p>
      📍 ${service.address || villageName}
      </p>




      <p>
      🏘️ القرية: ${villageName}
      </p>




      <p>
      📝 ${service.description || "خدمة داخل " + villageName}
      </p>





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





      <div class="social-links">


      ${service.facebook ? 
      `<a href="${service.facebook}" target="_blank">
      فيسبوك
      </a>` : ""}




      ${service.instagram ? 
      `<a href="${service.instagram}" target="_blank">
      إنستجرام
      </a>` : ""}




      ${service.tiktok ? 
      `<a href="${service.tiktok}" target="_blank">
      تيك توك
      </a>` : ""}



      </div>





      <br>





      <a href="villege.html?village=${villageName}" 
      class="details-btn">

      ⬅ العودة للقرية

      </a>


    `;




  }

  catch(error){


    console.error(error);



    serviceDetails.innerHTML = `

    <h3>
    حدث خطأ أثناء تحميل البيانات ❌
    </h3>

    `;


  }



}




loadService();