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

async function dateTimeUpdate(dateTimeDiv) {
	const now = new Date();

	const pad = (n) => String(n).padStart(2, '0');

	const hours = pad(now.getHours());
	const minutes = pad(now.getMinutes());

    // clear screen
    while (dateTimeDiv.firstChild) {
        dateTimeDiv.removeChild(dateTimeDiv.firstChild);
    }

	// time
	const time = document.createElement("h1")
	time.className = "time";
	time.innerText = `${hours}:${minutes}`
	dateTimeDiv.appendChild(time);
}

// start program
const dateTimeDiv = document.getElementById("dateTime");
dateTimeUpdate(dateTimeDiv);
setInterval(() => dateTimeUpdate(dateTimeDiv), updateIntervalMS);
