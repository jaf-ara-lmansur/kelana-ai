#sesi 3
from fastapi import FastAPI
from pydantic import BaseModel
from services.trip_service import(
    calculate_daily_budget,
    get_trip_category,
    get_recomenmendations,
    get_all_transportation
)
from database import init_db, sessionLocal
from models.trip import Trip
class TripRequest (BaseModel):
    destination     :str
    days            :int
    budget          :float
    travel_style   :str
#fastApi validate JSON


app = FastAPI()
init_db() 

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
def recommendations(country: str = "japan"):  #nilai bawaan (default)
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

    #reuse session 2 busines logic
    daily_budget = calculate_daily_budget(request.budget,request.days)
    category = get_trip_category(request.budget)
    trip=Trip(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget
    )
    #save to postgreSQL
    db=sessionLocal() 
    db.add(trip)
    db.commit()
    db.refresh(trip) #get auto gerated id
    db.close()
    return trip
