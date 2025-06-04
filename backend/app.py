from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB = "database.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/save_polygon", methods=["POST"])
def save_polygon():
    data = request.json
    name = data.get("name", "Unnamed")
    geojson = data["geojson"]
    db = get_db()
    db.execute("INSERT INTO polygons (name, geojson) VALUES (?, ?)", (name, geojson))
    db.commit()
    return {"status": "ok"}

@app.route("/get_polygons", methods=["GET"])
def get_polygons():
    db = get_db()
    cur = db.execute("SELECT * FROM polygons")
    polygons = [dict(row) for row in cur.fetchall()]
    return jsonify(polygons)

@app.route("/save_intersection", methods=["POST"])
def save_intersection():
    data = request.json
    polygon_id = data["polygon_id"]
    geojson = data["geojson"]
    db = get_db()
    db.execute("INSERT INTO intersections (polygon_id, geojson) VALUES (?, ?)", (polygon_id, geojson))
    db.commit()
    return {"status": "ok"}

@app.route("/get_intersections/<int:polygon_id>")
def get_intersections(polygon_id):
    db = get_db()
    cur = db.execute("SELECT * FROM intersections WHERE polygon_id = ?", (polygon_id,))
    intersections = [dict(row) for row in cur.fetchall()]
    return jsonify(intersections)

if __name__ == "__main__":
    app.run(debug=True)
