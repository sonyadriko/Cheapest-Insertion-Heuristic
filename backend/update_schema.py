"""
Script to update database schema for date-based scheduling
Adds tanggal_kirim to data_pengiriman and tanggal_rute to hasil_rute
"""
from flask import Flask
from config import Config
from models import db

def create_minimal_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    return app

def update_schema():
    app = create_minimal_app()
    with app.app_context():
        # Add tanggal_kirim column to data_pengiriman
        try:
            db.session.execute(db.text('ALTER TABLE data_pengiriman ADD COLUMN tanggal_kirim DATE'))
            print("✅ Added tanggal_kirim column to data_pengiriman")
        except Exception as e:
            if 'duplicate column' in str(e).lower() or 'already exists' in str(e).lower():
                print("⚠️  tanggal_kirim column already exists")
            else:
                print(f"❌ Error adding tanggal_kirim: {e}")
        
        # Add tanggal_rute column to hasil_rute
        try:
            db.session.execute(db.text('ALTER TABLE hasil_rute ADD COLUMN tanggal_rute DATE'))
            print("✅ Added tanggal_rute column to hasil_rute")
        except Exception as e:
            if 'duplicate column' in str(e).lower() or 'already exists' in str(e).lower():
                print("⚠️  tanggal_rute column already exists")
            else:
                print(f"❌ Error adding tanggal_rute: {e}")
        
        db.session.commit()
        print("\n✅ Database schema updated successfully!")

if __name__ == '__main__':
    update_schema()
