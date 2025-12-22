"""
Create additional users (SPV and Kurir) for testing
"""
from app import create_app
from models import db, LoginUser, Kurir

def create_users():
    app = create_app()
    
    with app.app_context():
        print("👥 Creating additional users...")
        
        # Create SPV user
        if not LoginUser.query.filter_by(username_login='spv').first():
            spv = LoginUser(
                username_login='spv',
                nama='Supervisor',
                status_login='spv',
                id_kurir=None  # SPV is not a kurir
            )
            spv.set_password('spv123')
            db.session.add(spv)
            print("✓ SPV user created")
        else:
            print("⚠ SPV user already exists")
        
        # Get kurir records to link with users
        kurir_budi = Kurir.query.filter_by(nama_kurir='Budi Santoso').first()
        kurir_andi = Kurir.query.filter_by(nama_kurir='Andi Wijaya').first()
        kurir_rudi = Kurir.query.filter_by(nama_kurir='Rudi Hermawan').first()
        
        # Create Kurir users and link to kurir records
        kurir_users = [
            {'username': 'kurir1', 'nama': 'Budi Santoso', 'password': 'kurir123', 'id_kurir': kurir_budi.id_kurir if kurir_budi else None},
            {'username': 'kurir2', 'nama': 'Andi Wijaya', 'password': 'kurir123', 'id_kurir': kurir_andi.id_kurir if kurir_andi else None},
            {'username': 'kurir3', 'nama': 'Rudi Hermawan', 'password': 'kurir123', 'id_kurir': kurir_rudi.id_kurir if kurir_rudi else None},
        ]
        
        for kurir_data in kurir_users:
            if not LoginUser.query.filter_by(username_login=kurir_data['username']).first():
                kurir = LoginUser(
                    username_login=kurir_data['username'],
                    nama=kurir_data['nama'],
                    status_login='kurir',
                    id_kurir=kurir_data['id_kurir']
                )
                kurir.set_password(kurir_data['password'])
                db.session.add(kurir)
                print(f"✓ {kurir_data['nama']} created (linked to Kurir ID {kurir_data['id_kurir']})")
            else:
                print(f"⚠ {kurir_data['username']} already exists")
        
        db.session.commit()
        
        print("\n" + "="*50)
        print("✅ Users created successfully!")
        print("="*50)
        print("\nLogin Credentials:")
        print("\n1. ADMIN:")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Access: Full access (CRUD Kurir, Pengiriman, Route Optimization)")
        
        print("\n2. SPV (Supervisor):")
        print("   Username: spv")
        print("   Password: spv123")
        print("   Access: View data, Route Optimization")
        
        print("\n3. KURIR:")
        print("   Username: kurir1 (Budi Santoso)")
        print("   Username: kurir2 (Andi Wijaya)")
        print("   Username: kurir3 (Rudi Hermawan)")
        print("   Password: kurir123")
        print("   Access: View assigned deliveries")
        print("="*50 + "\n")

if __name__ == '__main__':
    create_users()
