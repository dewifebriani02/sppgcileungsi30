# 🥗 SPPG Cileungsi 30 — Portal KPI Ibadah & Adab Kerja Karyawan

Aplikasi web *mobile-first* untuk mencatat kepatuhan **Ibadah Harian & 8 Adab Wajib di Lingkungan Kerja** karyawan **SPPG Cileungsi 30** (Satuan Pelayanan Pemenuhan Gizi).

Aplikasi ini dirancang khusus:
- **Zero Login**: Karyawan cukup memasukkan NIK sekali saat pertama kali buka di ponsel, nama dan divisi langsung terisi otomatis dan tersimpan permanen di HP tanpa repot login password/email.
- **Database Google Spreadsheet**: Data mutaba'ah langsung tercatat otomatis ke baris Google Spreadsheet secara *realtime* (owner bisa memantau spreadsheet langsung dari Google Drive di HP/laptop).
- **Hosting 100% Gratis & Ringan**: Langsung siap di-host di **GitHub Pages (`github.io`)** atau **Vercel** tanpa butuh server/database berbayar.
- **Portal Eksekutif Pimpinan**: Dilindungi PIN rahasia khusus Owner/Pimpinan, dilengkapi analitik kepatuhan, leaderboard karyawan istiqomah, filter divisi, serta tombol **Download Excel (.xlsx)** dan cetak laporan.

---

## 📿 Indikator Mutaba'ah Harian

### 1. Shalat Fardhu 5 Waktu (Bobot 40%)
- Subuh, Dzuhur, Ashar, Maghrib, Isya
- Pilihan status: **Masjid** (+100), **Jamaah** (+85), **Sendiri** (+65), **Udzur Syar'i** (Haid/Sakit - skor proporsional netral agar adil bagi karyawati).

