from flask import Flask, render_template
from flask_socketio import SocketIO
from datetime import datetime
from time import sleep
import threading
import requests
import json

app = Flask(__name__, static_folder="/")
socketio = SocketIO(app)

busesPerStop = 12 # to be able to remove buses that can't be reached
currentBusTimes = []
busUpdateInterval = 10

currentEventData = []
eventUpdateInterval = 1

months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]

@app.route("/", methods=["GET"])
def webpage():
    return render_template("page.html")

@app.route("/getBusData")
def getBusData():
    return currentBusTimes

@app.route("/getEventData")
def getEventData():
    return currentEventData

def getDateRange(): # TODO: rydd opp i denne
    current_date = datetime.now()
    current_year = current_date.year
    current_month = str(current_date.month).zfill(2)
    current_day = str(current_date.day).zfill(2)
    date_after = f"date_after={current_year}-{current_month}-{current_day}"
    next_year = current_year + 1
    date_before = f"date_before={next_year}-{current_month}-{current_day}"
    return f"?{date_after}&{date_before}&page_size=30"

def busFetch():
    stopNumbers = [44085, 41620, 42029] # Gløshaugen, Hesthagen, Høgskoleringen
    # order matters

    global busesPerStop
    global currentBusTimes 
    while True:
        writeData = []
        for num in stopNumbers:
            currentStop = formatBusResponse(queryATB(num), busesPerStop)
            writeData.append(currentStop)
        currentBusTimes = json.dumps(writeData)
        sleep(busUpdateInterval)

def formatBusResponse(response: dict, busesPerStop) -> list:
    output = []
    for i in range(busesPerStop):
        data = response["data"]["stopPlace"]["estimatedCalls"][i]

        time = data["expectedDepartureTime"].split("T")[1].split("+")[0].split(":")[:2]
        now = datetime.now()
        departureTime = f"{time[0]}:{time[1]}"
        if int(now.hour) == int(time[0]):
            minuteDifference = int(time[1]) - int(now.minute)
            if minuteDifference == 0:
                departureTime = "nå"
            elif minuteDifference <= 10:
                departureTime = f"{minuteDifference} min"
        elif int(now.hour) == int(time[0])-1 or (int(now.hour) == 23 and int(time[0]) == 0) :
            minuteDifference = 60 + int(time[1]) - int(now.minute)
            if minuteDifference <= 10:
                departureTime = f"{minuteDifference} min"

        lineNumber = data["serviceJourney"]["journeyPattern"]["line"]["id"].split(":")[2]
        if "_" in lineNumber:
            lineNumber = lineNumber.split("_")[1]

        busEntry = {}
        busEntry["departureTime"] = departureTime
        busEntry["lineNo"] = lineNumber
        busEntry["route"] = data["destinationDisplay"]["frontText"]
        output.append(busEntry)
    return output

def queryATB(stopNumber: int) -> dict:
    global busesPerStop
    url = "https://api.entur.io/journey-planner/v3/graphql"
    date = datetime.now().strftime("%Y-%m-%dT%H:%M:%S") # TODO tidssonefeil???
    query = """
        { stopPlace(id: "NSR:StopPlace:"""+str(stopNumber)+"""\") {
            estimatedCalls(startTime: \""""+date+"""\" timeRange: 72100, numberOfDepartures: """+str(busesPerStop)+""") {     
              expectedDepartureTime
              destinationDisplay {
                frontText
              }
              serviceJourney {
                journeyPattern {
                  line {
                    id
                    name
                    transportMode
                  }
                }
              }
            }
          }
        }
        """
    data = {'query': query}
    response = requests.post(url, json=data)
    return response.json()

def eventFetch():
    global eventUpdateInterval
    global currentEventData
    while True:
        writeData = formatEventResponse(queryWebkom())
        currentEventData = json.dumps(writeData)
        sleep(eventUpdateInterval)

def formatEventResponse(response):
    global months
    titleMaxLength = 40
    output = []
    response = response["results"]
    for event in response:
        currentEvent = {}

        if len(event["title"]) > titleMaxLength:
            currentEvent["title"] = event["title"].strip(" ")[:titleMaxLength-3]+"..."
        else:
            currentEvent["title"] = event["title"]

        currentEvent["cover"] = event["cover"]
        currentEvent["coverPlaceholder"] = event["coverPlaceholder"]
        currentEvent["eventType"] = event["eventType"]
        
        time = event['startTime'].split('T')[1].split(':')[:2]
        date = event['startTime'].split('T')[0].split('-')[1:]
        currentEvent["time"] = \
                f"{int(date[1])}. {months[int(date[0])-1]}, {time[0]}:{time[1]}"
                               
        currentEvent["capacity"] = \
                f"{event['registrationCount']}/{event['totalCapacity']}"
        # if currentEvent["capacity"] == "0/0":
        #     currentEvent["capacity"] = "_"
        output.append(currentEvent)
    return output


def queryWebkom():
    url = "https://lego.abakus.no/api/v1/events" + getDateRange()
    response = requests.get(url)
    return response.json()

if __name__ == "__main__":
    busFetchThread = threading.Thread(target=busFetch)
    busFetchThread.start()

    eventFetchThread = threading.Thread(target=eventFetch)
    eventFetchThread.start()

    app.run(debug=True, port=5000)
