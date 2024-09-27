var busStopNames = ["Gløshaugen", "Hesthagen", "Høgskoleringen"];

async function fetchBusData() {
    return fetch('/getBusData')
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        });
}

async function busUpdateDOM() {
    const busData = await fetchBusData();
    const busCard = document.getElementById("busCard");

    // clear screen
    while (busCard.firstChild) {
        busCard.removeChild(busCard.firstChild);
    }

    for (let a = 0; a < busData.length; a++) {
        // entire bus stop div
        const busStop = document.createElement("div");
        busStop.className = "busStop";
        busStop.id = busStopNames[a];

        // bus stop label(name)
        const busStopName = document.createElement("h3");
        busStopName.className = "busStopName"
        busStopName.innerText = busStopNames[a];
        busStop.appendChild(busStopName);

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
            // lineNumber.innerHTML = "<img src='static/icons/busIcon.svg'></img>";
            // lineNumber.innerHTML =+ `<p>${busData[a][b]["lineNo"]}</p>`
            lineNumber.innerHTML = busData[a][b]["lineNo"];
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

busUpdateDOM();
setInterval(busUpdateDOM, 10000); // 1000->15000
