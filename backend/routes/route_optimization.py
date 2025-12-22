from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Pengiriman, Kurir, HasilRute, LoginUser
from services.cih_algorithm import CheapestInsertionHeuristic
import json

route_bp = Blueprint('route', __name__)

@route_bp.route('/optimize', methods=['POST'])
@jwt_required()
def optimize_route():
    """
    Calculate optimal delivery route using Cheapest Insertion Heuristic
    
    Request body:
    {
        "kurir_id": 1,
        "pengiriman_ids": [1, 2, 3, 4]
    }
    """
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    # Only admin and SPV can optimize routes
    if current_user.status_login not in ['admin', 'spv']:
        return jsonify({'error': 'Admin or SPV access required'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data.get('kurir_id') or not data.get('pengiriman_ids'):
        return jsonify({'error': 'kurir_id and pengiriman_ids are required'}), 400
    
    # Get kurir
    kurir = Kurir.query.get(data['kurir_id'])
    if not kurir:
        return jsonify({'error': 'Kurir not found'}), 404
    
    # Get pengiriman
    pengiriman_ids = data['pengiriman_ids']
    pengiriman_list = Pengiriman.query.filter(Pengiriman.id_kirim.in_(pengiriman_ids)).all()
    
    if len(pengiriman_list) != len(pengiriman_ids):
        return jsonify({'error': 'Some pengiriman not found'}), 404
    
    if len(pengiriman_list) < 1:
        return jsonify({'error': 'At least 1 delivery location required'}), 400
    
    try:
        # Prepare delivery locations
        delivery_locations = []
        for p in pengiriman_list:
            delivery_locations.append({
                'id': p.id_kirim,
                'lat': p.latitude_kirim,
                'lng': p.longitude_kirim,
                'nama_penerima': p.nama_penerima,
                'alamat_penerima': p.alamat_penerima
            })
        
        # Get depot location (kurir's base)
        if kurir.latitude_kurir and kurir.longitude_kurir:
            depot = (kurir.latitude_kurir, kurir.longitude_kurir)
        else:
            # Default depot if not set
            depot = (-6.2088, 106.8456)  # Jakarta center
        
        # Run CIH algorithm
        cih = CheapestInsertionHeuristic()
        result = cih.optimize(delivery_locations, depot)
        
        # Save to database
        hasil_rute = HasilRute(
            id_kurir=kurir.id_kurir,
            total_jarak=result['total_distance'],
            urutan_pengiriman=json.dumps(result['route'])
        )
        db.session.add(hasil_rute)
        
        # Update pengiriman to assign to kurir
        for p in pengiriman_list:
            p.id_kirim_kurir = kurir.id_kurir
        
        db.session.commit()
        
        # Prepare detailed response
        ordered_deliveries = []
        for delivery_id in result['route']:
            delivery = next(d for d in delivery_locations if d['id'] == delivery_id)
            ordered_deliveries.append({
                'id_kirim': delivery['id'],
                'nama_penerima': delivery['nama_penerima'],
                'alamat_penerima': delivery['alamat_penerima'],
                'latitude_kirim': delivery['lat'],
                'longitude_kirim': delivery['lng']
            })
        
        return jsonify({
            'message': 'Route optimized successfully',
            'kurir': kurir.to_dict(),
            'route': result['route'],
            'ordered_deliveries': ordered_deliveries,
            'total_distance': result['total_distance'],
            'route_segments': result.get('route_segments', []),
            'distance_matrix': result.get('distance_matrix', {}),
            'hasil_id': hasil_rute.id_hasil
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@route_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Get route optimization history"""
    hasil_list = HasilRute.query.order_by(HasilRute.created_at.desc()).all()
    return jsonify([h.to_dict() for h in hasil_list]), 200


@route_bp.route('/my-route', methods=['GET'])
@jwt_required()
def get_my_route():
    """Get the latest optimized route for the currently logged-in kurir"""
    current_user_id = int(get_jwt_identity())
    current_user = LoginUser.query.get(current_user_id)
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Find kurir associated with this user
    kurir = Kurir.query.filter_by(nama_kurir=current_user.nama).first()
    
    if not kurir:
        return jsonify({'error': 'Kurir not found'}), 404
    
    # Get latest route for this kurir
    latest_route = HasilRute.query.filter_by(id_kurir=kurir.id_kurir)\
        .order_by(HasilRute.id_hasil.desc()).first()
    
    if not latest_route:
        return jsonify({'message': 'No route assigned yet', 'route': None}), 200
    
    # Get all deliveries for this kurir
    deliveries = Pengiriman.query.filter_by(id_kirim_kurir=kurir.id_kurir).all()
    
    # Parse route order from hasil_rute
    try:
        route_order = json.loads(latest_route.urutan_pengiriman)
        # Sort deliveries by route order
        delivery_dict = {d.id_kirim: d for d in deliveries}
        ordered_deliveries = []
        for delivery_id in route_order:
            if delivery_id in delivery_dict:
                d = delivery_dict[delivery_id]
                ordered_deliveries.append({
                    'id_kirim': d.id_kirim,
                    'nama_penerima': d.nama_penerima,
                    'alamat_penerima': d.alamat_penerima,
                    'latitude_kirim': d.latitude_kirim,
                    'longitude_kirim': d.longitude_kirim,
                    'status': d.status.to_dict() if d.status else None
                })
    except:
        # Fallback to database order if route parsing fails
        ordered_deliveries = [{
            'id_kirim': d.id_kirim,
            'nama_penerima': d.nama_penerima,
            'alamat_penerima': d.alamat_penerima,
            'latitude_kirim': d.latitude_kirim,
            'longitude_kirim': d.longitude_kirim,
            'status': d.status.to_dict() if d.status else None
        } for d in deliveries]
    
    return jsonify({
        'kurir': kurir.to_dict(),
        'route': latest_route.to_dict(),
        'ordered_deliveries': ordered_deliveries,
        'total_distance': latest_route.total_jarak
    }), 200
