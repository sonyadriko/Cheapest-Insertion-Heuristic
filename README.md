# Delivery Route Optimization System

Sistem optimasi rute pengiriman menggunakan algoritma **Cheapest Insertion Heuristic (CIH)** untuk menentukan rute pengiriman paling efisien.

## 🚀 Features

- **Route Optimization**: Algoritma CIH untuk menghitung rute optimal
- **Multi-Role System**: Admin, Supervisor, dan Kurir dengan akses berbeda
- **Real-time Route Display**: Kurir melihat urutan pengiriman optimal
- **Google Maps Integration**: Navigasi langsung ke lokasi pengiriman
- **Detailed Analytics**: Distance matrix dan route segments
- **Interactive Map**: Visualisasi rute dengan Google Maps

## � Prerequisites

- Python 3.8+
- Node.js 16+
- npm atau yarn
- Google Maps API Key

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd CIH
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Google Maps API Key
# GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Google Maps API Key
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
# VITE_API_URL=http://localhost:8000/api
```

## 🗄️ Database Setup

### Initialize Database

Jalankan script berikut untuk membuat database dan seed data:

```bash
cd backend

# Setup database dengan data awal
python3 setup_db.py
```

Script ini akan:
- ✅ Membuat semua tabel database
- ✅ Membuat 3 kurir (Budi Santoso, Andi Wijaya, Rudi Hermawan)
- ✅ Membuat 20 pengiriman sample
- ✅ Membuat user untuk admin, supervisor, dan kurir

### Database Schema

**Tabel Utama:**
- `login_user` - Data user dan autentikasi
- `data_kurir` - Master data kurir dengan lokasi depot
- `data_pengiriman` - Data pengiriman dengan koordinat GPS
- `hasil_rute` - Hasil optimasi rute
- `proses_kirim` - Status pengiriman

## ▶️ Running the Application

### Start Backend

```bash
cd backend
python3 app.py
```

Backend akan berjalan di: `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend akan berjalan di: `http://localhost:5173`

## � Default User Credentials

### Admin
- **Username**: `admin`
- **Password**: `admin123`
- **Akses**: Full access (CRUD Kurir, Pengiriman, Route Optimization, User Management)

### Supervisor
- **Username**: `spv`
- **Password**: `spv123`
- **Akses**: View data, Route Optimization

### Kurir
- **Username**: `kurir1` / `kurir2` / `kurir3`
- **Password**: `kurir123`
- **Akses**: View assigned deliveries dan route order
- **Mapping**:
  - `kurir1` → Budi Santoso
  - `kurir2` → Andi Wijaya
  - `kurir3` → Rudi Hermawan

## 📖 Usage Guide

### 1. Login sebagai Admin

1. Buka `http://localhost:5173`
2. Login dengan `admin` / `admin123`

### 2. Kelola Data Kurir

1. Navigasi ke menu **Kurir**
2. Tambah/Edit/Hapus data kurir
3. Pastikan setiap kurir punya koordinat depot (latitude/longitude)

### 3. Kelola Data Pengiriman

1. Navigasi ke menu **Pengiriman**
2. Tambah pengiriman baru dengan:
   - Nama penerima
   - Alamat lengkap
   - Koordinat GPS (gunakan map picker)

### 4. Optimasi Rute

1. Navigasi ke menu **Route Optimization**
2. Pilih kurir dari dropdown
3. Pilih pengiriman yang akan di-assign (centang checkbox)
4. Klik **"Hitung Rute Optimal"**
5. Sistem akan:
   - Menghitung rute optimal menggunakan CIH
   - Menampilkan distance matrix
   - Menampilkan route segments
   - Menampilkan peta dengan rute
   - Assign pengiriman ke kurir

### 5. Dashboard Kurir

1. Logout dari admin
2. Login sebagai kurir (contoh: `kurir1` / `kurir123`)
3. Dashboard akan menampilkan:
   - 📊 Total pengiriman assigned
   - 📍 Urutan rute optimal (1, 2, 3, ...)
   - 🗺️ Tombol navigasi ke setiap lokasi
   - 📦 Detail setiap pengiriman
   - ✅ Status pengiriman

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Kurir Management
- `GET /api/kurir` - Get all kurir
- `POST /api/kurir` - Create kurir
- `PUT /api/kurir/:id` - Update kurir
- `DELETE /api/kurir/:id` - Delete kurir

