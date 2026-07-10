// جلب الخدمات

let services = JSON.parse(localStorage.getItem("services")) || [];


// مكان عرض الخدمات

const serviceList = document.querySelector(".service-list");


// البحث

const allSearch = document.getElementById("allSearch");



// عرض الخدمات

function displayServices(data){


    if(!serviceList) return;



    serviceList.innerHTML = "";



    if(data.length === 0){


        serviceList.innerHTML = `

        <div class="service-card">

            <h3>
            لا توجد خدمات ❌
            </h3>


            <p>
            جرب البحث عن خدمة أخرى.
            </p>


        </div>

        `;


        return;

    }




    data.forEach(service => {



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
            📝 ${service.description || "خدمة داخل ميت مسعود"}
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
            href="service.html?id=${service.id}">

            عرض التفاصيل

            </a>



        </div>


        `;



    });


}






// عرض الأحدث أولاً

services.reverse();

displayServices(services);






// بحث داخل كل الخدمات

if(allSearch){


    allSearch.addEventListener("keyup", function(){


        let value = allSearch.value.toLowerCase();



        let filtered = services.filter(service =>


            service.name.toLowerCase().includes(value) ||


            service.job.toLowerCase().includes(value) ||


            (service.address &&
            service.address.toLowerCase().includes(value))


        );



        displayServices(filtered);


    });


}







// فلترة الأقسام

function filterAll(category){



    if(category === ""){


        displayServices(services);


        return;

    }




    let filtered = services.filter(service =>


        service.job.includes(category)

    );



    displayServices(filtered);



}