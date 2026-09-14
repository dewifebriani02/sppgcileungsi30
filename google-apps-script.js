/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT — DATABASE KPI IBADAH & ADAB SPPG CILEUNGSI 30
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PANDUAN PEMASANGAN (HANYA 1 MENIT):
 * 1. Buat Google Spreadsheet baru di Google Drive (Beri nama: "Database KPI Ibadah SPPG Cileungsi 30")
 * 2. Di menu atas Google Spreadsheet, klik: Ekstensi (Extensions) > Apps Script
 * 3. Hapus semua kode yang ada di editor Apps Script, lalu COPY-PASTE seluruh isi script di bawah ini.
 * 4. Klik ikon Disket (Save / Simpan).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > Pilih "Penerapan baru" (New deployment).
 * 6. Klik ikon gerigi di sebelah 'Pilih jenis' > Pilih "Aplikasi web" (Web app).
 * 7. Atur pengaturan berikut:
 *    - Deskripsi: "API KPI SPPG Cileungsi 30"
 *    - Jalankan sebagai (Execute as): "Saya" (Me)
 *    - Yang memiliki akses (Who has access): "Siapa saja" (Anyone) -> AGAR KARYAWAN BISA KIRIM TANPA LOGIN GOOGLE
 * 8. Klik "Terapkan" (Deploy) > Izinkan Akses akun Google Anda.
 * 9. Salin URL Aplikasi Web yang diberikan (berakhiran /exec).
 * 10. Buka Dashboard SPPG Cileungsi 30 > Menu Pengaturan Spreadsheet > Paste URL tersebut. Selesai!
 */

const SHEET_NAME = "Rekap_KPI_Harian";

// Header Kolom di Google Spreadsheet
const HEADERS = [
  "ID Dokumen",
  "Waktu Input",
  "Tanggal KPI",
  "NIK",
  "Nama Karyawan",
  "Divisi",
  "Skor Total (%)",
  "Predikat",
  "Subuh",
  "Dzuhur",
  "Ashar",
  "Maghrib",
  "Isya",
  "Shalat Rawatib",
  "Shalat Dhuha",
  "Tahajud & Witir",
  "Tilawah Quran",
  "Dzikir Pagi",
  "Dzikir Sore",
  "Istighfar & Shalawat",
  "Infaq / Sedekah",
  "Puasa",
  "Adab Basmalah & Hamdalah",
  "Adab Thaharah & Higienitas",
  "Adab Menjaga Lisan",
  "Adab 5S Salam",
  "Adab Muamalah Lawan Jenis",
  "Adab Amanah Waktu",
  "Adab Amanah Bahan & Aset",
  "Adab Ta'awun Kerja Tim",
  "Catatan Karyawan"
];

function setupSheetIfNeeded(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tulis Header
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    // Format Header: Hijau Emerald dengan teks putih tebal
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#064E3B");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Handler POST: Menerima pengiriman data dari form web karyawan
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = setupSheetIfNeeded(ss);
    
    let rawContent = e.postData ? e.postData.contents : "{}";
    let payload = JSON.parse(rawContent);
    let item = payload.data || payload;

    if (!item.nik || !item.tanggal) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "NIK dan Tanggal wajib diisi" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const docId = item.docId || (item.nik + "_" + item.tanggal);
    const nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // Susun baris data
    const rowData = [
      docId,
      nowStr,
      item.tanggal || "",
      item.nik || "",
      item.nama || "",
      item.divisi || "",
      (item.skorTotal || 0) + "%",
      item.predikat || "",
      item.shalat ? item.shalat.subuh || "-" : "-",
      item.shalat ? item.shalat.dzuhur || "-" : "-",
      item.shalat ? item.shalat.ashar || "-" : "-",
      item.shalat ? item.shalat.maghrib || "-" : "-",
      item.shalat ? item.shalat.isya || "-" : "-",
      item.sunnah && item.sunnah.rawatib ? "Ya" : "Tidak",
      item.sunnah && item.sunnah.dhuha ? "Ya" : "Tidak",
      item.sunnah && item.sunnah.tahajud ? "Ya" : "Tidak",
      (item.tilawah ? item.tilawah + " Lembar/Halaman" : "0"),
      item.dzikir && item.dzikir.pagi ? "Ya" : "Tidak",
      item.dzikir && item.dzikir.sore ? "Ya" : "Tidak",
      item.dzikir && item.dzikir.istighfar ? "Ya" : "Tidak",
      item.infaq ? "Ya" : "Tidak",
      item.puasa || "Tidak Puasa",
      item.adab && item.adab.basmalah ? "Ya" : "Tidak",
      item.adab && item.adab.higienitas ? "Ya" : "Tidak",
      item.adab && item.adab.lisan ? "Ya" : "Tidak",
      item.adab && item.adab.salam ? "Ya" : "Tidak",
      item.adab && item.adab.muamalah ? "Ya" : "Tidak",
      item.adab && item.adab.waktu ? "Ya" : "Tidak",
      item.adab && item.adab.aset ? "Ya" : "Tidak",
      item.adab && item.adab.taawun ? "Ya" : "Tidak",
      item.catatan || ""
    ];

    // Cek apakah ID dokumen sudah pernah ada (Update jika sudah ada)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndexToUpdate = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === docId) {
        rowIndexToUpdate = i + 1;
        break;
      }
    }

    if (rowIndexToUpdate > 0) {
      sheet.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", docId: docId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handler GET: Mengambil data untuk Dashboard Pimpinan
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = setupSheetIfNeeded(ss);
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      rows.push({
        docId: row[0],
        updatedAt: row[1],
        tanggal: row[2],
        nik: row[3],
        nama: row[4],
        divisi: row[5],
        skorTotal: parseInt(String(row[6]).replace('%', '')) || 0,
        predikat: row[7],
        shalat: {
          subuh: row[8],
          dzuhur: row[9],
          ashar: row[10],
          maghrib: row[11],
          isya: row[12]
        },
        sunnah: {
          rawatib: row[13] === "Ya",
          dhuha: row[14] === "Ya",
          tahajud: row[15] === "Ya"
        },
        tilawah: parseInt(row[16]) || 0,
        dzikir: {
          pagi: row[17] === "Ya",
          sore: row[18] === "Ya",
          istighfar: row[19] === "Ya"
        },
        infaq: row[20] === "Ya",
        puasa: row[21],
        adab: {
          basmalah: row[22] === "Ya",
          higienitas: row[23] === "Ya",
          lisan: row[24] === "Ya",
          salam: row[25] === "Ya",
          muamalah: row[26] === "Ya",
          waktu: row[27] === "Ya",
          aset: row[28] === "Ya",
          taawun: row[29] === "Ya"
        },
        catatan: row[30]
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", data: rows }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
