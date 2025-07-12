from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Scanify Flask API is running."})

@app.route('/inventory-forecast', methods=['POST'])
def inventory_forecast():
    data = request.get_json()
    products = data.get('products', [])
    bills = data.get('bills', [])

    sales = defaultdict(list)
    for bill in bills:
        bill_date = bill.get('date')
        for item in bill.get('items', []):
            name = item.get('name')
            qty = item.get('qty', 1)
            if name and bill_date:
                sales[name].append({
                    'date': bill_date[:10],
                    'qty': qty
                })

    stock_by_name = defaultdict(int)
    for product in products:
        stock_by_name[product['name']] += product.get('stock', 0)

    results = []
    for name, stock in stock_by_name.items():
        product_sales = sales.get(name, [])

        if not product_sales:
            results.append({
                'name': name,
                'stock': stock,
                'avgDailySales': 0,
                'forecastDaysLeft': None
            })
            continue

        df = pd.DataFrame(product_sales)
        df['date'] = pd.to_datetime(df['date'])
        total_sales = df['qty'].sum()
        total_days = (df['date'].max() - df['date'].min()).days + 1
        avg_sales = total_sales / total_days if total_days > 0 else 0
        forecast_days = round(stock / avg_sales, 1) if avg_sales > 0 else None

        results.append({
            'name': name,
            'stock': stock,
            'avgDailySales': round(avg_sales, 2),
            'forecastDaysLeft': forecast_days
        })

    return jsonify(results)

@app.route('/score-staff', methods=['POST'])
def score_staff():
    staff_data = request.json
    results = []

    for staff in staff_data:
        bills = staff.get('billsHandled', 0)
        total = staff.get('totalProcessed', 0)
        discount = staff.get('avgDiscount', 0)

        score = (bills * 0.5) + (total * 0.0001) - (discount * 0.2)

        results.append({
            'staffId': staff.get('staffId'),
            'staffName': staff.get('staffName'),
            'score': round(score, 2),
            'billsHandled': bills,
            'totalProcessed': total,
            'avgDiscount': round(discount, 2)
        })

    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(results)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7860))
    app.run(host='0.0.0.0', port=port)
