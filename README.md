# Proyek To-Do List dengan Backend Apps Script

Ini adalah aplikasi To-Do List berbasis web yang modern dan elegan, menggunakan **Google Sheets** dan **Google Apps Script** sebagai backend database.

## 🌟 Fitur

*   **Antarmuka Modern**: Desain Glassmorphism yang elegan dengan animasi halus.
*   **CRUD Lengkap**: Tambah, Baca, Edit, dan Hapus tugas.
*   **Status Tugas**: Tandai tugas sebagai selesai atau belum selesai.
*   **Filter**: Lihat semua tugas, hanya yang selesai, atau yang belum selesai.
*   **Backend Serverless**: Data tersimpan aman di Google Sheets Anda sendiri.
*   **Konfigurasi Mudah**: Cukup masukkan URL Web App Google Apps Script Anda.

## 🛠️ Teknologi yang Digunakan

*   **Frontend**: HTML5, CSS3 (Glassmorphism), Vanilla JavaScript.
*   **Backend**: Google Apps Script (JavaScript).
*   **Database**: Google Sheets.

## 📋 Cara Penggunaan

### 1. Persiapan Backend (Google Apps Script)

1.  Buka [Google Sheets](https://sheets.google.com) baru.
2.  Pergi ke **Ekstensi** > **Apps Script**.
3.  Salin kode dari file `app.script` yang ada di folder ini.
4.  Tempelkan kode tersebut ke editor Apps Script, menggantikan kode yang ada.
5.  Simpan proyek (Ctrl + S).
6.  **PENTING**: Deploy sebagai Web App.
    *   Klik tombol **Deploy** (Terapkan) > **New deployment** (Deployment baru).
    *   Pilih type: **Web app**.
    *   Description: (Bebas, misal "Versi 1").
    *   Execute as: **Me** (Saya).
    *   Who has access: **Anyone** (Siapa saja).
    *   Klik **Deploy**.
7.  Salin **Web App URL** yang diberikan (akhiran `/exec`).

### 2. Menjalankan Aplikasi

1.  Buka file `index.html` di browser Anda (Chrome, Firefox, Edge, dll).
2.  Di bagian bawah aplikasi, cari bagian **Konfigurasi Apps Script**.
3.  Tempelkan URL Web App yang sudah Anda salin tadi ke kolom input.
4.  Klik **Simpan URL**.
5.  Klik **Test Koneksi** untuk memastikan semuanya berjalan lancar.
6.  Selesai! Anda sekarang bisa menambahkan tugas.

## 🎨 Kustomisasi

Tampilan aplikasi diatur sepenuhnya di `style.css`. Anda dapat mengubah warna tema di bagian `:root` pada baris-baris awal file CSS.

```css
:root {
    --primary-color: #6c5ce7; /* Warna utama */
    --bg-gradient: ... /* Warna latar belakang */
}
```

## 📝 Catatan

Pastikan Anda memberikan izin akses yang diperlukan saat melakukan deployment Google Apps Script pertama kali. Google akan meminta verifikasi karena script ini dibuat oleh Anda sendiri.

---
Dibuat dengan ❤️ untuk produktivitas Anda.
