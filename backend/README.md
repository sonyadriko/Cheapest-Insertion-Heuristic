# Delivery Route Optimization Backend

Backend API untuk sistem penentuan rute pengiriman menggunakan algoritma Cheapest Insertion Heuristic.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` dan isi dengan konfigurasi Anda:
```bash
cp .env.example .env
```

3. Edit `.env` dan tambahkan Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key_here
```

4. Run the application:
```bash
python app.py
```

Server akan berjalan di `http://localhost:5000`

## Default Credentials

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register user baru (admin only)
- `GET /api/auth/me` - Get current user

### Kurir Management
- `GET /api/kurir` - Get all kurir
- `GET /api/kurir/<id>` - Get kurir by ID
- `POST /api/kurir` - Create kurir
- `PUT /api/kurir/<id>` - Update kurir
- `DELETE /api/kurir/<id>` - Delete kurir

### Pengiriman Management
- `GET /api/pengiriman` - Get all pengiriman
- `GET /api/pengiriman/<id>` - Get pengiriman by ID
- `GET /api/pengiriman/kurir/<id>` - Get pengiriman by kurir
- `GET /api/pengiriman/unassigned` - Get unassigned pengiriman
- `POST /api/pengiriman` - Create pengiriman
- `PUT /api/pengiriman/<id>` - Update pengiriman
- `DELETE /api/pengiriman/<id>` - Delete pengiriman

### Route Optimization
- `POST /api/route/optimize` - Calculate optimal route
- `GET /api/route/history` - Get route history
- `GET /api/route/history/<id>` - Get route detail

## Database Schema

- `login_user` - User authentication
- `data_kurir` - Courier data
- `data_pengiriman` - Delivery data
- `proses_kirim` - Delivery status
- `hasil_rute` - Route optimization results
