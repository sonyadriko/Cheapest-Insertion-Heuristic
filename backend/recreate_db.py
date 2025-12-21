#!/usr/bin/env python3
"""
Force create database with new schema
"""
import sys
sys.path.insert(0, '/Users/sonyadriko/Projects/CIH/backend')

from app import create_app
from models import db

def create_database():
    app = create_app()
    
    with app.app_context():
        print("🔨 Creating database tables...")
        db.drop_all()  # Drop all existing tables
        db.create_all()  # Create all tables with current schema
        print("✅ Database tables created successfully!")
        
        # Verify schema
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"\n📋 Created tables: {', '.join(tables)}")
        
        # Check kurir table columns
        if 'data_kurir' in tables:
            columns = [col['name'] for col in inspector.get_columns('data_kurir')]
            print(f"✓ data_kurir columns: {', '.join(columns)}")

if __name__ == '__main__':
    create_database()
