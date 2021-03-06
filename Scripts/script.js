// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Focuses map on to the center of Oulu
const mymap = L.map("mapid").setView([65.03777732, 25.45506727], 13);

let tempMarker;

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

// Adds fullscreen option to map
mymap.addControl(new L.Control.Fullscreen());
L.control.locate().addTo(mymap);

const placeElements = new Array();

// Adds a comment to firebase
function addComment(event) {
  const placeName = event.target.getAttribute("data-location");
  const i = event.target.getAttribute("i");
  const username = document.getElementById("username" + i).value;
  const comment = document.getElementById("comment" + i).value;
  // Doesn't post if forms are empty
  if (username !== "" && comment !== "") {
    // Adds a comment to firestore
    db.collection(placeName).add({
      timestamp: new Date().toLocaleString(),
      username: username,
      comment: comment,
    });
    // Empties forms
    document.getElementById("username" + i).value = "";
    document.getElementById("comment" + i).value = "";
  } else {
    alert("Fill all fields!");
  }
}

// Creates a comment box for a single comment
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

// Fetches comments from firebase
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

// Adds the location information to the cards
function addInforToCards() {
  for (let i = 0; i < placeElements.length; i++) {
    const element = placeElements[i];
    const placeId = places[i];

    // Creates a marker on map
    let marker = L.marker([placeId["longitude"], placeId["latitude"]]).addTo(
      mymap
    );

    // Popup for marker
    marker.placeId = placeId;
    marker.placeName = placeId["name"];
    marker.collapseIndex = "#collapse" + i;
    const popUpText =
      "<h3>" + placeId["name"] + "</h3>" + "<p>" + placeId["address"] + "</p>";
    marker.bindPopup(popUpText);

    // Focuses the map on a marker when user clicks a marker
    marker.addEventListener("click", function () {
      mymap.flyTo([placeId["longitude"], placeId["latitude"]], 16);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      console.log(marker.collapseIndex);
      $(marker.collapseIndex).collapse("show");
    });

    // Flies to the marker when user clicks a card
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

    // Adds functionality to created buttons
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
  // Marker for events
  let eventMarkerIcon = L.icon({
    iconUrl: "./pictures/marker.png",
    iconSize: [25, 42], // size of the icon
  });
  let i = 0;
  const list = document.getElementById("events");

  // Fetches events from Firebase. 
  db.collection("Events")
    .where("timestamp", ">", firebase.firestore.Timestamp.now())
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((event) => {
        const docData = event.doc.data();
        let eventName = docData.name;
        let eventDescription = docData.description;
        const timestamp = docData.timestamp.toDate().toLocaleString();
        const date = timestamp.split(" ")[0];
        let longitude = docData.latitude;
        let latitude = docData.longitude;
        if (isNaN(longitude) && isNaN(latitude)) {
          longitude = 65.0115;
          latitude = 25.468;
        }
        // Tries to sanitize texts
        eventName = eventName.replace(/\s|\n|&nbsp;/g, " ");
        eventName = eventName.replace(/<[^>]+>/gm, "");
        eventDescription = eventDescription.replace(/\s|\n|&nbsp;/g, " ");
        eventDescription = eventDescription.replace(/<[^>]+>/gm, "");

        const listItem = document.createElement("li");
        const card = `
          <div class="card" style="width: 17rem">
            <div class="card-body event-card" href="#collapse${i}"data-toggle="collapse">
              <div class="card-title"><h5>${date}</h3><h3>${eventName}</h3>
              </div>
              <div id="collapse${i}" class="collapse">
                <p style="font-size: medium">${timestamp}
                <p style="font-size: medium">${eventDescription}
                <br>
              </div>
            </div>
          </div>
            `;
        listItem.innerHTML = card;

        // Creates a marker
        let marker = L.marker([longitude, latitude], {
          icon: eventMarkerIcon,
        }).addTo(mymap);
        marker.placeName = eventName;
        marker.collapseIndex = "#eventCollapse" + i;
        const popUpText = `<h3>${eventName}</h3>
        <p">${eventDescription}</p>`;
        marker.bindPopup(popUpText);

        // Focuses the map on a marker when user clicks a marker
        marker.addEventListener("click", function () {
          mymap.flyTo([longitude, latitude], 16);
          listItem.scrollIntoView({ behavior: "smooth", block: "start" });
          console.log(marker.collapseIndex);
          $(marker.collapseIndex).collapse("show");
        });
        
        // Flies to the marker when user clicks a card
        listItem.addEventListener("click", function () {
          marker.openPopup();
          mymap.flyTo([longitude, latitude], 16);
        });

        list.appendChild(listItem);
        i++;
      });
    });
}

