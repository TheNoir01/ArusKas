# ArusKas

ArusKas adalah aplikasi manajemen keuangan pribadi yang dibangun menggunakan **Ionic Framework** dan **Angular**. Aplikasi ini didesain untuk membantu pengguna mencatat pemasukan, pengeluaran, serta memantau saldo keuangan secara real-time di perangkat Android maupun Web.

## Fitur Utama

- **Pencatatan Transaksi**: Catat pemasukan (income) dan pengeluaran (outflow) dengan mudah.
- **Ringkasan Keuangan**: Pantau total saldo, total pemasukan, dan total pengeluaran dalam satu tampilan ringkas.
- **Target Menabung**: Set target tabungan dan pantau progresnya. (Jika tersedia di UI)
- **Ekspor Laporan**: Generate laporan keuangan dalam format PDF menggunakan `jsPDF`.
- **Dukungan Mobile**: Terintegrasi dengan **Capacitor** untuk pengalaman native di Android.
- **Penyimpanan Lokal**: Data tersimpan secara aman di penyimpanan lokal perangkat.

## Teknologi yang Digunakan

- [Ionic Framework](https://ionicframework.com/) - Mobile UI Toolkit.
- [Angular](https://angular.io/) - Framework pengembangan Web.
- [Capacitor](https://capacitorjs.com/) - Cross-platform native runtime.
- [jsPDF](https://github.com/parallax/jsPDF) - Library untuk generate file PDF.

## Persiapan Lingkungan

Sebelum memulai, pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (versi terbaru yang direkomendasikan)
- [Ionic CLI](https://ionicframework.com/docs/intro/cli) (`npm install -g @ionic/cli`)

## Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/TheNoir01/ArusKas.git
   cd ArusKas
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

## Menjalankan Aplikasi

### Mode Pengembangan (Web Browser)
Untuk menjalankan aplikasi di browser:
```bash
ionic serve
```

### Mode Android
Untuk menjalankan atau membangun aplikasi versi Android:

1. Build aplikasi web:
   ```bash
   ionic build
   ```

2. Sinkronkan dengan Capacitor:
   ```bash
   npx cap sync android
   ```

3. Buka Android Studio untuk menjalankan di emulator atau perangkat fisik:
   ```bash
   npx cap open android
   ```

## Struktur Folder

- `src/app/home`: Halaman utama ringkasan keuangan.
- `src/app/services`: Logika bisnis (pencatatan transaksi, perhitungan saldo).
- `src/app/models`: Definisi data (interface transaksi).
- `android/`: File proyek native untuk platform Android.

## Kontribusi

Kontribusi selalu terbuka! Silakan lakukan *Fork* repositori ini dan buat *Pull Request* dengan perubahan yang Anda usulkan.

## Lisensi

Dibuat oleh [TheNoir01](https://github.com/TheNoir01).
