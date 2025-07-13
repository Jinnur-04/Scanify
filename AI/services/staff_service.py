def evaluate_staff_scores(staff_data):
    results = []
    for staff in staff_data:
        print(staff)
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
    return results
