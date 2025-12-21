from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Pengiriman, LoginUser, Kurir

pengiriman_bp = Blueprint('pengiriman', __name__)

@pengiriman_bp.route('', methods=['GET'])
@jwt_required()
def get_all_pengiriman():
    """Get all pengiriman"""
    pengiriman_list = Pengiriman.query.all()
    return jsonify([p.to_dict() for p in pengiriman_list]), 200


@pengiriman_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_pengiriman(id):
    """Get single pengiriman by ID"""
    pengiriman = Pengiriman.query.get(id)
    
    if not pengiriman:
        return jsonify({'error': 'Pengiriman not found'}), 404
    
    return jsonify(pengiriman.to_dict()), 200


@pengiriman_bp.route('/kurir/<int:kurir_id>', methods=['GET'])
@jwt_required()
def get_pengiriman_by_kurir(kurir_id):
    """Get all pengiriman for a specific kurir"""
    pengiriman_list = Pengiriman.query.filter_by(id_kirim_kurir=kurir_id).all()
    return jsonify([p.to_dict() for p in pengiriman_list]), 200


@pengiriman_bp.route('/unassigned', methods=['GET'])
@jwt_required()
def get_unassigned_pengiriman():
    """Get all unassigned pengiriman (no kurir assigned)"""
    pengiriman_list = Pengiriman.query.filter_by(id_kirim_kurir=None).all()
    return jsonify([p.to_dict() for p in pengiriman_list]), 200


@pengiriman_bp.route('', methods=['POST'])
@jwt_required()
def create_pengiriman():
    """Create new pengiriman"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can create pengiriman
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['nama_penerima', 'alamat_penerima', 'latitude_kirim', 'longitude_kirim']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate kurir if provided
    if data.get('id_kirim_kurir'):
        kurir = Kurir.query.get(data['id_kirim_kurir'])
        if not kurir:
            return jsonify({'error': 'Kurir not found'}), 404
    
    # Create new pengiriman
    new_pengiriman = Pengiriman(
        nama_penerima=data['nama_penerima'],
        alamat_penerima=data['alamat_penerima'],
        latitude_kirim=data['latitude_kirim'],
        longitude_kirim=data['longitude_kirim'],
        id_kirim_kurir=data.get('id_kirim_kurir'),
        id_status=data.get('id_status', 1)  # Default status 1
    )
    
    try:
        db.session.add(new_pengiriman)
        db.session.commit()
        return jsonify({
            'message': 'Pengiriman created successfully',
            'pengiriman': new_pengiriman.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@pengiriman_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_pengiriman(id):
    """Update pengiriman"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can update pengiriman
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    pengiriman = Pengiriman.query.get(id)
    
    if not pengiriman:
        return jsonify({'error': 'Pengiriman not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'nama_penerima' in data:
        pengiriman.nama_penerima = data['nama_penerima']
    if 'alamat_penerima' in data:
        pengiriman.alamat_penerima = data['alamat_penerima']
    if 'latitude_kirim' in data:
        pengiriman.latitude_kirim = data['latitude_kirim']
    if 'longitude_kirim' in data:
        pengiriman.longitude_kirim = data['longitude_kirim']
    if 'id_kirim_kurir' in data:
        # Validate kurir if provided
        if data['id_kirim_kurir']:
            kurir = Kurir.query.get(data['id_kirim_kurir'])
            if not kurir:
                return jsonify({'error': 'Kurir not found'}), 404
        pengiriman.id_kirim_kurir = data['id_kirim_kurir']
    if 'id_status' in data:
        pengiriman.id_status = data['id_status']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Pengiriman updated successfully',
            'pengiriman': pengiriman.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@pengiriman_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_pengiriman(id):
    """Delete pengiriman"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin can delete pengiriman
    if current_user.status_login != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    pengiriman = Pengiriman.query.get(id)
    
    if not pengiriman:
        return jsonify({'error': 'Pengiriman not found'}), 404
    
    try:
        db.session.delete(pengiriman)
        db.session.commit()
        return jsonify({'message': 'Pengiriman deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
