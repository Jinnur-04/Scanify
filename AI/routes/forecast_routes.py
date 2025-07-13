# routes/forecast_routes.py
from flask import Blueprint, request, jsonify
from services.forecast_service import generate_inventory_forecast

forecast_bp = Blueprint('forecast_bp', __name__)

@forecast_bp.route('', methods=['POST'])
def forecast():
    data = request.get_json()
    products = data.get('products', [])
    bills = data.get('bills', [])

    result = generate_inventory_forecast(products, bills)
    return jsonify(result)
