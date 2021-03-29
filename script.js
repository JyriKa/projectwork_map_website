const mymap = L.map('mapid').setView([65.03777732, 25.45506727], 13);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiKey
}).addTo(mymap);

const placeElements = document.querySelectorAll(".list-places li");
const placeTitle = document.getElementById("show-chosen");
const placeInformation = document.getElementById("chosen-information");
const hoursElement = document.getElementById("businessHours");

function addBusinessHours(infor) {
    if (infor.hasOwnProperty("businesshours")) {
        hoursElement.innerText = "Business hours:\n" + infor.businesshours; 
    }
    else {
        hoursElement.innerText = "";
    }
}

function onMarkerClick(e) {
    const placeInfor = places[this.placeId];
    placeTitle.innerText = this.placeName;
    placeInformation.innerText = placeInfor.text;
    addBusinessHours(placeInfor);
}

for (let i = 0; i < placeElements.length; i++) {
    const element = placeElements[i];
    const placeId = element.getAttribute("data-dName");
    const elementInnerHtml = element.innerHTML;
    const placeInfor = places[placeId];
    let marker = L.marker([placeInfor.longitude, placeInfor.latitude]).addTo(mymap);
    marker.placeId = placeId
    marker.placeName = elementInnerHtml;
    const popUpText = "<h3>" + elementInnerHtml + "</h3>" + "<p>" + placeInfor.address + "</p>";
    marker.bindPopup(popUpText);
    marker.on('click', onMarkerClick);
    element.addEventListener("click", function() {
        marker.openPopup();
        placeTitle.innerText = elementInnerHtml;
        placeInformation.innerText = placeInfor.text;
        mymap.flyTo([placeInfor.longitude, placeInfor.latitude], 16);
        addBusinessHours(placeInfor);
    });
}