function updatePastEvents() {
  // Marker for events
  let eventMarkerIcon = L.icon({
    iconUrl: "./pictures/marker.png",
    iconSize: [25, 42], // size of the icon
  });
  let i = 0;
  const list = document.getElementById("past-events");

  // Fetches events that have already expired
  db.collection("Events")
    .where("timestamp", "<", firebase.firestore.Timestamp.now())
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((event) => {
        const docData = event.doc.data();
        let eventName = docData.name;
        let eventDescription = docData.description;
        const timestamp = docData.timestamp.toDate().toLocaleString();
        const date = timestamp.split(" ")[0];
        let longitude = docData.latitude;
        let latitude = docData.longitude;
        if (isNaN(longitude) && isNaN(latitude)) {
          longitude = 65.0115;
          latitude = 25.468;
        }
        // Tries to sanitize texts
        eventName = eventName.replace(/\s|\n|&nbsp;/g, " ");
        eventName = eventName.replace(/<[^>]+>/gm, "");
        eventDescription = eventDescription.replace(/\s|\n|&nbsp;/g, " ");
        eventDescription = eventDescription.replace(/<[^>]+>/gm, "");

        const listItem = document.createElement("li");
        const card = `
          <div class="card" style="width: 17rem">
            <div class="card-body event-card" href="#collapse-${i}"data-toggle="collapse">
              <div class="card-title"><h5>${date}</h3><h3>${eventName}</h3>
              </div>
              <div id="collapse-${i}" class="collapse">
                <p style="font-size: medium">${timestamp}
                <p style="font-size: medium">${eventDescription}
                <br>
              </div>
            </div>
          </div>
            `;
        listItem.innerHTML = card;

        // Removed markers for now because there is no function to toggle past event markers
        /*
        let marker = L.marker([longitude, latitude], {
          icon: eventMarkerIcon,
        }).addTo(mymap);

        marker.placeName = eventName;
        marker.collapseIndex = "#eventCollapse" + i;
        const popUpText = `<h3>${eventName}</h3>
        <p">${eventDescription}</p>`;
        marker.bindPopup(popUpText);

        marker.addEventListener("click", function () {
          mymap.flyTo([longitude, latitude], 16);
          listItem.scrollIntoView({ behavior: "smooth", block: "start" });
          console.log(marker.collapseIndex);
          $(marker.collapseIndex).collapse("show");
        });

        listItem.addEventListener("click", function () {
          marker.openPopup();
          mymap.flyTo([longitude, latitude], 16);
        });*/

        list.appendChild(listItem);
        i++;
      });
    });
}

addListItems();
updateEvents();
updatePastEvents();

function togglePastEvents() {
  if (
    // Show past events when events window is active and switch is checked
    $("#eventSwitch").is(":checked") &&
    $("#showEvents").hasClass("active")
  ) {
    $("#past-events-div").show(200);
  } else {
    $("#past-events-div").hide(200);
  }
}

