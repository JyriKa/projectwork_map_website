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

function createCommentBox(username, date, commentBody, index) {
  let commentBox = `
            <div class="comment-box"">
              <div class="comment-meta">
                <div class="comment-user">
                <p id="username-${index}"></p>
                </div>
                <div class="comment_date">
                  <p id="comment-date${index}"></p>
                </div>
              </div>
              <div class="comment-body">
                <p id="comment-body${index}"></p>
              </div>
            </div>
      `;
  return commentBox;
}

function updateComments(event) {
  const clickedElement = event.target;
  if (clickedElement.getAttribute("data-isListening") !== null) return;

  clickedElement.setAttribute("data-isListening", "listening");
  const placeName = clickedElement.getAttribute("data-location");
  let i = 0;
  db.collection(placeName).onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const docData = change.doc.data();
        const timestamp = docData.timestamp;
        const username = docData.username;
        const commentBody = docData.comment;

        // TODO prevent adding multiple divs with same comment
        let commentBox = createCommentBox(username, timestamp, commentBody, i);
        // Remove spaces from space id, otherwise it won't work
        const placeId = ("#" + placeName).split(" ").join("");
        // Append comment box to content-div with jquery

        $(placeId).append(commentBox);
        $("#username-" + i).text(username);
        $("#comment-date" + i).text(timestamp);
        $("#comment-body" + i).text(commentBody);
        i++;
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
          <div class="content" id="${placeId}"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  // Returns a single modal
  return modal;
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
