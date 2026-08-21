#sesi 3
from fastapi import FastAPI, HTTPException
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

@app.get("/api/v1/trips")
def list_trips():
    db=sessionLocal()
    trips=db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db=sessionLocal()
    trip=db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with ID {trip_id} not found")
    return trip

@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int):
    db = sessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip with ID {id} has been deleted"}

@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest):
    db = sessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
    
    # Update the trip attributes
    trip.destination = request.destination
    trip.days = request.days
    trip.budget = request.budget
    trip.category = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, request.days)
    
    db.commit()
    db.refresh(trip)
    db.close()
    
    return trip