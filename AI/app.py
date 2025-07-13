# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from routes.forecast_routes import forecast_bp
from routes.staff_routes import staff_bp
from routes.ai_routes import ai_bp
import os

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(forecast_bp, url_prefix='/api/forecast')
app.register_blueprint(staff_bp, url_prefix='/api/staff')
app.register_blueprint(ai_bp, url_prefix='/api/ai')

@app.route('/')
def home():
    return jsonify({"message": "Scanify Flask API is running."})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 7860))
    app.run(host='0.0.0.0', port=port, debug=True)
