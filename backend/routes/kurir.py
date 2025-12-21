from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Kurir, LoginUser

kurir_bp = Blueprint('kurir', __name__)

@kurir_bp.route('', methods=['GET'])
@jwt_required()
def get_all_kurir():
    """Get all kurir"""
    kurir_list = Kurir.query.all()
    return jsonify([kurir.to_dict() for kurir in kurir_list]), 200


@kurir_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_kurir(id):
    """Get single kurir by ID"""
    kurir = Kurir.query.get(id)
    
    if not kurir:
        return jsonify({'error': 'Kurir not found'}), 404
    
    return jsonify(kurir.to_dict()), 200


@kurir_bp.route('', methods=['POST'])
@jwt_required()
def create_kurir():
    """Create new kurir"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can create kurir
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data.get('nama_kurir') or not data.get('alamat_kurir'):
        return jsonify({'error': 'nama_kurir and alamat_kurir are required'}), 400
    
    # Create new kurir
    new_kurir = Kurir(
        nama_kurir=data['nama_kurir'],
        alamat_kurir=data['alamat_kurir'],
        latitude_kurir=data.get('latitude_kurir'),
        longitude_kurir=data.get('longitude_kurir')
    )
    
    try:
        db.session.add(new_kurir)
        db.session.commit()
        return jsonify({
            'message': 'Kurir created successfully',
            'kurir': new_kurir.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@kurir_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_kurir(id):
    """Update kurir"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can update kurir
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    kurir = Kurir.query.get(id)
    
    if not kurir:
        return jsonify({'error': 'Kurir not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'nama_kurir' in data:
        kurir.nama_kurir = data['nama_kurir']
    if 'alamat_kurir' in data:
        kurir.alamat_kurir = data['alamat_kurir']
    if 'latitude_kurir' in data:
        kurir.latitude_kurir = data['latitude_kurir']
    if 'longitude_kurir' in data:
        kurir.longitude_kurir = data['longitude_kurir']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Kurir updated successfully',
            'kurir': kurir.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@kurir_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_kurir(id):
    """Delete kurir"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can delete kurir
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    kurir = Kurir.query.get(id)
    
    if not kurir:
        return jsonify({'error': 'Kurir not found'}), 404
    
    try:
        db.session.delete(kurir)
        db.session.commit()
        return jsonify({'message': 'Kurir deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
