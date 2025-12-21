from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, LoginUser, StatusKirim

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.kurir import kurir_bp
    from routes.pengiriman import pengiriman_bp
    from routes.route_optimization import route_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(kurir_bp, url_prefix='/api/kurir')
    app.register_blueprint(pengiriman_bp, url_prefix='/api/pengiriman')
    app.register_blueprint(route_bp, url_prefix='/api/route')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'API is running'}), 200
    
    # Create tables and seed data
    with app.app_context():
        db.create_all()
        
        # Seed default data if not exists
        if StatusKirim.query.count() == 0:
            default_statuses = [
                StatusKirim(status_kirim='Pending'),
                StatusKirim(status_kirim='In Progress'),
                StatusKirim(status_kirim='Delivered'),
                StatusKirim(status_kirim='Cancelled')
            ]
            db.session.add_all(default_statuses)
            db.session.commit()
            print("✓ Default status created")
        
        # Create default admin user if not exists
        if LoginUser.query.filter_by(username_login='admin').first() is None:
            admin = LoginUser(
                username_login='admin',
                nama='Administrator',
                status_login='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("✓ Default admin user created (username: admin, password: admin123)")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("\n" + "="*50)
    print("🚀 Delivery Route Optimization API")
    print("="*50)
    print("Server running on: http://localhost:8000")
    print("API endpoints available at: http://localhost:8000/api/")
    print("\nDefault credentials:")
    print("  Username: admin")
    print("  Password: admin123")
    print("="*50 + "\n")
    app.run(debug=True, host='0.0.0.0', port=8000)
