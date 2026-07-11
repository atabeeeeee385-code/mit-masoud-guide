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




// عناصر الصفحة

const pendingList = document.getElementById("pendingList");

const approvedList = document.getElementById("approvedList");

const villageFilter = document.getElementById("villageFilter");

const adminSearch = document.getElementById("adminSearch");



// الإحصائيات

const totalCount = document.getElementById("totalCount");

const pendingCount = document.getElementById("pendingCount");

const approvedCount = document.getElementById("approvedCount");

const villagesCount = document.getElementById("villagesCount");




let services = [];









// التأكد من تسجيل الدخول

onAuthStateChanged(auth,(user)=>{


if(!user){


window.location.href="admin-login.html";


return;


}



loadServices();



});












// تحميل الخدمات

async function loadServices(){



try{



services=[];



const snapshot = await getDocs(

collection(db,"services")

);






snapshot.forEach(item=>{


services.push({

id:item.id,

...item.data()

});


});







services.sort((a,b)=>

(b.createdAt || 0)

-

(a.createdAt || 0)

);







loadVillages();


updateStats();


filterServices();




}



catch(error){



console.error(error);


alert("حدث خطأ أثناء تحميل الخدمات");


}



}












// إنشاء قائمة القرى

function loadVillages(){


if(!villageFilter) return;



villageFilter.innerHTML = `


<option value="">
كل القرى
</option>


`;




let villages=[];




services.forEach(service=>{


if(service.village && !villages.includes(service.village)){


villages.push(service.village);


}


});






villages.sort();





villages.forEach(village=>{


villageFilter.innerHTML += `


<option value="${village}">

${village}

</option>


`;



});



}












// الإحصائيات

function updateStats(){



if(totalCount){

totalCount.textContent = services.length;

}




if(pendingCount){

pendingCount.textContent = services.filter(service =>

service.status === "pending"

).length;


}




if(approvedCount){

approvedCount.textContent = services.filter(service =>

service.status === "approved"

).length;


}







let villages=[];




services.forEach(service=>{


if(service.village && !villages.includes(service.village)){


villages.push(service.village);


}


});




if(villagesCount){

villagesCount.textContent = villages.length;

}



}
// فلترة الخدمات

function filterServices(){


let village = villageFilter ? villageFilter.value : "";


let search = adminSearch ? adminSearch.value.toLowerCase() : "";



let filtered = services.filter(service=>{


let villageMatch =

village === "" ||

service.village === village;



let searchMatch =


(service.name &&

service.name.toLowerCase().includes(search))


||


(service.job &&

service.job.toLowerCase().includes(search));




return villageMatch && searchMatch;



});






let pending = filtered.filter(service =>

service.status === "pending"

);





let approved = filtered.filter(service =>

service.status === "approved" ||

!service.status

);





displayPending(pending);


displayApproved(approved);



}












// عرض الخدمات المعلقة

function displayPending(data){



if(!pendingList) return;



pendingList.innerHTML="";





if(data.length===0){


pendingList.innerHTML=`

<div class="service-card">

<h3>
لا توجد خدمات معلقة ⏳
</h3>

</div>

`;

return;

}







data.forEach(service=>{



pendingList.innerHTML += `


<div class="service-card">


<h3>
👤 ${service.name}
</h3>



<p>
🔧 ${service.job}
</p>




<p>
🏘️ ${service.village}
</p>




<p>
📞 ${service.phone}
</p>





<p>
نوع الظهور:
${service.type === "global" ? "⭐ كل القرى" : "🏘️ قرية فقط"}
</p>





<select id="cat-${service.id}">


<option value="">
اختر القسم
</option>


<option value="health">
🏥 الصحة والطوارئ
</option>


<option value="home">
🏠 المنزل والصيانة
</option>


<option value="cars">
🚗 السيارات والمواصلات
</option>


<option value="food">
🍔 الطعام والديليفري
</option>


<option value="shipping">
📦 الشحن والتوصيل
</option>


<option value="shops">
🛒 المحلات
</option>


<option value="personal">
💇 خدمات شخصية
</option>


<option value="general">
⭐ خدمات عامة
</option>


</select>





<div class="buttons">


<button class="call"

onclick="saveCategory('${service.id}')">

حفظ القسم 💾

</button>





<button class="call"

onclick="changeType('${service.id}','global')">

⭐ كل القرى

</button>





<button class="call"

onclick="approveService('${service.id}')">

قبول ✅

</button>





<button class="call"

onclick="deleteService('${service.id}')">

حذف 🗑

</button>



</div>



</div>


`;



});



}












