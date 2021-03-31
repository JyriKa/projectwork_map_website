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
      location: placeName
    })
    //empties forms and updates comments
    document.getElementById("username" + i).value = "";
    document.getElementById("comment" + i).value = "";
    updateComments(event);
  }
};

function updateComments(event) {
  const placeName = event.target.getAttribute("data-location");
  let list = "";
  //gets comments by location
  db.collection("comments").where("location", "==", placeName).get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        //forms the date and adds comments to a list
        const timestamp = doc.data().timestamp.toDate();
        const date = timestamp.getDate() + "." + timestamp.getMonth() + "." + timestamp.getFullYear() + " " + timestamp.getHours() + ":" + timestamp.getMinutes();
        list = list + date + " | " + doc.data().username + " - " + doc.data().comment + "<br>";
      })

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
    const popUpText =
      "<h3>" + placeId["name"] + "</h3>" + "<p>" + placeId["address"] + "</p>";
    marker.bindPopup(popUpText);

    marker.addEventListener("click", function () {
      mymap.flyTo([placeId["longitude"], placeId["latitude"]], 16);
    });

    element.addEventListener("click", function () {
      marker.openPopup();
      mymap.flyTo([placeId["longitude"], placeId["latitude"]], 16);
    });
  }
};

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
    };

    let card = `
          <div class="card" style="width: 17rem">
            <div class="card-body">
              <h5 class="card-title">${placeName}</h5>
              <a href="#collapse${i}"data-toggle="collapse">
                <h5 class ="card-image">
<<<<<<< HEAD
                <img src = ${picture} height = 200; width = 245;></h5></a>
=======
                <img src = ${picture} alt = "${placeName}" height = 175; width = 230;></h5></a>
>>>>>>> 298c1bd3eb8b8dabbe66802a0e647c5684af5572
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


    let modal = `<div id="myModal${i}" class="modal fade" role="dialog">
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                          <div class="modal-body">
                            <p id="${placeName}" style="color:black;text-align:left;"></p>
                            
                            <form>
                              <label for="name" style="color:black;">Username:</label><br>
                              <input type="text" id="username${i}" name="username" ><br>
                              <label for="comment" style="color:black;">Comment:</label><br>
                              <input type="text" id="comment${i}" name="comment"><br>
                            </form>
                            <button type="button" id="addComment${i}" class="btn btn-primary" data-location="${placeName}" i="${i}">POST COMMENT</button>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                          </div>
                      </div>
                    </div>
                  </div>`

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
<<<<<<< HEAD
};

=======
}
>>>>>>> 298c1bd3eb8b8dabbe66802a0e647c5684af5572
addListItems();

// Collapse others when a card is clicked
$(document).ready(function () {
  $(".collapse").on("show.bs.collapse", function () {
    $(".collapse.show").each(function () {
      $(this).collapse("hide");
    });
  });
});
