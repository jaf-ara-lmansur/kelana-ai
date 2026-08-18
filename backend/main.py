#sesi 3
from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import(
    calculate_daily_budget,
    get_trip_category,
    get_trip_transportation,
    get_recomenmendations,
    get_all_transportation
)

class TripRequest (BaseModel):
    destination     :str
    days            :int
    budget          :float
    travel_style   :str
#fastApi validate JSON

app = FastAPI()
@app.get("/")
def home():
    return{
       "message" : "Welcome to kelana Ai"  
    }

@app.get("/health")
def health_status():
    return{
       "status" : "OK"
    }

@app.get("/api/v1/recommendations")
def recommendations(country: str = "japan"):  # "japan" di sini hanya nilai bawaan (default)
    rekom = get_recomenmendations(country)
    return {
        "country": country,
        "recommendations": rekom
    }

@app.get("/api/v1/transportations")
def transport():
    alltransport=get_all_transportation()
    return{
       "data": alltransport
    }

#POST endpoint - receive JSON

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget=calculate_daily_budget(
        request.budget, request.days
    )
    category=get_trip_category(
        request.budget
    )
    transport=get_trip_transportation(
        request.travel_style
    )

    return{
        "destination"       : request.destination,
        "budget"            : request.budget,
        "daily-budget"      : daily_budget,
        "category"          : category,
        "transport"         : transport
    }

