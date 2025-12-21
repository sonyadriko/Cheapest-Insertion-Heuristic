"""
Create additional users (SPV and Kurir) for testing
"""
from app import create_app
from models import db, LoginUser

def create_users():
    app = create_app()
    
    with app.app_context():
        print("👥 Creating additional users...")
        
        # Create SPV user
        if not LoginUser.query.filter_by(username_login='spv').first():
            spv = LoginUser(
                username_login='spv',
                nama='Supervisor',
                status_login='spv'
            )
            spv.set_password('spv123')
            db.session.add(spv)
            print("✓ SPV user created")
        else:
            print("⚠ SPV user already exists")
        
        # Create Kurir users
        kurir_users = [
            {'username': 'kurir1', 'nama': 'Kurir Budi', 'password': 'kurir123'},
            {'username': 'kurir2', 'nama': 'Kurir Andi', 'password': 'kurir123'},
            {'username': 'kurir3', 'nama': 'Kurir Rudi', 'password': 'kurir123'},
        ]
        
        for kurir_data in kurir_users:
            if not LoginUser.query.filter_by(username_login=kurir_data['username']).first():
                kurir = LoginUser(
                    username_login=kurir_data['username'],
                    nama=kurir_data['nama'],
                    status_login='kurir'
                )
                kurir.set_password(kurir_data['password'])
                db.session.add(kurir)
                print(f"✓ {kurir_data['nama']} created")
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
        print("   Username: kurir1 / kurir2 / kurir3")
        print("   Password: kurir123")
        print("   Access: View assigned deliveries")
        print("="*50 + "\n")

if __name__ == '__main__':
    create_users()
