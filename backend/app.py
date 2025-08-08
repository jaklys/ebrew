from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sock import Sock
import boto3
import json

from mock_data import DEFAULT_STATE
from config import AWS_REGION, DDB_TABLE, PORT, API_STATE_ROUTE, WS_ROUTE


app = Flask(__name__)
CORS(app)
sock = Sock(app)


# DynamoDB configuration
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
table = dynamodb.Table(DDB_TABLE)


# in-memory fallback state until DynamoDB is configured
current_state = DEFAULT_STATE.copy()


# keep track of websocket clients
clients = set()


@sock.route(WS_ROUTE)
def websocket(ws):
    """Basic websocket relay. Each message received is forwarded to all clients."""
    clients.add(ws)
    try:
        while True:
            data = ws.receive()
            if data is None:
                break
            # forward data to all other clients
            for client in list(clients):
                if client is ws:
                    continue
                try:
                    client.send(data)
                except Exception:
                    clients.discard(client)
    finally:
        clients.discard(ws)


@app.route(API_STATE_ROUTE, methods=["GET"])
def get_state():
    """Return current brewing state stored in DynamoDB or fallback to mock data."""
    try:
        resp = table.get_item(Key={"id": "state"})
        payload = resp.get("Item", {}).get("payload")
        if payload:
            return jsonify(payload)
    except Exception:
        pass
    return jsonify(current_state)


@app.route(API_STATE_ROUTE, methods=["POST"])
def post_state():
    """Persist new brewing state and broadcast it to websocket clients."""
    data = request.get_json(force=True) or {}
    try:
        table.put_item(Item={"id": "state", "payload": data})
    except Exception:
        global current_state
        current_state = data

    message = json.dumps(data)
    for client in list(clients):
        try:
            client.send(message)
        except Exception:
            clients.discard(client)

    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)

