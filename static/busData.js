// global variables
var updateIntervalMS = 1000;
var departuresPerStop = 10;
var busStopNames = ["Gløshaugen", "Hesthagen", "Høgskoleringen"];
var directions = ["fra sentrum", "mot sentrum"]

// get bus data from webserver
async function fetchBusData() {
    return fetch('/getBusData')
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        });
}

// populate the DOM with bus data
async function busUpdateDOM(busCardId, direction) {
    const busData = await fetchBusData();
    const busCard = document.getElementById(busCardId);

    // clear screen
    while (busCard.firstChild) {
        busCard.removeChild(busCard.firstChild);
    }

	// determine which bus stop direction to update
	if (direction == 1) {
		var a = 0;
		var to = busData.length / 2;
	}
	else {
		var a = busData.length / 2;
		var to = busData.length ;
	}

    for (; a < to; a++) {
        // entire bus stop div
        const busStop = document.createElement("div");
        busStop.className = "busStop";
        busStop.id = busStopNames[a % 3];

		// bus stop header 
        const busStopHeader = document.createElement("div");
        busStopHeader.className = "busStopHeader"

			// bus stop label(name)
			const busStopName = document.createElement("h2");
			busStopName.className = "busStopName"
			busStopName.innerText = busStopNames[a % 3];
			busStopHeader.appendChild(busStopName);

			// bus stop direction
			const busStopDirection = document.createElement("h4");
			busStopDirection.classList.add("busStopDirection", "subtle");
			busStopDirection.innerText = directions[direction];
			busStopHeader.appendChild(busStopDirection);

        busStop.appendChild(busStopHeader);


        // bus departures
        for (let b = 0; b < departuresPerStop; b++) {
            const departure = document.createElement("div");
            departure.className = "busDeparture";

			// error handling
			if (busData[a].length == 0) {
				const errormessage = document.createElement("div");
				errormessage.className = "errorMessage";
				errormessage.innerText = "No connection :(";
				departure.appendChild(errormessage);
				busStop.appendChild(departure);
				continue;
			}

            // line number 
            const lineNumber = document.createElement("div");
            lineNumber.id = "busLineNumber";
            lineNumber.className = "busInnerBox";
			lineNumber.innerHTML = "";
			if (!(busData[a][b]["lineNo"].includes("FB"))) {
            	lineNumber.innerHTML += "<img src='static/icons/bus.png' class='busIcon'></img>";
			}
            lineNumber.innerHTML += `<p class='lineNumber'>${busData[a][b]["lineNo"]}</p>`
            departure.appendChild(lineNumber);

            // route 
            const route = document.createElement("div");
            route.id = "busRoute";
            route.className = "busInnerBox";
            route.innerText = busData[a][b]["route"];
            departure.appendChild(route);

            // departure time
            const departureTime = document.createElement("div");
            departureTime.id = "busDepartureTime";
            departureTime.className = "busInnerBox";
            departureTime.innerText = busData[a][b]["departureTime"];
            departure.appendChild(departureTime);

            busStop.appendChild(departure);
        }
        busCard.appendChild(busStop);
    }
}

// start program
window.onload = () => {
    busUpdateDOM("busCard1", 0);
    busUpdateDOM("busCard2", 1);
    setInterval(() => busUpdateDOM("busCard1", 0), updateIntervalMS);
    setInterval(() => busUpdateDOM("busCard2", 1), updateIntervalMS);
};
