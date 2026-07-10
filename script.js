const searchInput = document.getElementById("searchInput");

const services = document.querySelectorAll(".service-card");

searchInput.addEventListener("keyup", function () {

    const searchValue = searchInput.value.toLowerCase();

    services.forEach(function(service){

        const text = service.innerText.toLowerCase();

        if(text.includes(searchValue)){

            service.style.display = "block";

        } else {

            service.style.display = "none";

        }

    });

});