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
                'lat': float(p.latitude_kirim),
                'lng': float(p.longitude_kirim),
                'nama_penerima': p.nama_penerima,
                'alamat_penerima': p.alamat_penerima
            })
        
        # For depot, we'll use the first delivery location as starting point
        # In a real scenario, you'd geocode the kurir's address
        depot_location = (delivery_locations[0]['lat'], delivery_locations[0]['lng'])
        
        # Calculate optimal route
        cih = CheapestInsertionHeuristic()
        result = cih.calculate_optimal_route(depot_location, delivery_locations)
        
        # Save result to database
        hasil_rute = HasilRute(
            id_kurir=kurir.id_kurir,
            urutan_pengiriman=json.dumps(result['route']),
            total_jarak=result['total_distance']
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
            ordered_deliveries.append(delivery)
        
        return jsonify({
            'message': 'Route optimized successfully',
            'kurir': kurir.to_dict(),
            'route': result['route'],
            'ordered_deliveries': ordered_deliveries,
            'total_distance': result['total_distance'],
            'hasil_id': hasil_rute.id_hasil
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Route optimization failed: {str(e)}'}), 500


@route_bp.route('/history', methods=['GET'])
@jwt_required()
def get_route_history():
    """Get all route optimization history"""
    hasil_list = HasilRute.query.order_by(HasilRute.created_at.desc()).all()
    
    results = []
    for hasil in hasil_list:
        kurir = Kurir.query.get(hasil.id_kurir)
        hasil_dict = hasil.to_dict()
        hasil_dict['kurir'] = kurir.to_dict() if kurir else None
        results.append(hasil_dict)
    
    return jsonify(results), 200


@route_bp.route('/history/<int:id>', methods=['GET'])
@jwt_required()
def get_route_detail(id):
    """Get detailed route optimization result"""
    hasil = HasilRute.query.get(id)
    
    if not hasil:
        return jsonify({'error': 'Route result not found'}), 404
    
    kurir = Kurir.query.get(hasil.id_kurir)
    pengiriman_ids = json.loads(hasil.urutan_pengiriman)
    
    # Get delivery details
    deliveries = []
    for p_id in pengiriman_ids:
        pengiriman = Pengiriman.query.get(p_id)
        if pengiriman:
            deliveries.append(pengiriman.to_dict())
    
    result = hasil.to_dict()
    result['kurir'] = kurir.to_dict() if kurir else None
    result['deliveries'] = deliveries
    
    return jsonify(result), 200
