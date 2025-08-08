USERS = {
    "admin": "secret"
}

RECIPES = [
    {
        "name": "Český ležák 12°",
        "steps": [
            {"targetTemp": 38, "rampRate": 2, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 52, "rampRate": 1.5, "holdTime": 20, "manualPause": False, "mixing": True},
            {"targetTemp": 63, "rampRate": 1, "holdTime": 30, "manualPause": True, "mixing": True},
            {"targetTemp": 72, "rampRate": 1, "holdTime": 20, "manualPause": False, "mixing": True},
            {"targetTemp": 78, "rampRate": 1.5, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 0, "rampRate": 0, "holdTime": 0, "manualPause": False, "mixing": False, "isEndStep": True}
        ]
    },
    {
        "name": "Pšeničné pivo 11°",
        "steps": [
            {"targetTemp": 40, "rampRate": 2, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 45, "rampRate": 1.5, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 62, "rampRate": 1, "holdTime": 35, "manualPause": True, "mixing": True},
            {"targetTemp": 72, "rampRate": 1, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 78, "rampRate": 1.5, "holdTime": 5, "manualPause": False, "mixing": True},
            {"targetTemp": 0, "rampRate": 0, "holdTime": 0, "manualPause": False, "mixing": False, "isEndStep": True}
        ]
    },
    {
        "name": "IPA 15°",
        "steps": [
            {"targetTemp": 42, "rampRate": 2, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 50, "rampRate": 1.5, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 64, "rampRate": 1, "holdTime": 20, "manualPause": True, "mixing": True},
            {"targetTemp": 70, "rampRate": 1, "holdTime": 30, "manualPause": False, "mixing": True},
            {"targetTemp": 76, "rampRate": 1.5, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 0, "rampRate": 0, "holdTime": 0, "manualPause": False, "mixing": False, "isEndStep": True}
        ]
    },
    {
        "name": "Stout 13°",
        "steps": [
            {"targetTemp": 40, "rampRate": 2, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 52, "rampRate": 1.5, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 65, "rampRate": 1, "holdTime": 40, "manualPause": True, "mixing": True},
            {"targetTemp": 72, "rampRate": 1, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 78, "rampRate": 1.5, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 0, "rampRate": 0, "holdTime": 0, "manualPause": False, "mixing": False, "isEndStep": True}
        ]
    },
    {
        "name": "Polotmavý ležák 12°",
        "steps": [
            {"targetTemp": 38, "rampRate": 2, "holdTime": 10, "manualPause": False, "mixing": True},
            {"targetTemp": 52, "rampRate": 1.5, "holdTime": 20, "manualPause": False, "mixing": True},
            {"targetTemp": 63, "rampRate": 1, "holdTime": 25, "manualPause": True, "mixing": True},
            {"targetTemp": 68, "rampRate": 1, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 72, "rampRate": 1, "holdTime": 15, "manualPause": False, "mixing": True},
            {"targetTemp": 78, "rampRate": 1.5, "holdTime": 5, "manualPause": False, "mixing": True},
            {"targetTemp": 0, "rampRate": 0, "holdTime": 0, "manualPause": False, "mixing": False, "isEndStep": True}
        ]
    }
]

# Complete default state used until DynamoDB is connected
DEFAULT_STATE = {
    "users": USERS,
    "recipes": RECIPES
}

