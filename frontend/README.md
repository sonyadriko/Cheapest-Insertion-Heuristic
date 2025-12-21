# Delivery Route Optimization Frontend

Frontend aplikasi untuk sistem penentuan rute pengiriman menggunakan React + TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Edit `.env` dan tambahkan konfigurasi:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Run development server:
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Features

### Dashboard
- Statistik overview (total kurir, pengiriman, dll)
- Quick actions untuk navigasi

### Kelola Kurir
- CRUD operations untuk data kurir
- Search functionality
- Admin only access

### Kelola Pengiriman
- CRUD operations untuk data pengiriman
- Input koordinat (latitude/longitude)
- Assign kurir ke pengiriman
- Admin only access

### Optimasi Rute
- Pilih kurir dan multiple pengiriman
- Hitung rute optimal dengan Cheapest Insertion Heuristic
- Visualisasi rute di Google Maps
- Display urutan pengiriman dan total jarak
- Admin & SPV access

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- Google Maps API
- React Icons
