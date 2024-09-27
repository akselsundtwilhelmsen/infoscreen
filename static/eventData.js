var bedpres = ["course", "alternative_presentation", "breakfast_talk", "company_presentation"];
var arrangement = ["other", "social", "party", "event"]; //TODO: KiD-arrangement ??
var maxEventCount = 10;

async function fetchEventData() {
    return fetch('/getEventData')
        .then(response => response.text())
        .then(data => {
            return JSON.parse(data);
        });
}

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

    for (var key in data) {
        var value = data[key];
        const eventDiv = document.createElement("div");
        eventDiv.className = "event";

        let outerClass = "eventOuterBox";
        let innerClass = "eventInnerBox";

        // info
        const infoDiv = document.createElement("div");
        infoDiv.id = "eventInfo"
        infoDiv.className = outerClass;
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
        let capacity = value.capacity.split('/');
        if (capacity[1] == '0') {
            eventCapacity.classList.add("eventEmpty");
        }
        else if (capacity[0] = capacity[1]) {
            eventCapacity.classList.add("eventNotFull");
        }
        else {
            eventCapacity.classList.add("eventFull");
        }
        eventCapacity.innerText = value.capacity;
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
        headerDiv.id = "eventHeader";
        headerDiv.className = outerClass;
        headerDiv.innerHTML = `<img src=${value.cover}>`

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

eventUpdateDOM();
setInterval(eventUpdateDOM, 1000); //TODO:360000/2
