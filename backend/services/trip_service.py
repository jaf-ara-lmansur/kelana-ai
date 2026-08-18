def calculate_daily_budget(budget,days):
    return budget/days

#Trip Category
def get_trip_category(budget):
    if budget<1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"
    
#Trip transportation
def get_trip_transportation(travStyle):
    if travStyle == "backpaker":
        return "Bus"
    elif travStyle == "family":
        return "Train"
    else:
        return "Flight"

#Travel Season
def get_trip_season(month):
    if month=="December":
        return "Peak Season"
    elif month == "June":
        return "Holiday season"
    else:
        return "Regular Season"
    

#daily = calculate_daily_budget(1500,5)
#category = get_trip_category(1500)
#print(f"{category} {daily} USD/day")

recommended_placeJPN=[
    "Tokyo Tower",
    "Shibuya",
    "Mount Fuji"
]
recommended_placeKOR=[
    "Seoul Tower",
    "Gyeongbokgung Palace",
    "Gamcheon Culture Village"
]

def get_recomenmendations(country: str):
    trip_country = country.lower()
    if trip_country in ["japan", "jepang"]:
        return recommended_placeJPN
    elif trip_country in ["korea", "korea selatan"]:
        return recommended_placeKOR
    else:
        return []

trasnportation=[
    "Bus",
    "Train",
    "Flight"
    ]
def get_all_transportation():
    return {
       "transportation": trasnportation
    }
    