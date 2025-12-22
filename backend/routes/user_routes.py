from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, LoginUser
from werkzeug.security import generate_password_hash

user_bp = Blueprint('users', __name__)

def admin_required():
    """Decorator to check if current user is admin"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    if not current_user or current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    return None

@user_bp.route('', methods=['GET'])
@jwt_required()
def get_all_users():
    """Get all users (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    users = LoginUser.query.all()
    return jsonify([user.to_dict() for user in users]), 200


@user_bp.route('', methods=['POST'])
@jwt_required()
def create_user():
    """Create new user (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    data = request.get_json()
    
    # Validate required fields
    if not data.get('username_login') or not data.get('password_login') or not data.get('nama') or not data.get('status_login'):
        return jsonify({'error': 'username_login, password_login, nama, and status_login are required'}), 400
    
    # Validate username length
    if len(data['username_login']) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    # Validate password length
    if len(data['password_login']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Validate role
    if data['status_login'] not in ['admin', 'spv', 'kurir']:
        return jsonify({'error': 'Invalid role. Must be admin, spv, or kurir'}), 400
    
    # Check if username already exists
    existing_user = LoginUser.query.filter_by(username_login=data['username_login']).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400
    
    # Create new user
    new_user = LoginUser(
        username_login=data['username_login'],
        nama=data['nama'],
        status_login=data['status_login']
    )
    new_user.set_password(data['password_login'])
    
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


@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    """Update user (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    user = LoginUser.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'username_login' in data:
        # Check if new username already exists (excluding current user)
        existing_user = LoginUser.query.filter(
            LoginUser.username_login == data['username_login'],
            LoginUser.id_login != id
        ).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
        
        if len(data['username_login']) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        user.username_login = data['username_login']
    
    if 'nama' in data:
        user.nama = data['nama']
    
    if 'status_login' in data:
        if data['status_login'] not in ['admin', 'spv', 'kurir']:
            return jsonify({'error': 'Invalid role'}), 400
        user.status_login = data['status_login']
    
    # Update password if provided
    if 'password_login' in data and data['password_login']:
        if len(data['password_login']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        user.set_password(data['password_login'])
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    """Delete user (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    current_user_id = int(get_jwt_identity())
    
    # Prevent deleting own account
    if id == current_user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    user = LoginUser.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/<int:id>/password', methods=['PUT'])
@jwt_required()
def reset_password(id):
    """Reset user password (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    user = LoginUser.query.get(id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('new_password'):
        return jsonify({'error': 'new_password is required'}), 400
    
    if len(data['new_password']) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    user.set_password(data['new_password'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
