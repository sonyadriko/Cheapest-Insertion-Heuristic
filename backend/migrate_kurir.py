"""
Add latitude and longitude columns to Kurir table
"""
from app import create_app
from models import db

def migrate_kurir_location():
    app = create_app()
    
    with app.app_context():
        print("Adding latitude_kurir and longitude_kurir columns...")
        
        try:
            # Add columns using raw SQL
            db.engine.execute('ALTER TABLE data_kurir ADD COLUMN latitude_kurir NUMERIC(8,6)')
            db.engine.execute('ALTER TABLE data_kurir ADD COLUMN longitude_kurir NUMERIC(9,6)')
            
            print("✓ Columns added successfully!")
            
            # Set default location for existing kurir (Jakarta center)
            db.engine.execute('''
                UPDATE data_kurir 
                SET latitude_kurir = -6.2088, longitude_kurir = 106.8456 
                WHERE latitude_kurir IS NULL
            ''')
            
            print("✓ Default locations set for existing couriers")
            print("\n" + "="*50)
            print("✅ Migration completed successfully!")
            print("="*50)
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            print("Note: If columns already exist, this is normal.")

if __name__ == '__main__':
    migrate_kurir_location()
