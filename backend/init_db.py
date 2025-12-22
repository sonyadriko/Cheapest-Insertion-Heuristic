#!/usr/bin/env python3
"""
Simple script to initialize database and start server
"""
import os
import sys

# Remove old database
if os.path.exists('delivery_route.db'):
    os.remove('delivery_route.db')
    print("🗑️  Removed old database")

# Create fresh database
from app import create_app
from models import db, LoginUser, Kurir, StatusKirim

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    print("✅ Database tables created")
    
    # Create default status
    if StatusKirim.query.count() == 0:
        default_statuses = [
            StatusKirim(status_kirim='Pending'),
            StatusKirim(status_kirim='In Progress'),
            StatusKirim(status_kirim='Delivered'),
            StatusKirim(status_kirim='Cancelled')
        ]
        db.session.add_all(default_statuses)
        db.session.commit()
        print("✅ Default statuses created")
    
    # Create admin user
    if not LoginUser.query.filter_by(username_login='admin').first():
        admin = LoginUser(
            username_login='admin',
            nama='Administrator',
            status_login='admin',
            id_kurir=None
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")
    
    # Create kurir records
    kurir_data = [
        {'nama': 'Budi Santoso', 'alamat': 'Jakarta Selatan', 'lat': -6.2615, 'lng': 106.8106},
        {'nama': 'Andi Wijaya', 'alamat': 'Jakarta Timur', 'lat': -6.2250, 'lng': 106.9004},
        {'nama': 'Rudi Hermawan', 'alamat': 'Jakarta Barat', 'lat': -6.1684, 'lng': 106.7594},
    ]
    
    for kd in kurir_data:
        if not Kurir.query.filter_by(nama_kurir=kd['nama']).first():
            kurir = Kurir(
                nama_kurir=kd['nama'],
                alamat_kurir=kd['alamat'],
                latitude_kurir=kd['lat'],
                longitude_kurir=kd['lng']
            )
            db.session.add(kurir)
    db.session.commit()
    print(f"✅ {Kurir.query.count()} kurir created")
    
    # Create kurir users
    kurir_users = [
        {'username': 'kurir1', 'nama': 'Budi Santoso', 'id_kurir': 1},
        {'username': 'kurir2', 'nama': 'Andi Wijaya', 'id_kurir': 2},
        {'username': 'kurir3', 'nama': 'Rudi Hermawan', 'id_kurir': 3},
    ]
    
    for ku in kurir_users:
        if not LoginUser.query.filter_by(username_login=ku['username']).first():
            user = LoginUser(
                username_login=ku['username'],
                nama=ku['nama'],
                status_login='kurir',
                id_kurir=ku['id_kurir']
            )
            user.set_password('kurir123')
            db.session.add(user)
    
    # Create SPV user
    if not LoginUser.query.filter_by(username_login='spv').first():
        spv = LoginUser(
            username_login='spv',
            nama='Supervisor',
            status_login='spv',
            id_kurir=None
        )
        spv.set_password('spv123')
        db.session.add(spv)
    
    db.session.commit()
    print(f"✅ {LoginUser.query.count()} users created")

print("\n" + "="*50)
print("✅ Database initialized successfully!")
print("="*50)
print("\nYou can now run: python3 app.py")
print("="*50)
