
def print_trip_summary(destination,
                       days,
                       budget,
                       country,
                       currency,
                       travel_month,
                       hotel = 100,
                       food = 30,
                       miscelnous = 50,
                       transport = 70):
    print("==========")
    print("KelanaAI")
    print("==========")
    print(f"Destination     : {destination}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget}")
    print(f"Month           : {travel_month}")
    print(f"Currency        : {currency}")
    print(f"Country         : {country}")

    fee_hotel=days*hotel
    fee_food=food*days
    fee_miscelnous=days*miscelnous
    fee_transport=days*transport

    total=fee_food+fee_hotel+fee_miscelnous+fee_transport
    if total>budget:
        print("!!!! Budget Exceeded !!!!")
    else:
        print("===============")
        print("Berikut rincian biaya yang anda keluarkan")
        print("===============")
        print(f"Hotel            : {fee_hotel}")
        print(f"Makan             : {fee_food}")
        print(f"Transport          : {fee_transport}")
        print(f"Lain-lain           : {fee_miscelnous}")
        print("===============")
        print("Enjoy Your Holiday!!")
        print("===============")


print_trip_summary(

destination	   =input("Destination : "),
country		   =input("Country : "),
days		      =int(input("Days : ")),
budget		   =float(input("Budget : ")),
currency	      =input("Currency : "),
travel_month	=input("Travel Month : ")
)