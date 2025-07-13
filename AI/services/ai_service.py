import os
import pickle
import requests
from sentence_transformers import SentenceTransformer, util
from pymongo import MongoClient
from services.forecast_service import generate_inventory_forecast
from services.staff_service import evaluate_staff_scores

# ===================== Setup =====================
model = SentenceTransformer('all-mpnet-base-v2')
uri = os.getenv("MONGO_URI")
client = MongoClient(uri)
db = client["scanify"]
bills_col = db["bills"]
staff_col = db["staffs"]
product_type_col = db["producttypes"]
product_item_col = db["productitems"]
PROMPT_FILE = "prompt_embeddings.pkl"
NODE_BACKEND_API = os.getenv("NODE_BACKEND_API", "http://localhost:5000/api/staff/single")

# ===================== Data Fetch =====================
def fetch_bills():
    return list(bills_col.find({}, {"_id": 0}))

def fetch_staff():
    staff = list(staff_col.find({}, {"_id": 1, "name": 1, "username": 1}))
    for i, s in enumerate(staff):
        s["staffId"] = i + 1
    return staff

def fetch_products():
    product_types = list(product_type_col.find({}, {"_id": 0}))
    product_items = list(product_item_col.find({}, {"_id": 0}))
    stock_map = {}

    for item in product_items:
        if not item.get("sold"):
            type_id = item["type"]
            product = product_type_col.find_one({"_id": type_id})
            if product:
                name = product["name"]
                stock_map[name] = stock_map.get(name, 0) + 1

    for p in product_types:
        p["stock"] = stock_map.get(p["name"], 0)
    return product_types

# ===================== Prompt Generator =====================
def generate_prompt_map(staff, products):
    prompt_map = {}

    for s in staff:
        name = s["name"].lower()
        prompts = [
            f"tell me the performance of {name}",
            f"how did staffid {s['staffId']} perform?",
            f"show me score for {name}",
            f"{name} sales report",
            f"staff performance {name}"
        ]
        for p in prompts:
            prompt_map[p] = s

    for p in products:
        name = p["name"].lower()
        prompts = [
            f"what’s the forecast for {name}",
            f"how many days {name} will last?",
            f"tell me about inventory of {name}",
            f"{name} stock details",
            f"inventory forecast for {name}"
        ]
        for pr in prompts:
            prompt_map[pr] = p

    return prompt_map

def save_prompt_embeddings(prompt_map):
    embeddings = model.encode(list(prompt_map.keys()), convert_to_tensor=True)
    with open(PROMPT_FILE, "wb") as f:
        pickle.dump((prompt_map, embeddings), f)

def load_prompt_embeddings():
    if not os.path.exists(PROMPT_FILE):
        return None, None
    with open(PROMPT_FILE, "rb") as f:
        return pickle.load(f)

# ===================== Helper: Staff Extraction =====================
def extract_staff_by_name(query, staff_list):
    query = query.lower()
    for staff in staff_list:
        name = staff.get("name", "").lower()
        name_parts = name.split()
        if all(part in query for part in name_parts) or any(part in query for part in name_parts):
            return staff
    return None

