from flask import Flask, jsonify, request, os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ===== RMUT RECEPTY =====
RECIPES = [
    {
        "name": "Světlý ležák",
        "steps": [
            {
                "targetTemp": 52, "rampRate": 2, "holdTime": 20,
                "manualPause": False, "mixing": False
            },
            {
                "targetTemp": 63, "rampRate": 1, "holdTime": 30,
                "manualPause": True, "mixing": True
            },
            {
                "targetTemp": 72, "rampRate": 1, "holdTime": 20,
                "manualPause": False, "mixing": False
            },
            {
                "targetTemp": 78, "rampRate": 2, "holdTime": 10,
                "manualPause": False, "mixing": False
            },
            {
                "targetTemp": 0, "rampRate": 0, "holdTime": 0,
                "manualPause": False, "mixing": False,
                "isEndStep": True
            }
        ]
    },
    {
        "name": "Pšeničné pivo",
        "steps": [
            # Můžete doplnit...
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
        "name": "IPA Chmelovar",
        "steps": [
            {"duration": 10, "evaporation": 4, "addHop": True},
            {"duration": 20, "evaporation": 7, "addHop": False}
        ]
    },
    {
        "name": "Aroma Chmelovar",
        "steps": [
            {"duration": 5, "evaporation": 4, "addHop": False},
            {"duration": 10, "evaporation": 4, "addHop": True},
            {"duration": 10, "evaporation": 4, "addHop": True},
            {"duration": 5, "evaporation": 4, "addHop": True},
            {"duration": 25, "evaporation": 4, "addHop": True},
            {"duration": 25, "evaporation": 4, "addHop": True}
        ]
    }
]

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