### Pengiriman Management
- `GET /api/pengiriman` - Get all pengiriman
- `GET /api/pengiriman/unassigned` - Get unassigned pengiriman
- `GET /api/pengiriman/my-deliveries` - Get kurir's assigned deliveries
- `POST /api/pengiriman` - Create pengiriman
- `PUT /api/pengiriman/:id` - Update pengiriman
- `DELETE /api/pengiriman/:id` - Delete pengiriman

### Route Optimization
- `POST /api/route/optimize` - Calculate optimal route
- `GET /api/route/history` - Get optimization history
- `GET /api/route/my-route` - Get kurir's current route

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🧮 CIH Algorithm

Sistem menggunakan **Cheapest Insertion Heuristic** untuk optimasi rute:

1. Mulai dari depot kurir
2. Pilih lokasi terdekat sebagai starting point
3. Untuk setiap lokasi yang belum dikunjungi:
   - Hitung cost untuk insert di setiap posisi rute
   - Pilih posisi dengan cost terendah
4. Return ke depot
5. Hitung total jarak dan route segments

## 🗺️ Google Maps Integration

### Setup API Key

1. Buat project di [Google Cloud Console](https://console.cloud.google.com)
2. Enable APIs:
   - Maps JavaScript API
   - Distance Matrix API
   - Geocoding API
3. Create API Key
4. Tambahkan ke `.env` file (backend dan frontend)

### Features
- **Map Picker**: Pilih lokasi dengan klik pada peta
- **Route Visualization**: Tampilkan rute optimal di peta
- **Navigation**: Buka Google Maps untuk navigasi turn-by-turn

## 📁 Project Structure

```
CIH/
├── backend/
│   ├── app.py                 # Flask application
│   ├── models.py              # Database models
│   ├── config.py              # Configuration
│   ├── setup_db.py            # Database setup script
│   ├── routes/
│   │   ├── auth.py           # Authentication routes
│   │   ├── kurir.py          # Kurir management
│   │   ├── pengiriman.py     # Pengiriman management
│   │   ├── route_optimization.py  # Route optimization
│   │   └── user_routes.py    # User management
│   └── services/
│       └── cih_algorithm.py  # CIH implementation
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── contexts/         # React contexts (Auth)
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   └── App.tsx          # Main app component
    └── package.json
```

## 🐛 Troubleshooting

### Database Issues

**Error: "no such table"**
```bash
# Recreate database
cd backend
rm delivery_route.db
python3 setup_db.py
```

### CORS Issues

**Error: "CORS policy blocked"**
- Pastikan backend running di port 8000
- Pastikan frontend `.env` punya `VITE_API_URL=http://localhost:8000/api`
- Restart kedua server

### Login Issues

**Stuck di login page**
```javascript
// Clear browser localStorage
// Buka Console (F12) dan jalankan:
localStorage.clear()
// Refresh page
```

### Map Not Loading

**Google Maps tidak muncul**
- Cek API Key sudah benar di `.env`
- Pastikan APIs sudah di-enable di Google Cloud Console
- Cek browser console untuk error messages

## 📝 Development Notes

### Adding New Kurir

1. Login sebagai admin
2. Tambah kurir di menu Kurir
3. Buat user baru di User Management dengan:
   - `status_login` = "kurir"
   - `nama` = **sama persis** dengan nama kurir
   - Contoh: Kurir "Budi Santoso" → User nama "Budi Santoso"

### Name Matching Important!

⚠️ **PENTING**: Nama di `login_user.nama` HARUS sama persis dengan `data_kurir.nama_kurir` untuk kurir users!

Sistem menggunakan name matching untuk link user dengan kurir:
```python
kurir = Kurir.query.filter_by(nama_kurir=current_user.nama).first()
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## � License

MIT License

## 👨‍💻 Author

Delivery Route Optimization System
