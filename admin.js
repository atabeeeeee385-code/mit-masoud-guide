import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";



const auth = getAuth();



const serviceList = document.querySelector(".service-list");


let services = [];




// التأكد من تسجيل دخول Firebase
onAuthStateChanged(auth, (user)=>{


  if(!user){

    window.location.href = "admin-login.html";

    return;

  }


  loadServices();


});






// تحميل الخدمات

async function loadServices(){


try{


services = [];


const querySnapshot =
await getDocs(
collection(db,"services")
);



querySnapshot.forEach((document)=>{


services.push({

id: document.id,

...document.data()

});


});




// ترتيب الأحدث

services.sort((a,b)=>{

return (

(b.createdAt?.seconds || b.createdAt || 0)

-

(a.createdAt?.seconds || a.createdAt || 0)

);

});



displayAdmin();



}

catch(error){

console.error(error);

alert("حدث خطأ أثناء تحميل الخدمات");

}


}






// عرض الخدمات

function displayAdmin(){


if(!serviceList) return;


serviceList.innerHTML = "";



if(services.length === 0){


serviceList.innerHTML = `

<div class="service-card">

<h3>
لا توجد خدمات
</h3>

</div>

`;

return;

}





services.forEach((service)=>{



serviceList.innerHTML += `


<div class="service-card">


<h3>
👤 ${service.name}
</h3>



<span>
🔧 ${service.job}
</span>



<p>
📍 ${service.address || "ميت مسعود"}
</p>



<p>
📞 ${service.phone}
</p>




<div class="buttons">


<a class="details-btn"
href="service.html?id=${service.id}">

عرض

</a>




<button
class="call"
onclick="deleteService('${service.id}')">

حذف

</button>



</div>



</div>


`;



});



}






// حذف خدمة

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



}







// تسجيل الخروج

window.logout = async function(){


await signOut(auth);



window.location.href =
"admin-login.html";


}