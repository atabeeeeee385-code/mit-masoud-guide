/*
========================================
قرى مركز شبين الكوم
========================================
*/


const villages = [

"شبين الكوم",
"إصطباري",
"البتانون",
"بخاتي",
"الدلاتون",
"الراهب",
"السكرية",
"العسالتة",
"الماي",
"بتبس",
"حصة مليج",
"دكما",
"زوير",
"سلكا",
"شبرا باص",
"شبرا خلفون",
"شنوان",
"شنوفة",
"طنبدي",
"كفر البتانون",
"كفر الشيخ خليل",
"كفر العجايزة",
"كفر المصيلحة",
"كفر دقماق",
"كفر شنوان",
"كفر طنبدي",
"الكوم الأخضر",
"مليج",
"المصيلحة",
"منشأة بخاتي",
"منشأة الشريكين",
"منشأة عصام",
"منشأة شنوان",
"ميت الموز",
"ميت خاقان",
"ميت خلف",
"ميت عافية",
"ميت مسعود",
"ميت موسى"

];


/*
========================================
عناصر الصفحة
========================================
*/

const villagesContainer =
document.getElementById("villagesContainer");

const searchInput =
document.getElementById("villageSearch");

const searchButton =
document.getElementById("searchButton");


/*
========================================
إنشاء كارت قرية
========================================
*/

function createVillageCard(village){

return `

<a
class="service-card"

href="village.html?village=${encodeURIComponent(village)}">

<h3>

🏘️ ${village}

</h3>

<p>

عرض جميع خدمات القرية

</p>

<div class="buttons">

<span class="call">

دخول

</span>

</div>

</a>

`;

}


/*
========================================
عرض القرى
========================================
*/

function renderVillages(list){

villagesContainer.innerHTML="";

list.forEach(village=>{

villagesContainer.innerHTML+=
createVillageCard(village);

});

}

renderVillages(villages);


/*
========================================
البحث
========================================
*/

searchInput.addEventListener("input",()=>{

const value=

searchInput.value
.trim()
.toLowerCase();

const result=

villages.filter(v=>

v.toLowerCase().includes(value)

);

renderVillages(result);

});


searchButton.addEventListener("click",()=>{

searchInput.dispatchEvent(

new Event("input")

);

});