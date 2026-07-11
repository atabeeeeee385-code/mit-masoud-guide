const villages = [

"ميت مسعود",
"شبين الكوم",
"البتانون",
"إصطباري",
"شنوان",
"كفر البتانون",
"كفر الشيخ إبراهيم",
"بخاتي",
"المصيلحة",
"ميت خلف",
"منشأة سلطان",
"كفر طنبدى",
"طنبدى",
"الماي",
"دكما",
"زوير",
"الراهب",
"اصطباري",
"البتانون الجديدة",
"ميت عافية",
"كفر المصلحة",
"منشأة السلام",
"كفر دقماق",
"كفر العرب",
"ميت موسى",
"كفر الغنامية",
"سرس الليان",
"الحصوة",
"الماحوزة",
"بابل",
"طوخ طنبشا",
"الراهبين",
"شنواي",
"تلبنت قيصر"

];



const container = document.getElementById("villagesContainer");
const searchInput = document.getElementById("villageSearch");



function displayVillages(list){


container.innerHTML = "";


list.forEach(village => {


let card = document.createElement("div");

card.className = "service-card";


card.innerHTML = `

<h3>
🏘️ ${village}
</h3>

<p>
دليل خدمات ${village}
</p>


<div class="buttons">

<a class="call" href="village.html?village=${village}">
دخول
</a>

</div>

`;


container.appendChild(card);


});


}




displayVillages(villages);





searchInput.addEventListener("input", function(){


let value = this.value.trim();


let filtered = villages.filter(village =>

village.includes(value)

);


displayVillages(filtered);


});