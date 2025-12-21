"""
Seed database with sample data for testing
"""
from app import create_app
from models import db, LoginUser, Kurir, Pengiriman, StatusKirim

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("🌱 Seeding database...")
        
        # Clear existing data (except users and status)
        Pengiriman.query.delete()
        Kurir.query.delete()
        
        # Add sample Kurir (Couriers)
        kurir_data = [
            {"nama_kurir": "Budi Santoso", "alamat_kurir": "Jl. Sudirman No. 123, Jakarta Pusat"},
            {"nama_kurir": "Andi Wijaya", "alamat_kurir": "Jl. Gatot Subroto No. 45, Jakarta Selatan"},
            {"nama_kurir": "Rudi Hermawan", "alamat_kurir": "Jl. Thamrin No. 67, Jakarta Pusat"},
        ]
        
        kurir_list = []
        for data in kurir_data:
            kurir = Kurir(**data)
            db.session.add(kurir)
            kurir_list.append(kurir)
        
        db.session.flush()  # Get IDs
        print(f"✓ Added {len(kurir_list)} couriers")
        
        # Add sample Pengiriman (Deliveries) - Jakarta area coordinates
        pengiriman_data = [
            {
                "nama_penerima": "PT. Maju Jaya",
                "alamat_penerima": "Jl. MH Thamrin No. 1, Jakarta Pusat",
                "latitude_kirim": -6.1944,
                "longitude_kirim": 106.8229,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "CV. Berkah Sejahtera",
                "alamat_penerima": "Jl. Sudirman No. 52-53, Jakarta Selatan",
                "latitude_kirim": -6.2088,
                "longitude_kirim": 106.8456,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Toko Elektronik Jaya",
                "alamat_penerima": "Jl. Gatot Subroto Kav. 18, Jakarta Selatan",
                "latitude_kirim": -6.2297,
                "longitude_kirim": 106.8253,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Restoran Padang Sederhana",
                "alamat_penerima": "Jl. Sabang No. 26, Jakarta Pusat",
                "latitude_kirim": -6.1867,
                "longitude_kirim": 106.8289,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Hotel Grand Indonesia",
                "alamat_penerima": "Jl. Kebon Kacang Raya No. 1, Jakarta Pusat",
                "latitude_kirim": -6.1953,
                "longitude_kirim": 106.8230,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Kantor Pos Jakarta Pusat",
                "alamat_penerima": "Jl. Pos No. 2, Jakarta Pusat",
                "latitude_kirim": -6.1751,
                "longitude_kirim": 106.8272,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Rumah Sakit Cipto Mangunkusumo",
                "alamat_penerima": "Jl. Diponegoro No. 71, Jakarta Pusat",
                "latitude_kirim": -6.1862,
                "longitude_kirim": 106.8310,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Universitas Indonesia Salemba",
                "alamat_penerima": "Jl. Salemba Raya No. 4, Jakarta Pusat",
                "latitude_kirim": -6.1989,
                "longitude_kirim": 106.8411,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Mall Plaza Senayan",
                "alamat_penerima": "Jl. Asia Afrika, Jakarta Pusat",
                "latitude_kirim": -6.2253,
                "longitude_kirim": 106.8000,
                "id_kirim_kurir": None,
                "id_status": 1
            },
            {
                "nama_penerima": "Gedung Bursa Efek Indonesia",
                "alamat_penerima": "Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan",
                "latitude_kirim": -6.2088,
                "longitude_kirim": 106.8456,
                "id_kirim_kurir": None,
                "id_status": 1
            }
        ]
        
        pengiriman_list = []
        for data in pengiriman_data:
            pengiriman = Pengiriman(**data)
            db.session.add(pengiriman)
            pengiriman_list.append(pengiriman)
        
        print(f"✓ Added {len(pengiriman_list)} deliveries")
        
        # Commit all changes
        db.session.commit()
        
        print("\n" + "="*50)
        print("✅ Database seeded successfully!")
        print("="*50)
        print(f"Total Couriers: {Kurir.query.count()}")
        print(f"Total Deliveries: {Pengiriman.query.count()}")
        print(f"Unassigned Deliveries: {Pengiriman.query.filter_by(id_kirim_kurir=None).count()}")
        print("="*50)
        print("\nYou can now:")
        print("1. Login to the app")
        print("2. Go to Route Optimization page")
        print("3. Select a courier and deliveries")
        print("4. Calculate optimal route!")
        print("="*50 + "\n")

if __name__ == '__main__':
    seed_database()
