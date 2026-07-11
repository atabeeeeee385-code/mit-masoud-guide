import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



let services = [];





const params = new URLSearchParams(window.location.search);

const villageName = params.get("village") || "ميت مسعود";





const serviceForm = document.getElementById("serviceForm");


const serviceList = document.querySelector(".service-list");


const globalList = document.getElementById("globalList");


const searchInput = document.getElementById("searchInput");









// إضافة خدمة جديدة

if(serviceForm){


serviceForm.addEventListener("submit", async function(e){


e.preventDefault();




const newService = {


status:"pending",



village:villageName,



category:
document.getElementById("category").value,



type:
document.getElementById("serviceType")
?
document.getElementById("serviceType").value
:
"village",





name:
document.getElementById("name").value,



job:
document.getElementById("job").value,



phone:
document.getElementById("phone").value,



whatsapp:
document.getElementById("whatsapp").value,



address:
document.getElementById("address").value,



description:
document.getElementById("description").value,



facebook:
document.getElementById("facebook").value,



instagram:
document.getElementById("instagram").value,



tiktok:
document.getElementById("tiktok").value,



createdAt:
Date.now()


};







try{


await addDoc(

collection(db,"services"),

newService

);




alert("تم إرسال خدمتك للمراجعة ✅");



serviceForm.reset();



}



catch(error){


console.error(error);



alert("حدث خطأ أثناء إضافة الخدمة");



}



});


}












// تحميل خدمات القرية

async function loadServices(){


if(!serviceList) return;



try{



services=[];




const q = query(


collection(db,"services"),


where("village","==",villageName),


where("type","==","village"),


where("status","==","approved")



);







const snapshot = await getDocs(q);






snapshot.forEach((doc)=>{


services.push({


id:doc.id,


...doc.data()


});



});







services.sort((a,b)=>


(b.createdAt || 0)


-


(a.createdAt || 0)


);






displayServices(services);




}



catch(error){


console.error(error);



}



}












// تحميل الخدمات العامة لكل القرى

async function loadGlobalServices(){


if(!globalList) return;



try{



const q = query(


collection(db,"services"),


where("type","==","global"),


where("status","==","approved")



);






const snapshot = await getDocs(q);






let globalServices=[];





snapshot.forEach((doc)=>{


globalServices.push({


id:doc.id,


...doc.data()


});


});






displayGlobalServices(globalServices);



}



catch(error){


console.error(error);



}



}
// عرض خدمات القرية

function displayServices(data){


if(!serviceList) return;



serviceList.innerHTML="";




if(data.length===0){


serviceList.innerHTML=`

<div class="service-card">


<h3>
لا توجد خدمات في ${villageName} حاليا ❌
</h3>


<p>
كن أول من يضيف خدمتك.
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
📂 ${getCategoryName(service.category)}
</p>




<p>
📍 ${service.address || service.village}
</p>




<p>
📝 ${service.description || "خدمة داخل القرية"}
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











// عرض الخدمات العامة

function displayGlobalServices(data){


if(!globalList) return;



globalList.innerHTML="";





if(data.length===0){



globalList.innerHTML=`

<div class="service-card">


<h3>
لا توجد خدمات عامة حاليا
</h3>


</div>

`;

return;


}





data.forEach(service=>{



globalList.innerHTML += `


<div class="service-card">


<h3>
👤 ${service.name}
</h3>



<span>
🔧 ${service.job}
</span>



<p>
📂 ${getCategoryName(service.category)}
</p>



<p>
⭐ متاح لكل القرى
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



</div>



`;



});



}












// أسماء الأقسام

function getCategoryName(category){


const categories = {


health:"🏥 الصحة والطوارئ",

home:"🏠 المنزل والصيانة",

cars:"🚗 السيارات والمواصلات",

food:"🍔 الطعام والديليفري",

shipping:"📦 الشحن والتوصيل",

shops:"🛒 المحلات والتجارة",

personal:"💇 خدمات شخصية",

general:"⭐ خدمات عامة"


};



return categories[category] || "⭐ خدمات عامة";


}












// البحث

if(searchInput){



searchInput.addEventListener("keyup",function(){



let value = searchInput.value.toLowerCase();





let filtered = services.filter(service =>



(service.name && service.name.toLowerCase().includes(value))


||


(service.job && service.job.toLowerCase().includes(value))


||


(service.description && service.description.toLowerCase().includes(value))


||


(service.category && service.category.toLowerCase().includes(value))



);





displayServices(filtered);



});



}












// فلترة الأقسام

window.filterCategory=function(category){



let filtered = services.filter(service =>



service.category === category



);




displayServices(filtered);





const servicesSection = document.querySelector(".services");



if(servicesSection){


window.scrollTo({

top:servicesSection.offsetTop,

behavior:"smooth"

});


}



};












// تشغيل التحميل

loadServices();

loadGlobalServices();