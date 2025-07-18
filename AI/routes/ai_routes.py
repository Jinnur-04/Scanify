from flask import Blueprint, request, jsonify
from services.ai_service import handle_ai_query
import jwt
from bson import ObjectId
import os
from dotenv import load_dotenv

ai_bp = Blueprint('ai_bp', __name__)

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET")

def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {
            "_id": ObjectId(decoded["id"]),
            "role": decoded.get("role"),
            "name": decoded.get("name")  # updated key from 'username' to 'name'
        }
    except jwt.ExpiredSignatureError:
        print("Token has expired.")
    except jwt.InvalidTokenError:
        print("Invalid token.")

    return None

@ai_bp.route('/chat', methods=['POST'])
def ai_chat():
    data = request.json
    query = data.get("query")
    current_user = get_user_from_token(request)
    
    if not current_user:
        return jsonify({"message": "Unauthorized"}), 401
    
    response = handle_ai_query(query, current_user)
    return jsonify(response)