// عرض الخدمات المقبولة

function displayApproved(data){



if(!approvedList) return;



approvedList.innerHTML="";





if(data.length===0){


approvedList.innerHTML=`

<div class="service-card">

<h3>
لا توجد خدمات مقبولة ✅
</h3>

</div>

`;

return;

}






data.forEach(service=>{


approvedList.innerHTML += `


<div class="service-card">


<h3>
👤 ${service.name}
</h3>



<p>
🔧 ${service.job}
</p>




<p>
🏘️ ${service.village}
</p>




<p>
📂 ${service.category || "بدون قسم"}
</p>




<p>
⭐ ${service.type === "global" ? "كل القرى" : "داخل القرية فقط"}
</p>




<p>
📞 ${service.phone}
</p>





<div class="buttons">



<a class="details-btn"

href="service.html?id=${service.id}&village=${service.village}">

عرض

</a>




<button class="call"

onclick="changeType('${service.id}','global')">

⭐ كل القرى

</button>




<button class="call"

onclick="changeType('${service.id}','village')">

🏘️ قرية فقط

</button>




<button class="call"

onclick="deleteService('${service.id}')">

حذف 🗑

</button>



</div>



</div>


`;



});



}
// حفظ القسم

window.saveCategory = async function(id){


const category = document.getElementById(
"cat-" + id
).value;




if(category === ""){


alert("اختر القسم أولا");


return;


}




try{


await updateDoc(

doc(db,"services",id),

{

category: category

}

);




alert("تم حفظ القسم ✅");


loadServices();



}


catch(error){


console.error(error);


alert("حدث خطأ أثناء حفظ القسم");


}



};









// تغيير نوع الظهور

window.changeType = async function(id,type){



try{


await updateDoc(

doc(db,"services",id),

{

type:type

}

);




alert("تم تغيير نوع الظهور ✅");



loadServices();



}



catch(error){


console.error(error);


alert("حدث خطأ أثناء التعديل");


}



};











// قبول الخدمة

window.approveService = async function(id){



try{


await updateDoc(

doc(db,"services",id),

{

status:"approved"

}

);





alert("تم قبول الخدمة ✅");



loadServices();



}



catch(error){


console.error(error);


alert("حدث خطأ أثناء القبول");


}



};












// حذف الخدمة

window.deleteService = async function(id){



if(!confirm("هل تريد حذف الخدمة؟"))

return;





try{


await deleteDoc(

doc(db,"services",id)

);





alert("تم حذف الخدمة ✅");



loadServices();



}



catch(error){


console.error(error);


alert("حدث خطأ أثناء الحذف");


}



};












// تحديث الخدمات القديمة

window.updateOldServices = async function(){



if(!confirm("تحديث الخدمات القديمة؟"))

return;





try{



const snapshot = await getDocs(

collection(db,"services")

);





const batch = writeBatch(db);





snapshot.forEach(item=>{


const data = item.data();


let update = {};





if(!data.type){


update.type = "village";


}




if(!data.category){


update.category = "general";


}






if(Object.keys(update).length > 0){



batch.update(

doc(db,"services",item.id),

update

);



}



});






await batch.commit();





alert("تم تحديث الخدمات القديمة ✅");



loadServices();



}



catch(error){


console.error(error);


alert("حدث خطأ أثناء التحديث");


}



};












// البحث والفلترة

if(villageFilter){



villageFilter.addEventListener(

"change",

filterServices

);



}





if(adminSearch){



adminSearch.addEventListener(

"keyup",

filterServices

);



}











// تسجيل الخروج

window.logout = async function(){



await signOut(auth);



window.location.href="admin-login.html";


};