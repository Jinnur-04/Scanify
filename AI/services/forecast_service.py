from collections import defaultdict
import pandas as pd

def generate_inventory_forecast(products, bills):
    sales = defaultdict(list)

    for bill in bills:
        bill_date = bill.get('date')
        for item in bill.get('items', []):
            name = item.get('name')
            qty = item.get('qty', 1)
            if name and bill_date:
                sales[name].append({
                    'date': bill_date if isinstance(bill_date, str) else bill_date.strftime("%Y-%m-%d"),
                    'qty': qty
                })

    stock_by_name = defaultdict(int)
    for product in products:
        name = product.get('name')
        stock = product.get('stock', 0)
        stock_by_name[name] += stock

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

    return results
