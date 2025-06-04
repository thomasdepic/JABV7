CREATE TABLE IF NOT EXISTS polygons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    geojson TEXT
);

CREATE TABLE IF NOT EXISTS intersections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    polygon_id INTEGER,
    geojson TEXT,
    FOREIGN KEY(polygon_id) REFERENCES polygons(id)
);
