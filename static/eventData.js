// global variables
var bedpres = ["course", "alternative_presentation", "breakfast_talk", "company_presentation"];
var arrangement = ["other", "social", "party", "event"]; //TODO: KiD-arrangement ??
var maxEventCount = 10;
var updateIntervalMS = 10000

// get event data from webserver
async function fetchEventData() {
    return fetch('/getEventData')
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        });
}

// populate the DOM with event data
async function eventUpdateDOM() {
    const data = await fetchEventData();
    const arrangementCard = document.getElementById("arrangementCard");
    const bedpresCard = document.getElementById("bedpresCard");

    let arrangementCount = 1;
    let bedpresCount = 1;

    // clear screen
    while (arrangementCard.firstChild) {
        arrangementCard.removeChild(arrangementCard.firstChild);
    }
    while (bedpresCard.firstChild) {
        bedpresCard.removeChild(bedpresCard.firstChild);
    }

	//// error handling
	//if (data.length == 0) {
	//       const errorDiv1 = document.createElement("div");
	//	errorDiv1.classList.add("event", "errorMessage", "eventError");
	//	errorDiv1.innerText = "No connection :(";
	//       arrangementCard.appendChild(errorDiv1);
	//
	//	const errorDiv2 = document.createElement("div");
	//	errorDiv2.classList.add("event", "errorMessage", "eventError");
	//	errorDiv2.innerText = "No connection :(";
	//	bedpresCard.appendChild(errorDiv2);
	//
	//	return;
	//}

    for (var key in data) {
        var value = data[key];
        const eventDiv = document.createElement("div");
        eventDiv.className = "event";

        let innerClass = "eventInnerBox";

        // info
        const infoDiv = document.createElement("div");
        infoDiv.id = "eventInfo"
        infoDiv.className = "eventLeft";

        // title
        const eventTitle = document.createElement("div");
        eventTitle.id = "eventTitle";
        eventTitle.className = innerClass;
        eventTitle.innerText = value.title;
        infoDiv.appendChild(eventTitle);
        if (value.title.toLowerCase().includes("[avlyst]")) {
            eventTitle.classList.add("cancelled");
        }

        // capacity
        const eventCapacity = document.createElement("div");
        eventCapacity.id = "eventCapacity";
        eventCapacity.className = innerClass;
        eventCapacity.innerText = value.capacity;
        eventCapacity.innerText = value.capacity;
        let capacity = value.capacity.split('/');
        if (capacity[1] == '0') {
            eventCapacity.classList.add("eventEmpty");
        	eventCapacity.innerText = "0/x";
        }
        else if (capacity[0] == capacity[1]) {
            eventCapacity.classList.add("eventFull");
        }
        else {
            eventCapacity.classList.add("eventNotFull");
        }
        infoDiv.appendChild(eventCapacity);

        // time and date
        const eventTime = document.createElement("div");
        eventTime.id = "eventTime";
        eventTime.className = innerClass;
        eventTime.innerText = value.time;
        infoDiv.appendChild(eventTime);

        eventDiv.appendChild(infoDiv);

        // header
        const headerDiv = document.createElement("div");
        headerDiv.className = "eventHeader";
        headerDiv.className = "eventRight";
        headerDiv.innerHTML = `<img class="eventHeader" src=${value.cover}>`

        eventDiv.appendChild(headerDiv);

        // place into correct table
        if (arrangement.includes(value.eventType) && arrangementCount <= maxEventCount) {
            arrangementCard.appendChild(eventDiv);
            arrangementCount += 1;
        }
        else if (bedpres.includes(value.eventType) && bedpresCount <= maxEventCount) {
            bedpresCard.appendChild(eventDiv);
            bedpresCount += 1;
        }
    }
}

// start program
eventUpdateDOM();
setInterval(eventUpdateDOM, updateIntervalMS);
