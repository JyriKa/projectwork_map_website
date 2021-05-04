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
  if (username !== "" && comment !== "") {
    //adds a comment to firestore
    db.collection(placeName).add({
      timestamp: new Date().toLocaleString(),
      username: username,
      comment: comment,
    });
    //empties forms
    document.getElementById("username" + i).value = "";
    document.getElementById("comment" + i).value = "";
  }
}

function createCommentBox(placeId, username, date, commentBody, index) {
  let commentBox = `
            <div class="comment-box" id ="comment-box-${index}">
              <div class="comment-meta">
                <div class="comment-user">
                  <p id="${placeId}username${index}"></p>
                </div>
                <div class="comment_date">
                  <p id="${placeId}comment-date${index}"></p>
                </div>
              </div>
              <div class="comment-body">
                <p id="${placeId}comment-body${index}"></p>
              </div>
            </div>
      `;
  return commentBox;
}

function updateComments(event) {
  const clickedElement = event.target;
  if (clickedElement.getAttribute("data-listening") !== null) return;

  clickedElement.setAttribute("data-listening", "listening");

  const placeName = clickedElement.getAttribute("data-location");
  // Remove spaces from place id, otherwise it won't work
  const placeId = placeName.split(" ").join("");
  let i = 0;
  db.collection(placeName).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const docData = change.doc.data();
        const timestamp = docData.timestamp;
        const username = docData.username;
        const commentBody = docData.comment;

        let commentBox = createCommentBox(
          placeId,
          username,
          timestamp,
          commentBody,
          i
        );

        // Create new unique comment box
        // Append comment box to specific place
        $("#" + placeId).append(commentBox);
        // Append text elements to comment box
        $("#" + placeId + "username" + i).text(username);
        $("#" + placeId + "comment-date" + i).text(timestamp);
        $("#" + placeId + "comment-body" + i).text(commentBody);
        i++;
      }
      // Remove no comments text if there are comments
      if (document.getElementById(placeId) !== null) {
        $("#noComments-" + placeId).text("");
      }
    });
  });
}

function addInforToCards() {
  for (let i = 0; i < placeElements.length; i++) {
    const element = placeElements[i];
    const placeId = places[i];

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
      if ($("#list-items").css("display") == "none") {
        swapTab();
      }
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

    const card = `
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

    let modal = createModal(i);

    // Append list item to unordered list element
    listItem.innerHTML = card + modal;
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

function createModal(i) {
  // Place to associate modal with
  const placeName = places[i]["name"];
  // Place id with no spaces
  const placeId = placeName.split(" ").join("");

  let modal = `
    <div id="myModal${i}" class="modal" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title w-100 text-center">${placeName}</h3>
          <button type="button" class="close" data-dismiss="modal">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p class="comment-form-title">
            <i>Leave a comment about ${placeName}</i>
          </p>
          <div class="comment-form">
            <form id="comment-form">
              <input
                class="input"
                type="text"
                placeholder="Name"
                id="username${i}"
                name="username"
              /><br />
            </form>
            <textarea
              id="comment${i}"
              name="comment"
              placeholder="Comment"
              form="comment-form"
            ></textarea>
            <button
              type="button"
              id="addComment${i}"
              class="btn btn-primary"
              data-location="${placeName}"
              i="${i}"
            >Submit</button>
          </div>
          <h5 id="comment-area-title">Comments about ${placeName}</h5>
          <div class="content" id="${placeId}"><p id="noComments-${placeId}">No comments yet!</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  // Returns a single modal
  return modal;
}

function updateEvents() {
  var starIcon = L.icon({
    iconUrl: "./pictures/marker.png",
    iconSize: [25, 42], // size of the icon
  });
  let i = 0;
  const list = document.getElementById("events");

  db.collection("Events").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((event) => {
      const docData = event.doc.data();
      const eventName = docData.name;
      const eventDescription = docData.description;
      const longitude = docData.latitude;
      const latitude = docData.longitude;
      const timestamp = new Date(docData.timestamp).toLocaleString();

      const listItem = document.createElement("li");
      const card = `
          <div class="card" style="width: 17rem">
            <div class="card-body" href="#collapse${i}"data-toggle="collapse">
              <h5 class="card-title">${eventName}</h5>
              <div id="collapse${i}" class="collapse">
                <p style="font-size: medium">${timestamp}
                <p style="font-size: medium">${eventDescription}
                <br>
              </div>
            </div>
          </div>
            `;
      listItem.innerHTML = card;

      let marker = L.marker([longitude, latitude], { icon: starIcon }).addTo(
        mymap
      );

      marker.placeName = eventName;
      marker.collapseIndex = "#eventCollapse" + i;
      const popUpText =
        "<h3>" + eventName + "</h3>" + "<p>" + eventDescription + "</p>";
      marker.bindPopup(popUpText);

      marker.addEventListener("click", function () {
        if ($("#events").css("display") == "none") {
          swapTab();
        }
        mymap.flyTo([longitude, latitude], 16);
        listItem.scrollIntoView({ behavior: "smooth", block: "start" });
        console.log(marker.collapseIndex);
        $(marker.collapseIndex).collapse("show");
      });

      listItem.addEventListener("click", function () {
        marker.openPopup();
        mymap.flyTo([longitude, latitude], 16);
      });

      list.appendChild(listItem);
      i++;
    });
  });
}

