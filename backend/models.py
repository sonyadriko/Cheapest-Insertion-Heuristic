from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class LoginUser(db.Model):
    __tablename__ = 'login_user'
    
    id_login = db.Column(db.Integer, primary_key=True)
    username_login = db.Column(db.String(50), unique=True, nullable=False)
    password_login = db.Column(db.String(255), nullable=False)
    nama = db.Column(db.String(100), nullable=False)
    status_login = db.Column(db.String(20), nullable=False)  # admin, spv, kurir
    
    def set_password(self, password):
        self.password_login = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_login, password)
    
    def to_dict(self):
        return {
            'id_login': self.id_login,
            'username_login': self.username_login,
            'nama': self.nama,
            'status_login': self.status_login
        }


class Kurir(db.Model):
    __tablename__ = 'data_kurir'
    
    id_kurir = db.Column(db.Integer, primary_key=True)
    nama_kurir = db.Column(db.String(60), nullable=False)
    alamat_kurir = db.Column(db.String(100), nullable=False)
    latitude_kurir = db.Column(db.Numeric(8, 6), nullable=True)
    longitude_kurir = db.Column(db.Numeric(9, 6), nullable=True)
    
    # Relationship
    pengiriman = db.relationship('Pengiriman', backref='kurir', lazy=True)
    
    def to_dict(self):
        return {
            'id_kurir': self.id_kurir,
            'nama_kurir': self.nama_kurir,
            'alamat_kurir': self.alamat_kurir,
            'latitude_kurir': float(self.latitude_kurir) if self.latitude_kurir else None,
            'longitude_kurir': float(self.longitude_kurir) if self.longitude_kurir else None
        }


class StatusKirim(db.Model):
    __tablename__ = 'proses_kirim'
    
    id_status = db.Column(db.Integer, primary_key=True)
    status_kirim = db.Column(db.String(30), nullable=False)
    
    # Relationship
    pengiriman = db.relationship('Pengiriman', backref='status', lazy=True)
    
    def to_dict(self):
        return {
            'id_status': self.id_status,
            'status_kirim': self.status_kirim
        }


class Pengiriman(db.Model):
    __tablename__ = 'data_pengiriman'
    
    id_kirim = db.Column(db.Integer, primary_key=True)
    id_kirim_kurir = db.Column(db.Integer, db.ForeignKey('data_kurir.id_kurir'), nullable=True)
    id_status = db.Column(db.Integer, db.ForeignKey('proses_kirim.id_status'), nullable=False, default=1)
    nama_penerima = db.Column(db.String(60), nullable=False)
    alamat_penerima = db.Column(db.String(100), nullable=False)
    latitude_kirim = db.Column(db.Numeric(8, 6), nullable=False)
    longitude_kirim = db.Column(db.Numeric(9, 6), nullable=False)
    tanggal_kirim = db.Column(db.Date, nullable=True)  # Tanggal pengiriman dijadwalkan
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id_kirim': self.id_kirim,
            'id_kirim_kurir': self.id_kirim_kurir,
            'id_status': self.id_status,
            'nama_penerima': self.nama_penerima,
            'alamat_penerima': self.alamat_penerima,
            'latitude_kirim': float(self.latitude_kirim),
            'longitude_kirim': float(self.longitude_kirim),
            'tanggal_kirim': self.tanggal_kirim.isoformat() if self.tanggal_kirim else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'kurir': self.kurir.to_dict() if self.kurir else None,
            'status': self.status.to_dict() if self.status else None
        }


class HasilRute(db.Model):
    __tablename__ = 'hasil_rute'
    
    id_hasil = db.Column(db.Integer, primary_key=True)
    id_kurir = db.Column(db.Integer, db.ForeignKey('data_kurir.id_kurir'), nullable=False)
    urutan_pengiriman = db.Column(db.Text, nullable=False)  # JSON string of delivery IDs in order
    total_jarak = db.Column(db.Float, nullable=False)  # in kilometers
    tanggal_rute = db.Column(db.Date, nullable=True)  # Tanggal rute dijadwalkan
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        import json
        return {
            'id_hasil': self.id_hasil,
            'id_kurir': self.id_kurir,
            'urutan_pengiriman': json.loads(self.urutan_pengiriman),
            'total_jarak': self.total_jarak,
            'tanggal_rute': self.tanggal_rute.isoformat() if self.tanggal_rute else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