def fetch_aggregated_staff_performance(staff_mongo_id, staff_name):
    pipeline = [
        {"$match": {"staff": staff_mongo_id}},
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$staff",
                "billsHandled": {"$sum": 1},
                "totalProcessed": {"$sum": "$total"},
                "avgDiscount": {
                    "$avg": {
                        "$cond": [
                            {"$ne": ["$items.discount", None]},
                            {
                                "$toDouble": {
                                    "$replaceOne": {
                                        "input": "$items.discount",
                                        "find": "%",
                                        "replacement": ""
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            }
        }
    ]

    result = list(bills_col.aggregate(pipeline))
    if not result:
        return None

    data = result[0]
    return {
        "staffId": str(data["_id"]),
        "staffName": staff_name,
        "billsHandled": data["billsHandled"],
        "totalProcessed": data["totalProcessed"],
        "avgDiscount": round(data["avgDiscount"], 2)
    }



# ===================== Main AI Handler =====================
def handle_ai_query(query: str):
    query = query.strip().lower()

    # 🧠 Small talk
    if any(w in query for w in ["hi", "hello", "hey"]):
        return {"message": "Hi there! 👋 I'm your Scanify Assistant. How can I help you today?"}
    if "who are you" in query:
        return {"message": "I'm Scanify AI Assistant 🤖. I help with inventory forecasts, staff performance, and more."}
    if any(w in query for w in ["what can you do", "help", "features"]):
        return {"message": "I can assist with:\n• Staff performance analysis\n• Product inventory forecasts\n• Basic FAQs\nJust ask!"}
    if "thank" in query:
        return {"message": "You're welcome! 😊 Let me know if you need anything else."}
    if "bye" in query:
        return {"message": "Goodbye! 👋 Have a great day!"}

    # 🧠 Data load
    staff = fetch_staff()
    products = fetch_products()
    bills = fetch_bills()

    prompt_map = generate_prompt_map(staff, products)
    if not os.path.exists(PROMPT_FILE):
        save_prompt_embeddings(prompt_map)
    prompt_map, prompt_embeddings = load_prompt_embeddings()
    all_prompts = list(prompt_map.keys())

    # 🧠 Semantic search
    query_embedding = model.encode(query, convert_to_tensor=True)
    match = util.semantic_search(query_embedding, prompt_embeddings, top_k=1)[0][0]
    best_prompt = all_prompts[match["corpus_id"]]
    score = match["score"]
    matched_entity = prompt_map[best_prompt]

    # 🧠 Extract name-based match
    matched_staff_by_name = extract_staff_by_name(query, staff)
    print(f"Matched staff by name: {matched_staff_by_name}")

    if score < 0.45:
        # Name-based fallback for staff
        if matched_staff_by_name and any(w in query for w in ['performance', 'score', 'staff']):
            staff_name = matched_staff_by_name["name"]
            staff_mongo_id = matched_staff_by_name["_id"]

            aggregated_data = fetch_aggregated_staff_performance(staff_mongo_id, staff_name)
            if not aggregated_data:
                return {"message": f"No performance data found for {staff_name}."}

            score_result = evaluate_staff_scores([aggregated_data])[0]
            return format_staff_performance(score_result, matched_staff_by_name)

        # Name-based fallback for products
        for p in products:
            if p["name"].lower() in query and any(w in query for w in ['forecast', 'stock', 'inventory']):
                result = generate_inventory_forecast([p], bills)[0]
                return format_inventory_forecast(result)

        return {"message": "I couldn't confidently understand your question. Please rephrase or ask about staff or inventory."}

    # 🧠 Entity match handler
    if matched_entity in staff:
        result = evaluate_staff_scores([matched_entity])[0]
        return format_staff_performance(result, matched_entity)

    if matched_entity in products:
        result = generate_inventory_forecast([matched_entity], bills)[0]
        return format_inventory_forecast(result)

    return {"message": "Something went wrong. Please try again later."}

# ===================== Formatters =====================
def format_staff_performance(result, staff):
    return {
        "message": (
            f"📊 Performance for {staff['name']}:\n"
            f"• Bills Handled: {result.get('billsHandled', 0)}\n"
            f"• Total Processed: ₹{result.get('totalProcessed', 0)}\n"
            f"• Avg Discount: {result.get('avgDiscount', 0)}%\n"
            f"• Score: {result.get('score', 'N/A')}%"
        )
    }

def format_inventory_forecast(result):
    return {
        "message": (
            f"📦 Forecast for {result['name']}:\n"
            f"• Stock: {result['stock']} items\n"
            f"• Avg Daily Sales: {result['avgDailySales']}\n"
            f"• Forecast Days Left: {result['forecastDaysLeft']} days"
        )
    }
