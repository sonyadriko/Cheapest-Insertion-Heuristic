from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, LoginUser

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint for Admin, Kurir, and SPV"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = LoginUser.query.filter_by(username_login=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create access token - identity must be string
    access_token = create_access_token(identity=str(user.id_login))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/register', methods=['POST'])
@jwt_required()
def register():
    """Register new user (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Check if current user is admin
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'password', 'nama', 'status']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if username already exists
    if LoginUser.query.filter_by(username_login=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    # Validate status
    if data['status'] not in ['admin', 'kurir', 'spv']:
        return jsonify({'error': 'Invalid status. Must be admin, kurir, or spv'}), 400
    
    # Create new user
    new_user = LoginUser(
        username_login=data['username'],
        nama=data['nama'],
        status_login=data['status']
    )
    new_user.set_password(data['password'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    current_user_id = int(get_jwt_identity())
    user = LoginUser.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict()), 200
