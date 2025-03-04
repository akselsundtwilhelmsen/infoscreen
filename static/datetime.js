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
	const dayWord = now.toLocaleString('no', { weekday: 'long' });
	const dayNumber = pad(now.getDate());
	const month = pad(now.getMonth() + 1);
	const year = now.getFullYear();


    // clear screen
    while (dateTimeDiv.firstChild) {
        dateTimeDiv.removeChild(dateTimeDiv.firstChild);
    }

	// abakule
	const abakusLogo = document.createElement("div");
	abakusLogo.className = "abakusLogo";
    abakusLogo.innerHTML = "<img src='static/icons/abakule.png' class='abakule'></img>";
	dateTimeDiv.appendChild(abakusLogo);

	// time
	const time = document.createElement("h1")
	time.className = "time";
	time.innerText = `${hours}:${minutes}`
	dateTimeDiv.appendChild(time);

	// date
	const date = document.createElement("div")
	date.classList.add("date", "subtle");
	//date.innerText = `${dayWord} ${dayNumber}/${month}/${year}`
	date.innerText = `${dayNumber}/${month}/${year}`
	dateTimeDiv.appendChild(date);


}

// start program
const dateTimeDiv = document.getElementById("dateTime");
dateTimeUpdate(dateTimeDiv);
setInterval(() => dateTimeUpdate(dateTimeDiv), updateIntervalMS);
