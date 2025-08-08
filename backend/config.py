import os

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DDB_TABLE = os.getenv("DDB_TABLE", "ebrew_state")
PORT = int(os.getenv("PORT", 5000))
API_STATE_ROUTE = os.getenv("API_STATE_ROUTE", "/api/state")
WS_ROUTE = os.getenv("WS_ROUTE", "/ws")

# Frontend base URL can be useful for CORS or other references
BASE_URL = os.getenv("BASE_URL", "http://localhost:5000")
