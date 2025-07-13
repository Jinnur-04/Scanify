# routes/staff_routes.py
from flask import Blueprint, request, jsonify
from services.staff_service import evaluate_staff_scores

staff_bp = Blueprint('staff_bp', __name__)

@staff_bp.route('', methods=['POST'])
def score():
    staff_data = request.json
    result = evaluate_staff_scores(staff_data)
    return jsonify(result)
