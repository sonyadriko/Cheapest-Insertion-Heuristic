# Delivery Route Optimization System

Sistem penentuan rute pengiriman terpendek menggunakan algoritma **Cheapest Insertion Heuristic** dengan integrasi **Google Maps API**.

## 🚀 Tech Stack

**Backend:**
- Python Flask
- SQLAlchemy (ORM)
- Flask-JWT-Extended (Authentication)
- Google Maps Distance Matrix API

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Google Maps JavaScript API

## 📋 Features

- ✅ Authentication (Login/Logout)
- ✅ Manajemen Kurir (CRUD)
- ✅ Manajemen Pengiriman (CRUD)
- ✅ Optimasi Rute dengan Cheapest Insertion Heuristic
- ✅ Visualisasi Rute di Google Maps
- ✅ Role-based Access Control (Admin, SPV, Kurir)

## 🛠️ Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Maps API Key (dengan akses ke Distance Matrix API dan Maps JavaScript API)

### Backend Setup

1. Navigate ke folder backend:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` dan tambahkan Google Maps API key:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key_here
```

5. Run server:
```bash
python app.py
```

Server akan berjalan di `http://localhost:5000`

### Frontend Setup

1. Navigate ke folder frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` dan tambahkan Google Maps API key:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

5. Run development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 🔑 Default Credentials

- **Username:** admin
- **Password:** admin123

## 📖 Usage

1. **Login** dengan credentials default
2. **Kelola Kurir** - Tambah data kurir pengiriman
3. **Kelola Pengiriman** - Tambah data pengiriman dengan koordinat
4. **Optimasi Rute** - Pilih kurir dan pengiriman, lalu hitung rute optimal
5. **Lihat Hasil** - Visualisasi rute di peta dengan urutan pengiriman

## 🗺️ Google Maps API Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable APIs:
   - Distance Matrix API
   - Maps JavaScript API
4. Buat API key di Credentials
5. Copy API key ke file `.env` di backend dan frontend

## 📁 Project Structure

```
CIH/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── config.py           # Configuration
│   ├── routes/             # API routes
│   │   ├── auth.py
│   │   ├── kurir.py
│   │   ├── pengiriman.py
│   │   └── route_optimization.py
│   └── services/           # Business logic
│       ├── cih_algorithm.py
│       └── google_maps.py
└── frontend/
    ├── src/
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Page components
    │   └── services/       # API services
    └── public/
```

## 🧮 Cheapest Insertion Heuristic Algorithm

Algoritma ini bekerja dengan cara:
1. Mulai dari depot (lokasi kurir)
2. Pilih titik terdekat sebagai pengiriman pertama
3. Untuk setiap pengiriman yang tersisa:
   - Coba insert di setiap posisi dalam rute
   - Pilih posisi dengan cost increase paling kecil
4. Return rute optimal dengan total jarak minimum

## 📝 License

This project is for educational purposes.
# Cheapest-Insertion-Heuristic
