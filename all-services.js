import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



let services = [];



const serviceList = document.querySelector(".service-list");

const allSearch = document.getElementById("allSearch");



// معرفة القرية من الرابط

const params = new URLSearchParams(window.location.search);

const villageName = params.get("village") || "ميت مسعود";








// تحميل الخدمات الخاصة بالقرية فقط

async function loadServices(){


try{


services = [];



const q = query(

collection(db,"services"),

where("village","==",villageName),

where("status","==","approved")

);




const querySnapshot = await getDocs(q);





querySnapshot.forEach((doc)=>{


services.push({

id:doc.id,

...doc.data()

});


});






services.sort((a,b)=>

(b.createdAt || 0) -

(a.createdAt || 0)

);





displayServices(services);



}

catch(error){


console.error(error);


alert("حدث خطأ أثناء تحميل الخدمات");


}



}









// عرض الخدمات

function displayServices(data){



if(!serviceList) return;



serviceList.innerHTML = "";




if(data.length === 0){


serviceList.innerHTML = `


<div class="service-card">


<h3>
لا توجد خدمات في ${villageName} حاليا ❌
</h3>


<p>
كن أول من يضيف خدمته.
</p>


</div>


`;

return;


}






data.forEach(service=>{



serviceList.innerHTML += `


<div class="service-card">



<h3>
👤 ${service.name}
</h3>




<span>
🔧 ${service.job}
</span>





<p>
📍 ${service.address || service.village}
</p>




<p>
📝 ${service.description || "خدمة داخل " + service.village}
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




<a class="details-btn"

href="service.html?id=${service.id}&village=${villageName}">

عرض التفاصيل

</a>





</div>



`;



});



}









// البحث

if(allSearch){


allSearch.addEventListener("keyup",function(){



let value = allSearch.value.toLowerCase();





let filtered = services.filter(service =>



(service.name &&

service.name.toLowerCase().includes(value))


||


(service.job &&

service.job.toLowerCase().includes(value))


||


(service.address &&

service.address.toLowerCase().includes(value))


||


(service.description &&

service.description.toLowerCase().includes(value))



);



displayServices(filtered);



});


}









// فلترة الأقسام

window.filterAll = function(category){



if(category === ""){


displayServices(services);


return;

}




let filtered = services.filter(service =>


service.job.includes(category)


);




displayServices(filtered);



};







loadServices();