from flask import Flask, render_template
from flask_socketio import SocketIO
from datetime import datetime
from time import sleep
import threading
import requests
import json


# global variables

app = Flask(__name__, static_folder="/")
socketio = SocketIO(app)

busesPerStop = 10 # to be able to remove buses that can't be reached
currentBusData = []
busUpdateInterval = 1

currentEventData = []
eventUpdateInterval = 1

months = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]


# flask route handling 

@app.route("/", methods=["GET"])
def webpage():
    return render_template("page.html")

@app.route("/getBusData")
def getBusData():
    return currentBusData

@app.route("/getEventData")
def getEventData():
    return currentEventData


# helper function(s)

def getDateRange() -> str: # TODO: rydd opp i denne
    current_date = datetime.now()
    current_year = current_date.year
    current_month = str(current_date.month).zfill(2)
    current_day = str(current_date.day).zfill(2)
    date_after = f"date_after={current_year}-{current_month}-{current_day}"
    next_year = current_year + 1
    date_before = f"date_before={next_year}-{current_month}-{current_day}"
    return f"?{date_after}&{date_before}&page_size=30"


# event fetching

def busFetch() -> None:
    # order matters!
    # stopNumbers = [44085, # Gløshaugen
    #                41620, # Hesthagen
    #                42029] # Høgskoleringen
    stopNumbers = [75708,  # Gløshaugen nord
                   71204,  # Hesthagen nord
                   71939,  # Høgskoleringen nord
                   75707,  # Gløshaugen sør
                   102719, # Hesthagen sør
                   71940]  # Høgskoleringen sør

    global busesPerStop
    global currentBusData 
    global busUpdateInterval
    while True:
        writeData = []
        for num in stopNumbers:
            formattedBusResponse = formatBusResponse(queryATB(num), busesPerStop)
            writeData.append(formattedBusResponse)

        if writeData != [[], [], []]: # error handling
            currentBusData = json.dumps(writeData) # update bus data
        else:
            currentBusData = []
        sleep(busUpdateInterval)

def formatBusResponse(response: dict, busesPerStop: int) -> list:
    # error handling
    if response == {}:
        return []

    output = []
    for i in range(busesPerStop):
        data = response["data"]["quay"]["estimatedCalls"][i]

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
        # busEntry["route"] = data["destinationDisplay"]["frontText"]
        route = data["destinationDisplay"]["frontText"]
        if len(route) > 24:
            route = route[0:22] + ".."
        busEntry["route"] = route

        output.append(busEntry)
    return output

def queryATB(stopNumber: int) -> dict:
    global busesPerStop
    url = "https://api.entur.io/journey-planner/v3/graphql"
    date = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    # query = """
    #     { stopPlace(id: "NSR:StopPlace:"""+str(stopNumber)+"""\") {
    #         estimatedCalls(startTime: \""""+date+"""\" timeRange: 72100, numberOfDepartures: """+str(busesPerStop)+""") {     
    #           expectedDepartureTime
    #           destinationDisplay {
    #             frontText
    #           }
    #           serviceJourney {
    #             journeyPattern {
    #               line {
    #                 id
    #                 name
    #                 transportMode
    #               }
    #             }
    #           }
    #         }
    #       }
    #     }
    #     """
    query = """
            { quay(id: "NSR:Quay:"""+str(stopNumber)+"""\") {
                estimatedCalls(startTime: \""""+date+"""\" timeRange: 72100,
                               numberOfDepartures: """+str(busesPerStop)+""") {
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
    try:
        response = requests.post(url, json=data)
        return response.json()
    except Exception as e:
        print(f"error: {e}")
        return {}


# event fetching

def eventFetch() -> None:
    global eventUpdateInterval
    global currentEventData
    while True:
        writeData = formatEventResponse(queryWebkom())
        if writeData != []: # error handling
            currentEventData = json.dumps(writeData) # update event data
        else:
            currentEventData = []
        sleep(eventUpdateInterval)

def formatEventResponse(response: dict) -> list:
    # error handling
    if response == {}:
        return []

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

def queryWebkom() -> dict:
    url = "https://lego.abakus.no/api/v1/events" + getDateRange()
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"error: {e}")
        return {}


# start server

if __name__ == "__main__":
    # start fetching atb data
    busFetchThread = threading.Thread(target=busFetch)
    busFetchThread.start()

    # start fetching abakus data
    eventFetchThread = threading.Thread(target=eventFetch)
    eventFetchThread.start()

    app.run(debug=True, port=5000)