addListItems();
updateEvents();

// Disable locations button when website is opened
document.getElementById("showLocationsButton").disabled = true;

function showLocations() {
  $("#list-items").toggle(300);
  $("#events").toggle(300);
  document.getElementById("showLocationsButton").disabled = true;
  document.getElementById("showEventsButton").disabled = false;
}

function showEvents() {
  $("#list-items").toggle(300);
  $("#events").toggle(300);
  document.getElementById("showLocationsButton").disabled = false;
  document.getElementById("showEventsButton").disabled = true;
}

function selectCoordinates() {
  $("#eventWindow").modal("hide");
  $(".toast").toast("show");
  let active = true;
  document.getElementById("mapid").style.cursor =
    "url('/pictures/pin_icon.svg'), auto";

  mymap.addEventListener(
    "click",
    function (e) {
      if (active) {
        let coord = e.latlng;
        let lat = coord.lat;
        let lng = coord.lng;
        $("#latitude").text(lat);
        $("#longitude").text(lng);
        $("#eventWindow").modal("show");
        active = false;
        document.getElementById("mapid").style.cursor = "auto";
      }
    },
    { once: true }
  );
}

function addEvent() {
  const eventName = document.getElementById("eventName").value;
  const eventDescription = document.getElementById("eventDescription").value;
  const longitude = document.getElementById("longitude").innerHTML;
  const latitude = document.getElementById("latitude").innerHTML;
  const timestamp = document.getElementById("meeting-time").value;

  //doesn't post if forms are empty
  if (
    eventName !== "" &&
    eventDescription !== "" &&
    longitude !== "" &&
    latitude !== ""
  ) {
    //adds a comment to firestore
    db.collection("Events").add({
      name: eventName,
      description: eventDescription,
      longitude: longitude,
      latitude: latitude,
      timestamp: timestamp,
    });
    //empties forms
    document.getElementById("eventName").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("longitude").innerHTML = "";
    document.getElementById("latitude").innerHTML = "";
    $("#eventWindow").modal("hide");
  }
}

$("#addEvent").append(`
<div class="modal fade" id="eventWindow" tabindex="-1" role="dialog" aria-labelledby="eventWindowLabel" aria-hidden="true">
<div class="modal-dialog" role="document">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title w-100 text-center id="eventWindow>Add new event</h3>
      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
  </div>
    <div class="modal-body">
    <p class="event-title"><i>Add a new event to your chosen location</i></p>
      <div class="event-form">
      <form id="event-form">
        <input
        class="input"
        type="text"
        id="eventName"
        placeholder="Name of event"
        name="Name of event"
        /><br />
      </form>
      <div id="latitude" style="color: black"></div>
      <div id="longitude" style="color: black"></div>
      <button class="eventButtons btn btn-primary" onclick="selectCoordinates()">Select location</button>
      <p id="eventDateText">Event date</p>
      <input type="datetime-local" id="meeting-time"
       name="meeting-time" value="2021-06-12T19:30"
       min="2021-04-07T00:00" max="2030-06-14T00:00">
      <textarea
        name="event"
        id="eventDescription"
        placeholder="Description"
        form="event-form"
      ></textarea>
      <button
        type="button"
        class="eventButtons btn btn-primary" 
        onclick="addEvent()"
      >Submit</button>
    </div>
      </div>
    </div>
</div>
</div>`);

// Collapse other cards when a card is clicked
$(document).ready(function () {
  $(".collapse").on("show.bs.collapse", function () {
    $(".collapse.show").each(function () {
      $(this).collapse("hide");
    });
  });
});
