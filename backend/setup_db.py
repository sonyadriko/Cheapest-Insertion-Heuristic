#!/usr/bin/env python3
"""
Simple database initialization - Name-based matching
"""
import os

# Remove old database
if os.path.exists('delivery_route.db'):
    os.remove('delivery_route.db')
    print("🗑️  Removed old database")

from app import create_app
from models import db, LoginUser, Kurir, Pengiriman, StatusKirim

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
            status_login='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")
    
    # Create SPV user
    if not LoginUser.query.filter_by(username_login='spv').first():
        spv = LoginUser(
            username_login='spv',
            nama='Supervisor',
            status_login='spv'
        )
        spv.set_password('spv123')
        db.session.add(spv)
        db.session.commit()
        print("✅ SPV user created")
    
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
    
    # Create kurir users - NAMA HARUS SAMA PERSIS dengan nama_kurir!
    kurir_users = [
        {'username': 'kurir1', 'nama': 'Budi Santoso', 'password': 'kurir123'},
        {'username': 'kurir2', 'nama': 'Andi Wijaya', 'password': 'kurir123'},
        {'username': 'kurir3', 'nama': 'Rudi Hermawan', 'password': 'kurir123'},
    ]
    
    for ku in kurir_users:
        if not LoginUser.query.filter_by(username_login=ku['username']).first():
            user = LoginUser(
                username_login=ku['username'],
                nama=ku['nama'],
                status_login='kurir'
            )
            user.set_password(ku['password'])
            db.session.add(user)
    
    db.session.commit()
    print(f"✅ {LoginUser.query.count()} users created")
    
    # Create sample deliveries
    deliveries = [
        {'nama': 'Ahmad', 'alamat': 'Jl. Sudirman No. 1, Jakarta', 'lat': -6.2088, 'lng': 106.8456},
        {'nama': 'Budi', 'alamat': 'Jl. Thamrin No. 2, Jakarta', 'lat': -6.1944, 'lng': 106.8229},
        {'nama': 'Citra', 'alamat': 'Jl. Gatot Subroto No. 3, Jakarta', 'lat': -6.2297, 'lng': 106.8177},
        {'nama': 'Dewi', 'alamat': 'Jl. Rasuna Said No. 4, Jakarta', 'lat': -6.2246, 'lng': 106.8331},
        {'nama': 'Eko', 'alamat': 'Jl. Kuningan No. 5, Jakarta', 'lat': -6.2382, 'lng': 106.8308},
        {'nama': 'Fitri', 'alamat': 'Jl. Senopati No. 6, Jakarta', 'lat': -6.2349, 'lng': 106.8080},
        {'nama': 'Gita', 'alamat': 'Jl. Kemang No. 7, Jakarta', 'lat': -6.2615, 'lng': 106.8170},
        {'nama': 'Hadi', 'alamat': 'Jl. Blok M No. 8, Jakarta', 'lat': -6.2442, 'lng': 106.7996},
        {'nama': 'Indah', 'alamat': 'Jl. Fatmawati No. 9, Jakarta', 'lat': -6.2915, 'lng': 106.7979},
        {'nama': 'Joko', 'alamat': 'Jl. Cilandak No. 10, Jakarta', 'lat': -6.3021, 'lng': 106.8095},
    ]
    
    for d in deliveries:
        if not Pengiriman.query.filter_by(nama_penerima=d['nama']).first():
            pengiriman = Pengiriman(
                nama_penerima=d['nama'],
                alamat_penerima=d['alamat'],
                latitude_kirim=d['lat'],
                longitude_kirim=d['lng'],
                id_status=1  # Pending
            )
            db.session.add(pengiriman)
    
    db.session.commit()
    print(f"✅ {Pengiriman.query.count()} deliveries created")

print("\n" + "="*70)
print("✅ Database initialized successfully!")
print("="*70)
print("\nLogin Credentials:")
print("  Admin    : admin / admin123")
print("  SPV      : spv / spv123")
print("  Kurir 1  : kurir1 / kurir123 (Budi Santoso)")
print("  Kurir 2  : kurir2 / kurir123 (Andi Wijaya)")
print("  Kurir 3  : kurir3 / kurir123 (Rudi Hermawan)")
print("\n⚠️  IMPORTANT: Nama user SAMA dengan nama kurir untuk matching!")
print("="*70)
