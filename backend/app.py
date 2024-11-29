from flask import Flask, request, jsonify
from flask_cors import CORS
# from supabase import create_client  # Comment this out for now
from config import Config
from email_service import EmailService

app = Flask(__name__)
CORS(app)

# Comment out Supabase initialization for now
# supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

@app.route('/api/trades', methods=['GET'])
def get_trades():
    # Return placeholder data
    return jsonify([
        {
            "id": 1,
            "buy_sell_indicator": "BUY",
            "quantity": 100,
            "price": 50.25,
            # ... other fields
        }
    ])

@app.route('/api/risk-metrics', methods=['GET'])
def get_risk_metrics():
    # Return placeholder metrics
    metrics = {
        'total_unsettled_trades': 153,
        'counterparty_exposure': {'Party A': 1000000, 'Party B': 500000},
        'largest_unsettled_trade': 750000
    }
    return jsonify(metrics)

if __name__ == '__main__':
    app.run(debug=True) 