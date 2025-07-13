# routes/ai_routes.py
from flask import Blueprint, request, jsonify
from services.ai_service import handle_ai_query

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    user_input = request.json.get("query", "")
    response = handle_ai_query(user_input)
    return jsonify(response)
