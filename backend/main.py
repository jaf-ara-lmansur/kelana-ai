from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_trip_season,
    get_recomenmendations,
    get_trip_transportation)
print("=========================")
print("KelanaAI")
print("=========================")
def print_trip_summary(
                       days,
                       budget,
                       country,
                       currency,
                       travel_month,
                       hotel = 100,
                       food = 30,
                       miscelnous = 50,
                       transport = 70):
    

    print("\n---------------------------")
    print("Recommended places")
    print("---------------------------")

# konfigurasi bussines logic
    country = get_recomenmendations(country)
    daily_budget = calculate_daily_budget(budget, days)
    category     = get_trip_category(budget)
    transport_type = get_trip_transportation(budget)
    season       = get_trip_season(travel_month)

    print("\n---------------------------")
    print(f"Daily Budget : {daily_budget:.2f} {currency}/day")
    print(f"Category     : {category}")
    print(f"Transport    : {transport_type}")
    print(f"Travel Season: {season}")
    
    fee_hotel=days*hotel
    fee_food=food*days
    fee_miscelnous=days*miscelnous
    fee_transport=days*transport

    total=fee_food+fee_hotel+fee_miscelnous+fee_transport
    if total>daily_budget:
        print("!!!! Budget Exceeded !!!!")
    else:
        print("=========================")
        print("Berikut rincian biaya\nyang anda keluarkan")
        print("=========================")
        print(f"Hotel            : {fee_hotel}")
        print(f"Makan             : {fee_food}")
        print(f"Transport          : {fee_transport}")
        print(f"Lain-lain           : {fee_miscelnous}")
        print("=========================")
        print("Enjoy Your Holiday!!")
        print("=========================")

print_trip_summary(
country		   =input("Destination : "),
days		      =int(input("Days : ")),
budget		   =float(input("Budget : ")),
currency	      =input("Currency : ").upper(),
travel_month	=input("Travel Month : ").capitalize()
)

