from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)

latest_alert = None
alert_timestamp = 0

@app.route('/alert', methods=['POST'])
def receive_alert():
    global latest_alert, alert_timestamp
    new_alert = request.json  # Expecting JSON data from Arduino
    
    # Check if we have received a similar alert recently
    if latest_alert is not None:
        if (latest_alert["temperature"] == new_alert["temperature"] and
            latest_alert["humidity"] == new_alert["humidity"] and
            latest_alert["co_level"] == new_alert["co_level"]):
            print("Received duplicate alert. Ignoring...")
            return jsonify({"status": "ignored", "message": "Duplicate alert received"}), 200
    
    latest_alert = new_alert  # Update the latest alert
    alert_timestamp = time.time()
    print(f"Received alert: {latest_alert}")  # Debugging line
    return jsonify({"status": "success", "message": "Alert received"}), 200


@app.route('/get_alert', methods=['GET'])
def get_alert():
    print("Received a request for /get_alert")  # Debugging line
    if latest_alert:
        alert_data = {
            "alert": latest_alert,
            "timestamp": alert_timestamp
        }
    else:
        alert_data = {
            "alert": None,
            "timestamp": 0
        }
    print(alert_data)
    return jsonify(alert_data)

@app.route('/clear_alert', methods=['GET'])
def clear_alert():
    global latest_alert, alert_timestamp

    latest_alert = None  # Clear the current alert
    alert_timestamp = 0  # Reset the timestamp
    print("Alert cleared, back to normal state.")
    return jsonify({"status": "Alert cleared, normal conditions."}), 200

def clear_old_alerts():
    global latest_alert, alert_timestamp
    while True:
        if latest_alert and time.time() - alert_timestamp > 300:  # Clear after 5 minutes
            latest_alert, alert_timestamp = None, 0
        time.sleep(60)  # Check every minute

if __name__ == '__main__':
    threading.Thread(target=clear_old_alerts, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=True)
