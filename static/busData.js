var busStopNames = ["Gløshaugen", "Hesthagen", "Høgskoleringen"];

async function fetchBusData() {
    return fetch('/getBusData')
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        });
}

async function busUpdateDOM(arg) {
    const busData = await fetchBusData();
    const busCard = document.getElementById(arg);

    // clear screen
    while (busCard.firstChild) {
        busCard.removeChild(busCard.firstChild);
    }

    for (let a = 0; a < busData.length; a++) {
        // entire bus stop div
        const busStop = document.createElement("div");
        busStop.className = "busStop";
        busStop.id = busStopNames[a];

		// bus stop header 
        const busStopHeader = document.createElement("div");
        busStopHeader.className = "busStopHeader"

			// bus stop label(name)
			const busStopName = document.createElement("h2");
			busStopName.className = "busStopName"
			busStopName.innerText = busStopNames[a];
			busStopHeader.appendChild(busStopName);

			// bus stop direction
			const busStopDirection = document.createElement("h4");
			busStopDirection.className = "busStopDirection"
			busStopDirection.innerText = "retning x"; // TODO fix
			busStopHeader.appendChild(busStopDirection);

        busStop.appendChild(busStopHeader);

        // bus departures
        for (let b = 0; b < busData[a].length; b++) {
            const departure = document.createElement("div");
            departure.className = "busDeparture";
            if (b % 2 == 0) {
                departure.classList.add("busDepartureAlt")
            }
            if (b == 0) {
                departure.id = ("busDepartureFirst");
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
            //lineNumber.innerHTML += busData[a][b]["lineNo"];
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

busUpdateDOM("busCard1");
setInterval(busUpdateDOM, 10000); // 1000->15000

busUpdateDOM("busCard2");
setInterval(busUpdateDOM, 10000); // 1000->15000
