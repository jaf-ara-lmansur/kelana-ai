#sesi 3
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from sqlalchemy import func
from services.bedrock_service import get_ai_recommendation
from services.kb_services import ask_knowledge_base
from services.trip_service import(
    calculate_daily_budget,
    get_trip_category,
    get_recomenmendations,
    get_all_transportation
)
from services.auth_services import get_current_user, register_user, login_user
from database import init_db, sessionLocal
from models.trip import Trip
from models.user import User


class TripRequest (BaseModel):
    destination     :str
    days            :int
    budget          :float
    travel_style   :str
#fastApi validate JSON

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class LoginRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class QuestionRequest(BaseModel):
    question: str


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
#___________authentication endpoints____________________

@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest):
    db = sessionLocal()
    try:
        user = register_user(
            db       = db,
            name     = request.name,
            email    = request.email,
            password = request.password,
        )
        return {
            "id":         user.id,
            "name":       user.name,
            "email":      user.email,
            "created_at": user.created_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    finally:
        db.close()

@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = sessionLocal()
    try:
        return login_user(db=db, email=request.email, password=request.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    finally:
        db.close()

@app.get("/api/v1/auth/me")
def me(current_user: User = Depends(get_current_user)):
    db = sessionLocal()
    try:
        trip_count = db.query(Trip).filter(Trip.user_id == current_user.id).count()
        total_budget = db.query(func.coalesce(func.sum(Trip.budget), 0)).filter(
            Trip.user_id == current_user.id
        ).scalar()
    finally:
        db.close()
    return {
        "id":          current_user.id,
        "name":        current_user.name,
        "email":       current_user.email,
        "created_at":  current_user.created_at,
        "total_trips": trip_count,
        "total_budget": float(total_budget),
    }
#____________________

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
def generate_trip_recommendation(
    id: int,
    current_user: User = Depends(get_current_user),
):
    db = sessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
        if trip.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to generate this trip")
        
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

#____protected endpoints - require valid JWT token____

@app.post("/api/v1/trips")
def create_trip(request: TripRequest,
                current_user: User = Depends(get_current_user)):

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
        ai_recommendation = ai_recommendation,
        user_id = current_user.id
    )
    #save to postgreSQL
    db=sessionLocal()  
    db.add(trip)
    db.commit()
    db.refresh(trip) #get auto gerated id
    db.close()
    return trip

#@app.get("/api/v1/trips")
#def list_trips():
    db=sessionLocal()
    trips=db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips")
def list_trips(current_user: User = Depends(get_current_user)):
    db = sessionLocal()
    try:
        return db.query(Trip).filter(Trip.user_id == current_user.id).all()
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int,
             current_user: User = Depends(get_current_user)):
    db=sessionLocal()
    trip=db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with ID {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    return trip

@app.delete("/api/v1/trips/{id}")
def delete_trip(id: int,
                current_user: User = Depends(get_current_user)):
    db = sessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this trip")
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip with ID {id} has been deleted"}

from sqlalchemy.orm import Session

@app.put("/api/v1/trips/{id}")
def update_trip(id: int, request: TripRequest,
                current_user: User = Depends(get_current_user)):
    db = sessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip with ID {id} not found")
        if trip.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this trip")
        
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

@app.post("/api/v1/ask")
def ask_endpoint(request:QuestionRequest):
    result = ask_knowledge_base(request.question)
    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "average_relevance_score": result["average_relevance_score"],
        "accuracy_message": result["accuracy_message"],
    }