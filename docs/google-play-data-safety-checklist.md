# Checklist Data Safety Google Play - ArusKas

Tanggal referensi: 27 April 2026
Package name: com.aruskas.myapp

Dokumen ini adalah panduan pengisian Data Safety berdasarkan implementasi aplikasi saat ini (data lokal, tanpa backend server milik developer).

## A. Gambaran Implementasi Saat Ini

- Data profil (nama) dan data transaksi disimpan di local storage perangkat.
- Aplikasi menghasilkan PDF laporan keuangan.
- Pada platform native, PDF disimpan sementara (cache) lalu bisa dibagikan lewat share sheet saat pengguna menekan tombol share.
- Tidak ditemukan integrasi analytics, ads SDK, atau backend login.

## B. Rekomendasi Jawaban Data Safety (Draft)

### 1) Does your app collect or share any of the required user data types?

Rekomendasi awal:
- Pilih No, jika definisi Anda: tidak ada pengumpulan data ke server developer/third party secara otomatis.

Catatan:
- Fitur berbagi PDF adalah aksi manual oleh pengguna. Umumnya ini bukan data collection oleh developer, tetapi tetap cek definisi terbaru di form Play Console sebelum submit.

### 2) Is all of the user data collected by your app encrypted in transit?

Rekomendasi:
- Jika Anda memilih No collection pada poin (1), pertanyaan ini biasanya tidak relevan.

### 3) Do you provide a way for users to request that their data is deleted?

Rekomendasi:
- Jika tidak ada akun/server, jelaskan bahwa data berada di perangkat pengguna dan dapat dihapus melalui hapus data aplikasi atau uninstall.

## C. Jika Anda Memilih Ada Data yang Diproses

Bila saat review Anda memutuskan tetap mendeklarasikan data tertentu, gunakan mapping konservatif berikut:

- Personal info > Name
  - Tujuan: App functionality
  - Optional: Yes (user bebas isi)
  - Collected: Local/device only (bukan server)

- Financial info
  - Jenis: transaksi pemasukan/pengeluaran
  - Tujuan: App functionality
  - Optional: Yes (tergantung penggunaan)

- App activity / App info and performance
  - Saat ini: tidak ada SDK analytics/crash reporting terdeteksi.

## D. Isian Lain di Play Console yang Biasanya Diminta

- Privacy Policy URL wajib (URL publik HTTPS).
- App content questionnaire:
  - Ads: No (jika memang tidak ada iklan)
  - Target audience: sesuaikan pengguna yang dituju
  - Content rating: isi sampai selesai

## E. Final Check Sebelum Submit

1. Pastikan isi Privacy Policy konsisten dengan Data Safety.
2. Jangan klaim No collection jika nanti menambah analytics/ads/login cloud tanpa update form.
3. Simpan tangkapan layar pengisian form sebagai arsip internal.

## F. Trigger Untuk Update Data Safety

Wajib update jawaban Data Safety jika nanti menambah:

- Firebase Analytics / Crashlytics
- SDK iklan
- Login akun (email/telepon)
- Sinkronisasi cloud / backend API
- Tracking pihak ketiga
