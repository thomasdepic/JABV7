import sqlite3

def init_db():
    with open("schema.sql") as f:
        schema = f.read()
    conn = sqlite3.connect("database.db")
    conn.executescript(schema)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