// Shows location cards
function showLocations() {
  $("#list-items").toggle(300);
  $("#events").toggle(300);
  $("#eventButton").toggle(300);
  $("#locations-title").toggle(300);
  $("#events-title").toggle(300);
  $("#upcoming-events-title").toggle(300);
  $("#switch").toggle(300);

  // Remove active and disabled class from other navbar item
  $(".navbar-nav").find(".active").removeClass("active");
  $(".navbar-nav").find(".disabled").removeClass("disabled");
  // Disable this nav item by adding active and disabled class to navbar item
  $("#showLocations").addClass("active");
  $("#showLocations").addClass("disabled");

  togglePastEvents();
}

// Shows event cards
function showEvents() {
  $("#list-items").toggle(300);
  $("#events").toggle(300);
  $("#eventButton").toggle(300);
  $("#locations-title").toggle(300);
  $("#events-title").toggle(300);
  $("#upcoming-events-title").toggle(300);
  $("#switch").toggle(300);

  // Remove active and disabled class from other navbar item
  $(".navbar-nav").find(".active").removeClass("active");
  $(".navbar-nav").find(".disabled").removeClass("disabled");
  // Disable this nav item by adding active and disabled class to navbar item
  $("#showEvents").addClass("active");
  $("#showEvents").addClass("disabled");

  togglePastEvents();
}

// User selects coordinates when choosing a location for an event
function selectCoordinates() {
  let tempMarkerIcon = L.icon({
    iconUrl: "./pictures/tempmarker.png",
    iconSize: [25, 42],
  });

  // Closes event creation modal
  $("#eventWindow").modal("hide");
  let active = true;
  if (tempMarker != undefined) {
    mymap.removeLayer(tempMarker);
  }
  // Changes cursor icon
  document.getElementById("mapid").style.cursor =
    "url('./pictures/pin_icon.svg'), auto";

  // Picks up coordinates on click
  mymap.addEventListener(
    "click",
    function (e) {
      if (active) {
        let coord = e.latlng;
        let lat = coord.lat;
        let lng = coord.lng;
        $("#latitude").text(lat);
        $("#longitude").text(lng);
        tempMarker = new L.marker([lat, lng], { icon: tempMarkerIcon }).addTo(
          mymap
        );
        $("#eventWindow").modal("show");
        active = false;
        document.getElementById("mapid").style.cursor = "auto";
      }
    },
    { once: true }
  );
  // Remove temp marker if modal is closed before submitting
  $("#eventWindow").on("hide.bs.modal", function () {
    mymap.removeLayer(tempMarker);
  });
}

// Adds a new event to firebase
function addEvent() {
  const eventName = document.getElementById("eventName").value;
  const eventDescription = document.getElementById("eventDescription").value;
  const longitude = document.getElementById("longitude").innerHTML;
  const latitude = document.getElementById("latitude").innerHTML;
  const timestamp = document.getElementById("meeting-time").value;

  // Doesn't post if forms are empty
  if (
    eventName !== "" &&
    eventDescription !== "" &&
    longitude !== "" &&
    latitude !== ""
  ) {
    // Adds a comment to firestore
    db.collection("Events").add({
      name: eventName,
      description: eventDescription,
      longitude: longitude,
      latitude: latitude,
      timestamp: new Date(timestamp),
    });
    // Empties forms
    document.getElementById("eventName").value = "";
    document.getElementById("eventDescription").value = "";
    document.getElementById("longitude").innerHTML = "";
    document.getElementById("latitude").innerHTML = "";
    $("#eventWindow").modal("hide");
    mymap.removeLayer(tempMarker);
  } else if (
    eventName !== "" &&
    eventDescription !== "" &&
    longitude === "" &&
    latitude === ""
  ) {
    // Alerts user if location is not selected
    alert("Select location!");
  } else {
    // Alerts user if all fields are not filled
    alert("Fill all fields!");
  }
}

// Modal for event creation
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
       name="meeting-time"
       min="2021-04-07T00:00" 
       max="2030-06-14T00:00">
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
