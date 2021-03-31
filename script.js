// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

const mymap = L.map("mapid").setView([65.03777732, 25.45506727], 13);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: apiKey,
  }
).addTo(mymap);

mymap.addControl(new L.Control.Fullscreen());
L.control.locate().addTo(mymap);

const placeElements = new Array();

function addComment(event) {
  const placeName = event.target.getAttribute("data-location");
  const i = event.target.getAttribute("i");
  const username = document.getElementById("username" + i).value;
  const comment = document.getElementById("comment" + i).value;
  //doesn't post if forms are empty
  if (username != "" && comment != "") {
    //adds a comment to firestore
    db.collection("comments").add({
      timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
      username: username,
      comment: comment,
      location: placeName,
    });
    //empties forms and updates comments
    document.getElementById("username" + i).value = "";
    document.getElementById("comment" + i).value = "";
    updateComments(event);
  }
}

function updateComments(event) {
  const placeName = event.target.getAttribute("data-location");
  let list = "";
  //gets comments by location
  db.collection("comments")
    .where("location", "==", placeName)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        //forms the date and adds comments to a list
        const timestamp = doc.data().timestamp.toDate();
        const date =
          timestamp.getDate() +
          "." +
          timestamp.getMonth() +
          "." +
          timestamp.getFullYear() +
          " " +
          timestamp.getHours() +
          ":" +
          timestamp.getMinutes();
        list =
          list +
          date +
          " | " +
          doc.data().username +
          " - " +
          doc.data().comment +
          "<br>";
      });

      document.getElementById(placeName).innerHTML = list;
    });
}

function addInforToCards() {
  for (let i = 0; i < placeElements.length; i++) {
    const element = placeElements[i];
    const placeId = places[i];
    const elementInnerHtml = element.innerHTML;

    let marker = L.marker([placeId["longitude"], placeId["latitude"]]).addTo(
      mymap
    );

    marker.placeId = placeId;
    marker.placeName = placeId["name"];
    marker.collapseIndex = "#collapse" + i;
    const popUpText =
      "<h3>" + placeId["name"] + "</h3>" + "<p>" + placeId["address"] + "</p>";
    marker.bindPopup(popUpText);

    marker.addEventListener("click", function () {
      mymap.flyTo([placeId["longitude"], placeId["latitude"]], 16);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      console.log(marker.collapseIndex);
      $(marker.collapseIndex).collapse("show");
    });

    element.addEventListener("click", function () {
      marker.openPopup();
      mymap.flyTo([placeId["longitude"], placeId["latitude"]], 16);
    });
  }
}

function addListItems() {
  const list = document.getElementById("list-items");

  // Loop through all places
  for (let i = 0; i < places.length; i++) {
    // Create list item
    const listItem = document.createElement("li");
    const placeName = places[i]["name"];
    const description = places[i]["text"];

    let businessHrs = "";
    let businessHrsTitle = "";
    // Check if business hours exist for place
    if (places[i]["businesshours"]) {
      businessHrsTitle = "Business hours";
      businessHrs = places[i]["businesshours"];
    }

    let picture =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/University-of-Oulu-2010.jpg/250px-University-of-Oulu-2010.jpg";

    if (places[i]["picture"]) {
      picture = places[i]["picture"];
    }

    let card = `
          <div class="card" style="width: 17rem">
            <div class="card-body">
              <h5 class="card-title">${placeName}</h5>
              <a id="cardPreview${i}" href="#collapse${i}"data-toggle="collapse">
                <h5 class ="card-image">
                <img src = ${picture} alt = "${placeName}" height = 175; width = 230;></h5></a>
              <div id="collapse${i}" class="collapse">
                <p style="font-size: medium">${description}
                <br>
                <br>
                <p><i>${businessHrsTitle}</i></p>
                <p>${businessHrs}</p>
                <button type="button" id="openButton${i}" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal${i}" data-location="${placeName}">Show comments</button>
              </div>
            </div>
          </div>
            `;

    let modal = `<div id="myModal${i}" class="modal" role="dialog">
                    <div class="modal-dialog" role="document">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h3 class="modal-title w-100 text-center">${placeName}</h3>
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                          <div class="modal-body">
                          <p class="comment-form-title"><i>Leave a comment about ${placeName}</i></p>
                            <div class="comment-form">
                              <form id="comment-form">
                                  <input class="input" type="text" placeholder="Name" id="username${i}" name="username" ><br>
                              </form>
                              <textarea id="comment${i}" name="comment" placeholder="Comment" form="comment-form"></textarea>
                              <button type="button" id="addComment${i}" class="btn btn-primary" data-location="${placeName}" i="${i}">Submit</button>
                            </div>
                            <h5 id="comment-area-title">Comments about ${placeName}</h5>
                            <div class="comment-area">
                              <p class="comment" id="${placeName}" ></p>
                            </div>
                          
                      </div>
                    </div>
                  </div>`;

    listItem.innerHTML = card + modal;

    // Append list item to unordered list element
    list.appendChild(listItem);

    placeElements.push(listItem);

    //adds functionality to created buttons
    const openCommentsButton = document.getElementById("openButton" + i);
    openCommentsButton.addEventListener("click", updateComments);
    const addCommentButton = document.getElementById("addComment" + i);
    addCommentButton.addEventListener("click", addComment);
  }
  addInforToCards();
}

addListItems();

// Collapse other cards when a card is clicked
$(document).ready(function () {
  $(".collapse").on("show.bs.collapse", function () {
    $(".collapse.show").each(function () {
      $(this).collapse("hide");
    });
  });
});