### 2. Shalat Sunnah & Tilawah (Bobot 30%)
- Shalat Sunnah Rawatib (Qobliyah & Ba'diyah)
- Shalat Dhuha
- Shalat Tahajud / Qiyamul Lail & Witir
- Tilawah Al-Qur'an (Input lembar/halaman)
- **Dzikir Pagi** (Sesuai Sunnah Shahihah)
- **Dzikir Sore** (Sesuai Sunnah Shahihah)
- Istighfar & Shalawat Harian (min. 100x)
- Infaq / Sedekah Subuh
- Ibadah Puasa (Wajib / Sunnah / Tidak Puasa)

### 3. 8 Adab Wajib di Lingkungan Kerja SPPG (Bobot 30%)
1. **Basmalah & Hamdalah**: Memulai tugas dapur dengan bismillah dan menutup dengan alhamdulillah.
2. **Thaharah & Higienitas Dapur**: Menjaga wudhu, sanitasi diri, cuci tangan rutin, apron, sarung tangan & penutup kepala.
3. **Menjaga Lisan (Bebas Ghibah)**: Tidak membicarakan aib rekan kerja, bebas umpatan/kata kasar, tidak mengeluh.
4. **Budaya 5S & Salam**: Senyum, Salam, Sapa, Sopan, Santun saat berinteraksi dengan rekan & pimpinan.
5. **Muamalah Lawan Jenis (Iffah & Ghadul Bashar)**: Menjaga pandangan, tutur kata profesional, menghindari bercanda berlebihan.
6. **Amanah Waktu & Kedisiplinan**: Tepat waktu saat masuk shift kerja masak/packing dan tertib saat istirahat.
7. **Amanah Bahan Pangan & Aset SPPG**: Jujur takaran porsi gizi, tidak tabdzir/buang bahan, merawat peralatan dapur.
8. **Ta'awun & Kerja Tim**: Sigap dan ikhlas membantu rekan satu tim saat persiapan bumbu, masak, atau packing sedang padat.

---

## 🚀 Panduan Setup Database Google Spreadsheet (1 Menit)

Aplikasi ini dapat langsung mengirimkan data ke Google Spreadsheet milik Anda:

1. Buka [Google Sheets](https://sheets.new) di browser dan buat spreadsheet baru (Beri judul: `Database KPI SPPG Cileungsi 30`).
2. Di menu atas spreadsheet, klik: **Ekstensi (Extensions) > Apps Script**.
3. Buka file [`google-apps-script.js`](./google-apps-script.js) yang ada di folder proyek ini, lalu salin (*copy*) seluruh isinya ke editor Apps Script Google.
4. Klik tombol **Simpan (Save)** di Apps Script.
5. Klik tombol biru **Terapkan (Deploy) > Penerapan baru (New deployment)**.
6. Pada kolom *Pilih jenis*, pilih **Aplikasi web (Web app)**:
   - **Deskripsi**: `API SPPG Cileungsi 30`
   - **Jalankan sebagai (Execute as)**: `Saya (Me)`
   - **Yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(PENTING: agar karyawan bisa submit tanpa harus login Google)*
7. Klik **Terapkan (Deploy)** > Berikan Izin Akun Google Anda.
8. Salin **URL Aplikasi Web** yang diberikan (berakhiran `/exec`).
9. Buka aplikasi web SPPG > Masuk ke **Portal Pimpinan** (PIN: `8899`) > Klik **⚙️ Spreadsheet & PIN** > Tempelkan (*paste*) URL tersebut > Klik **Simpan**.

*Selesai! Setiap kali karyawan mengisi mutaba'ah, baris spreadsheet akan otomatis bertambah secara realtime.*

---

## 🌐 Cara Hosting Gratis

### Opsi 1: GitHub Pages (`github.io`)
1. Buat repositori baru di GitHub Anda (misal: `sppg-cileungsi-30`).
2. Jalankan perintah git di folder ini:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SPPG Cileungsi 30 KPI Ibadah & Adab"
   git branch -M main
   git remote add origin https://github.com/[USERNAME-ANDA]/sppg-cileungsi-30.git
   git push -u origin main
   ```
3. Buka repositori GitHub > **Settings > Pages > Branch: `main` / `root` > Save**.
4. Dalam 1 menit, web Anda aktif di: `https://[USERNAME-ANDA].github.io/sppg-cileungsi-30/`.

### Opsi 2: Vercel
1. Install atau buka [Vercel](https://vercel.com).
2. Hubungkan dengan repo GitHub atau drag-and-drop folder ini.
3. Langsung terbit tanpa konfigurasi tambahan (sudah ada `vercel.json`).

---

## 🔒 Akses Portal Pimpinan & Owner

- **URL Dashboard**: Buka `dashboard.html` atau klik tombol **"👑 Pimpinan"** di pojok kanan atas aplikasi.
- **PIN Keamanan**: Dilindungi PIN rahasia pimpinan (dapat diatur dan diubah kapan saja di menu **Pengaturan Spreadsheet & PIN**).

---

## 📁 Struktur Berkas

```
SPPG Cileungsi 30/
├── index.html              # Halaman Utama Mobile: Form Mutaba'ah Karyawan
├── dashboard.html          # Portal Eksekutif Monitoring Pimpinan & Owner
├── google-apps-script.js   # Script Backend Google Spreadsheet (Apps Script)
├── js/
│   ├── app.js              # Logika input karyawan, scoring realtime & animasi
│   ├── cloud-sync.js       # Sync engine ke Google Spreadsheet + offline cache
│   ├── roster-karyawan.js  # Master roster 28 karyawan default SPPG
│   └── dashboard.js        # Analitik, filter, export Excel (.xlsx) & manajemen
├── css/
│   ├── style.css           # Styling utama Mobile-First Modern Islamic
│   └── dashboard.css       # Styling analitik dashboard pimpinan
├── .nojekyll               # Pengaman static file GitHub Pages
├── vercel.json             # Konfigurasi deployment Vercel
└── README.md               # Dokumentasi lengkap
```
