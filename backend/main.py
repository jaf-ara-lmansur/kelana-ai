#sesi 3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bedrock_service import (get_ai_recommendation)
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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


@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendation(id: int):
    db = sessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
        
        # 1. Gunakan trip.category yang tersimpan di DB sebagai travel_style untuk AI
        travel_style = trip.category 
        
        # 2. Panggil AI dengan parameter lengkap dari DB
        try:
            ai_recommendation = get_ai_recommendation(
                trip.days,
                trip.destination,
                trip.budget,
                travel_style, # <-- Terisi nilai kategori (misal: "Backpacker", "Standard", "Luxury")
            )
            if not ai_recommendation:
                ai_recommendation = "rekomendasi tidak ditemukan"
        except Exception as e:
            print(f"Error AI Generation: {e}")
            ai_recommendation = "rekomendasi tidak ditemukan"
        
        # 3. Update dan simpan rekomendasi baru ke DB
        trip.ai_recommendation = ai_recommendation
        db.commit()
        db.refresh(trip)
        
        return trip
        
    finally:
        db.close()

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):

    #reuse session 2 busines logic
    try:
        ai_recommendation = get_ai_recommendation(
            request.days,
            request.destination,
            request.budget,
            request.travel_style,
        )
        if not ai_recommendation:
            ai_recommendation = "rekomendasi tidak ditemukan"
    except Exception:
        ai_recommendation = "rekomendasi tidak ditemukan"
    
    daily_budget = calculate_daily_budget(request.budget,request.days)
    category = get_trip_category(request.budget)
    trip=Trip(
        destination = request.destination,
        days = request.days,
        budget = request.budget,
        category = category,
        daily_budget = daily_budget,
        ai_recommendation = ai_recommendation
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

from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest):
    db = sessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
        
        # 1. Update budget dari request
        trip.budget = request.budget
        
        # 2. Recalculate category berdasarkan budget baru
        trip.category = get_trip_category(request.budget)
        
        # 3. Recalculate daily_budget menggunakan trip.days yang ada di DB
        trip.daily_budget = calculate_daily_budget(request.budget, trip.days)
        
        # 4. Simpan perubahan ke database
        db.commit()
        db.refresh(trip)
        return trip

    finally:
        db.close()