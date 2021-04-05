const places = [
  {
    name: "University of Oulu",
    text:
      "The University of Oulu. A location of learning for thousands of students from various walks of life. The campus houses several restaurants and other establishments, including a few libraries and even less official 'student spaces' for extra curricular activities.",
    longitude: 65.05927696679123,
    latitude: 25.466218396946577,
    address: "Pentti Kaiteran katu 1, 90570 Oulu",
    picture:
      "./pictures/uni_entrance.jpg",
  },
  {
    name: "Rotuaari",
    text:
      "Is the pedestrian street in the city centre of Oulu. It is often used as a meeting location for grouping up before heading over to student activities that reside somewhere within the  city centre. Even if you are not familiar with the people who you are to meet, chances are that they are standing quite close to the Rotuaari Ball landmark.",
    longitude: 65.01222,
    latitude: 25.4711,
    address: "Kirkkokatu 17, 90100 Oulu",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Kirkkokatu_Oulu_20191229.jpg/250px-Kirkkokatu_Oulu_20191229.jpg",
  },
  {
    name: "Pub Caio",
    text:
      "Pub Caio, sometimes referred to as lecture hall Ca10, is the pub closest to the University, with close student ties. It used to be owned by Uniresta in ages past, which made it popular among students, but since then it has renovated and reimagined itself under its new owners. It is often used as a meeting place for extra curricular student activities that necessiate a less formal environment.",
    longitude: 65.05966605837962,
    latitude: 25.47850004112316,
    address: "Sammonkatu 10, 90570 Oulu",
    businesshours: "Tuesday-Saturday: 6pm-1am",
    picture:
      "./pictures/caio_entrance.jpg",
  },
  {
    name: "Toripolliisi",
    text:
      "A land mark statue in the market agora of Oulu. A robust policeman, with a vigilant unwavering gaze. It is another popular gathering place inside the city centre for some activities.",
    longitude: 65.01329,
    latitude: 25.46471,
    address: "Kauppatori 2, 90100 Oulu",
  },
  {
    name: "Matkahuolto",
    text:
      "Matkahuolto is basically the bus station that connects you to rest of Finland. Native students who face financial hardship are wise to have enough savings left to buy themselves a bus ticket that takes them back to their caring parents, where the fridge is stocked with goods, and the stove prepares meals other than macaroni.",
    longitude: 65.00911788581863,
    latitude: 25.48083894235691,
    address: "Ratakatu 6, 90130 Oulu",
    businesshours: "Monday-Friday: 7:30am-6pm",
  },
  {
    name: "Train station",
    text:
      "If taking a bus is not a feasible option, the train station right next to Matkahuolto can speed you away to locations further away from Oulu. There is a pedestrian tunnel going under the railroad tracks, connecting Matkahuolto with the eastern city centre.",
    longitude: 65.01155358063724,
    latitude: 25.483920169956907,
    address: "Rautatienkatu 11a, 90100 Oulu",
    businesshours: "Waiting room opening hours\nDaily: 4am-1:20pm",
  },
  {
    name: "Main library",
    text:
      "The main library of Oulu is located near the market agora. It is a location for some cultural events as well and depending on your interest, can become a familiar place to visit. Even though most of your study needs are already taken care of by the university libraries, the main library of Oulu is larger and not as focused to the needs of students, giving it a wider variety of literature to choose from.",
    longitude: 65.01545567873652,
    latitude: 25.463386941121744,
    address: "Kaarlenväylä 3, 90100 Oulu",
    businesshours:
      "Monday-Friday: 8:30am-8pm\nSaturday: 9am-4pm\nSunday: 12pm-4pm",
  },
  {
    name: "Public traffic",
    text:
      "If you are going to use the public transportation of Oulu a lot over the student life, it might be of interest to get a season card for the city buses. This saves you some money over paying with cash, as charging the card with uses is a cheaper option. It also spares you some hassle when boarding a bus, since you only need to have the card ready, so you need not look for change from your wallet.",
    longitude: 65.01383,
    latitude: 25.46965,
    address: "Torikatu 10, 90100 Oulu",
    businesshours: "Oulu10\nMonday-Friday: 9am-4pm",
  },
  {
    name: "Bike stuff",
    text:
      "There are various bike stores spread around in Oulu. A bicycle is often the main means of transportation for a student. Not only is it a healthy form of everyday exercise, but it can also save you money over taking a bus, and time if the option were to walk. In recent years, there was a push for rentable city bikes, too, but it is still figuring itself out.",
    longitude: 65.02561,
    latitude: 25.47724,
    address: "Valtatie 49, 90500 Oulu",
    businesshours:
      "Jussin Pyöräpiste\nMonday-Friday: 9am-6pm\nSaturday: 9am-2pm",
  },
  {
    name: "YTHS",
    text:
      "The student healthcare is located right next to the university, providing vital services such as dentistry, general practice, and mental health services. If you are a student, you have the student healthcare fee as well, so you are viable to use their services. For more serious and acute ailments, the actual hospital is probably a better choice, despite being a good distance away from the campus region.",
    longitude: 65.0578412742499,
    latitude: 25.471201639275847,
    address: "Yliopistokatu 1, 90570 Oulu",
    businesshours: "Monday-Thursday: 8am-3pm\nFriday: 8am-2pm",
    picture:
      "./pictures/yths_entrance.jpg",
  },
  {
    name: "Teekkaritalo",
    text:
      "Teekkaritalo often serves as a partying place for various student parties that take place outside the city centre and/or night clubs. It is sizable enough to house the active students of larger guilds, but smaller guilds also collaborate to fill it up to its full capacity. Due to its roots as being a place specifically built by the technology students back in the day, it is very student friendly by offering a decent premise at an affordable cost, complete with two saunas and a yard with a fireplace at a gazebo.",
    longitude: 65.06384497095632,
    latitude: 25.483870212287922,
    address: "Kalervontie 7, 90570 Oulu",
  },
  {
    name: "Ape house",
    text:
      "Ape house or 'Apinatalo' is a nickname given to the PSOAS apartment house next to Kaijonharju ape statue. It has particular fame due to its penthouse hobby room, which is one of the most affordable event locations to rent for a moderately sized group of people. It is even cheaper for people who already live in the building, and who coincidentally can also unlock the saunas next to the hobby room. This 'inside man' arrangement makes it the cheapest rentable sauna location.",
    longitude: 65.06073332629437, 
    latitude: 25.479424593936216,
    picture:
      "./pictures/ape_house_entrance.jpg",

    address: "Tellervontie 2A, 90570 Oulu",
  },
  {
    name: "Club Sixteen",
    text:
      "The 'Club Sixteen' is a very informal name for the apartment house of Yliopistokatu 16, due to its notorious history of serving as a crazy party house for international students.",
    longitude: 65.06073332629437, 
    latitude: 25.479424593936216,
    picture:
      "./pictures/club_sixteen.jpg",

    address: "Yliopistokatu 16, 90570 Oulu",
  },
];
