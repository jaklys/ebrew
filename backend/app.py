from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1) Předdefinovaný uživatel
USERS = {
    "admin": "secret"
}

# ===== RMUTOVÁNÍ RECEPTY =====
RECIPES = [
    {
        "name": "Český ležák 12°",
        "steps": [
            # Vystírka
            {
                "targetTemp": 38, "rampRate": 2, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Peptonizační pauza
            {
                "targetTemp": 52, "rampRate": 1.5, "holdTime": 20,
                "manualPause": False, "mixing": True
            },
            # Nižší cukrotvorná pauza
            {
                "targetTemp": 63, "rampRate": 1, "holdTime": 30,
                "manualPause": True, "mixing": True  # Jódová zkouška
            },
            # Vyšší cukrotvorná pauza
            {
                "targetTemp": 72, "rampRate": 1, "holdTime": 20,
                "manualPause": False, "mixing": True
            },
            # Odrmutovací teplota
            {
                "targetTemp": 78, "rampRate": 1.5, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Ukončení
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    },
    {
        "name": "Pšeničné pivo 11°",
        "steps": [
            # Vystírka
            {
                "targetTemp": 40, "rampRate": 2, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Proteolytická pauza (důležitá u pšeničného piva)
            {
                "targetTemp": 45, "rampRate": 1.5, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Nižší cukrotvorná pauza
            {
                "targetTemp": 62, "rampRate": 1, "holdTime": 35,
                "manualPause": True, "mixing": True  # Jódová zkouška
            },
            # Vyšší cukrotvorná pauza
            {
                "targetTemp": 72, "rampRate": 1, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Odrmutovací teplota
            {
                "targetTemp": 78, "rampRate": 1.5, "holdTime": 5,
                "manualPause": False, "mixing": True
            },
            # Ukončení
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    },
    {
        "name": "IPA 15°",
        "steps": [
            # Vystírka
            {
                "targetTemp": 42, "rampRate": 2, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Bílkovinná pauza
            {
                "targetTemp": 50, "rampRate": 1.5, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Nižší cukrotvorná pauza - kratší pro větší zbytkový extrakt
            {
                "targetTemp": 64, "rampRate": 1, "holdTime": 20,
                "manualPause": True, "mixing": True  # Jódová zkouška
            },
            # Vyšší cukrotvorná pauza
            {
                "targetTemp": 70, "rampRate": 1, "holdTime": 30,
                "manualPause": False, "mixing": True
            },
            # Odrmutovací teplota
            {
                "targetTemp": 76, "rampRate": 1.5, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Ukončení
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    },
    {
        "name": "Stout 13°",
        "steps": [
            # Vystírka
            {
                "targetTemp": 40, "rampRate": 2, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Bílkovinná pauza
            {
                "targetTemp": 52, "rampRate": 1.5, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Střední cukrotvorná pauza pro vyšší zbytkový extrakt
            {
                "targetTemp": 65, "rampRate": 1, "holdTime": 40,
                "manualPause": True, "mixing": True  # Jódová zkouška
            },
            # Vyšší cukrotvorná pauza - kratší pro tmavší piva
            {
                "targetTemp": 72, "rampRate": 1, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Odrmutovací teplota
            {
                "targetTemp": 78, "rampRate": 1.5, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Ukončení
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    },
    {
        "name": "Polotmavý ležák 12°",
        "steps": [
            # Vystírka
            {
                "targetTemp": 38, "rampRate": 2, "holdTime": 10,
                "manualPause": False, "mixing": True
            },
            # Peptonizační pauza
            {
                "targetTemp": 52, "rampRate": 1.5, "holdTime": 20,
                "manualPause": False, "mixing": True
            },
            # Nižší cukrotvorná pauza
            {
                "targetTemp": 63, "rampRate": 1, "holdTime": 25,
                "manualPause": True, "mixing": True  # Jódová zkouška
            },
            # Střední cukrotvorná pauza - specifická pro polotmavé pivo
            {
                "targetTemp": 68, "rampRate": 1, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Vyšší cukrotvorná pauza
            {
                "targetTemp": 72, "rampRate": 1, "holdTime": 15,
                "manualPause": False, "mixing": True
            },
            # Odrmutovací teplota
            {
                "targetTemp": 78, "rampRate": 1.5, "holdTime": 5,
                "manualPause": False, "mixing": True
            },
            # Ukončení
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    }
]

# ===== CHMELOVAR RECEPTY =====
CHMELOVAR_RECIPES = [
    {
        "name": "Český ležák 12°",
        "steps": [
            # Hlavní chmelení - Žatecký chmel
            {"duration": 60, "evaporation": 8, "addHop": True},  # Hořký chmel (na začátku)
            {"duration": 20, "evaporation": 6, "addHop": True},  # Aromatický chmel (20 min před koncem)
            {"duration": 10, "evaporation": 5, "addHop": False}, # Závěrečná část
            {"duration": 5, "evaporation": 4, "addHop": True}    # Studené chmelení (5 min před koncem)
        ]
    },
    {
        "name": "Pšeničné pivo 11°",
        "steps": [
            # Pšeničné pivo - jemnější chmelení
            {"duration": 45, "evaporation": 7, "addHop": True},  # Hořký chmel (na začátku)
            {"duration": 25, "evaporation": 6, "addHop": False}, # Střední část varu
            {"duration": 15, "evaporation": 5, "addHop": True},  # Aromatický chmel (15 min před koncem)
            {"duration": 10, "evaporation": 4, "addHop": False}  # Závěrečná část
        ]
    },
    {
        "name": "IPA 15°",
        "steps": [
            # IPA - intenzivní chmelení
            {"duration": 30, "evaporation": 9, "addHop": True},  # Základní chmelení (bitter)
            {"duration": 20, "evaporation": 8, "addHop": True},  # První aromatický chmel (20 min před koncem)
            {"duration": 15, "evaporation": 7, "addHop": True},  # Druhý aromatický chmel (15 min před koncem)
            {"duration": 10, "evaporation": 6, "addHop": True},  # Třetí aromatický chmel (10 min před koncem)
            {"duration": 5, "evaporation": 5, "addHop": True},   # Čtvrtý aromatický chmel (5 min před koncem)
            {"duration": 0, "evaporation": 4, "addHop": True}    # Chmel na konci varu (dry hopping)
        ]
    },
    {
        "name": "Stout 13°",
        "steps": [
            # Stout - méně chmele, důraz na praženost sladu
            {"duration": 60, "evaporation": 7, "addHop": True},  # Základní chmelení (jen pro hořkost)
            {"duration": 25, "evaporation": 6, "addHop": False}, # Střední část varu
            {"duration": 10, "evaporation": 5, "addHop": True},  # Aromatický chmel (10 min před koncem)
            {"duration": 5, "evaporation": 4, "addHop": False}   # Závěrečná část
        ]
    },
    {
        "name": "Polotmavý ležák 12°",
        "steps": [
            # Polotmavý ležák - vyvážené chmelení
            {"duration": 55, "evaporation": 8, "addHop": True},  # Hořký chmel (na začátku)
            {"duration": 25, "evaporation": 7, "addHop": False}, # Střední část varu
            {"duration": 15, "evaporation": 6, "addHop": True},  # Aromatický chmel (15 min před koncem)
            {"duration": 5, "evaporation": 5, "addHop": True}    # Jemný aromatický chmel (5 min před koncem)
        ]
    }
]

# ===== DALŠÍ TESTOVACÍ DATA =====

# Teploty v systému
TEMPERATURES = {
    "boiler": 65.4,
    "varna": 72.8,
    "scezovac": 58.2,
    "mladina": 18.5
}

# Objem vody v bojleru
WATER_LEVEL = {
    "boilerLevel": 32.5  # v litrech
}

# Stav systému
SYSTEM_STATUS = {
    "status": "Normal",
    "ambientTemp": 22.3,
    "lastMaintenance": "2023-12-10",
    "pumpStatus": "Off",
    "mixerStatus": "Off"
}


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    if not data:
        return jsonify({"error": "Missing data"}), 400

    username = data.get("username")
    password = data.get("password")
    if username in USERS and USERS[username] == password:
        # úspěch => vrátíme token
        return jsonify({"token": "mytoken"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


def check_token(req):
    """
    Pomocná funkce, ověří token v hlavičce Authorization: Bearer <token>
    """
    auth = req.headers.get("Authorization", "")
    # typicky "Bearer mytoken"
    if not auth.startswith("Bearer "):
        return False
    token = auth.split(" ")[1]
    return (token == "mytoken")


@app.route("/api/importRecipe", methods=["POST"])
def import_recipe():
    """
    Nahrání receptu v JSON a přidání do RECIPES.
    Příklad pro rmut, analogicky si uděláte /api/importChmelovar.
    Musíte být přihlášeni (token).
    """
    if not check_token(request):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json  # { name, steps: [] }
    if not data:
        return jsonify({"error": "No JSON"}), 400

    RECIPES.append(data)
    return jsonify({"msg": "Recept naimportován"}), 201


# ===== TEPloty (Mock) =====
@app.route("/api/temperatures", methods=["GET"])
def get_temperatures():
    """
    Vrátí aktuální teploty v bojleru, varně, scezovači a mladině.
    """
    data = {
        "boiler": 70,
        "varna": 65,
        "scezovac": 58,
        "mladina": 40
    }
    return jsonify(data)

# ===== ROUTES PRO RMUT =====
@app.route("/api/recipes", methods=["GET"])
def get_rmut_recipes():
    """Vrátí všechny Rmut recepty (pole JSON)."""
    return jsonify(RECIPES)

@app.route("/api/recipes", methods=["POST"])
def create_rmut_recipe():
    """Přidá nový rmut recept do paměti."""
    data = request.json
    RECIPES.append(data)
    return jsonify({"msg": "Rmut recept přidán"}), 201

# PUT/DELETE pro rmut (ukázka index-based):
@app.route("/api/recipes/<int:idx>", methods=["PUT"])
def update_rmut_recipe(idx):
    if idx < 0 or idx >= len(RECIPES):
        return jsonify({"error": "Index out of range"}), 404
    data = request.json
    RECIPES[idx] = data
    return jsonify({"msg": f"Rmut recept {idx} upraven"})

@app.route("/api/recipes/<int:idx>", methods=["DELETE"])
def delete_rmut_recipe(idx):
    if idx < 0 or idx >= len(RECIPES):
        return jsonify({"error": "Index out of range"}), 404
    RECIPES.pop(idx)
    return jsonify({"msg": f"Rmut recept {idx} smazán"})

# ===== ROUTES PRO CHMELOVAR =====
@app.route("/api/chmelovarRecipes", methods=["GET"])
def get_chmelovar_recipes():
    """Vrátí všechny Chmelovar recepty (pole JSON)."""
    return jsonify(CHMELOVAR_RECIPES)

@app.route("/api/chmelovarRecipes", methods=["POST"])
def create_chmelovar_recipe():
    """Přidá nový chmelovar recept do paměti."""
    data = request.json
    CHMELOVAR_RECIPES.append(data)
    return jsonify({"msg": "Chmelovar recept přidán"}), 201

# PUT/DELETE pro chmelovar (ukázka index-based):
@app.route("/api/chmelovarRecipes/<int:idx>", methods=["PUT"])
def update_chmelovar_recipe(idx):
    if idx < 0 or idx >= len(CHMELOVAR_RECIPES):
        return jsonify({"error": "Index out of range"}), 404
    data = request.json
    CHMELOVAR_RECIPES[idx] = data
    return jsonify({"msg": f"Chmelovar recept {idx} upraven"})

@app.route("/api/chmelovarRecipes/<int:idx>", methods=["DELETE"])
def delete_chmelovar_recipe(idx):
    if idx < 0 or idx >= len(CHMELOVAR_RECIPES):
        return jsonify({"error": "Index out of range"}), 404
    CHMELOVAR_RECIPES.pop(idx)
    return jsonify({"msg": f"Chmelovar recept {idx} smazán"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

