/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOOGLE APPS SCRIPT — DATABASE KPI IBADAH, ADAB & DATA KARYAWAN
 * Satuan Pelayanan Pemenuhan Gizi (SPPG) Cileungsi 30
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CARA MEMPERBARUI DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet Anda:
 *    https://docs.google.com/spreadsheets/d/1oAeiewUl2wj3SxGJQ_IgAg6KhC1U4Qb3ubDmGvVIcl0/edit
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script
 * 3. HAPUS SEMUA KODE LAMA, lalu REPLACE DENGAN SELURUH KODE DI BAWAH INI.
 * 4. Klik ikon Disket (Simpan / Save).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > Pilih "Kelola penerapan" (Manage deployments).
 * 6. Klik ikon Pensil (Edit) > Pada dropdown 'Versi' pilih "Versi baru" (New version) > Klik "Terapkan" (Deploy).
 * 7. Selesai! Dua tab (Rekap_KPI_Harian dan Data_Karyawan) akan otomatis dibuat dan dikelola.
 */

const SHEET_REKAP_NAME = "Rekap_KPI_Harian";
const SHEET_KARYAWAN_NAME = "Data_Karyawan";

// Header Kolom untuk Rekap Mutaba'ah KPI Harian
const HEADERS_REKAP = [
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

// Header Kolom untuk Master Data Karyawan & Kredensial PIN
const HEADERS_KARYAWAN = [
  "NIK",
  "Nama Lengkap",
  "Divisi SPPG Cileungsi 30",
  "Jabatan / Posisi",
  "L/P",
  "PIN",
  "Status PIN",
  "Status Karyawan",
  "Terakhir Diperbarui"
];

// 28 Data Master Karyawan SPPG Cileungsi 30 (Otomatis dibuat jika sheet masih kosong)
const SEED_KARYAWAN = [
  ["SPPG-001", "Ust. Muhammad Ridwan, S.Gz", "Unit Gizi & Quality Control", "Koordinator SPPG", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-002", "Nurul Aini, A.Md.Gz", "Unit Gizi & Quality Control", "Quality Control & Dietisien", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-003", "Fatimah Azzahra, S.Tr.Gz", "Unit Gizi & Quality Control", "Nutrisionis", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-004", "Ahmad Fauzi (Chef Fauzi)", "Juru Masak (Dapur Utama)", "Head Cook", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-005", "Budi Santoso", "Juru Masak (Dapur Utama)", "Cook Lauk Hewani", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-006", "Hendra Wijaya", "Juru Masak (Dapur Utama)", "Cook Sayur & Nabati", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-007", "Siti Masitoh", "Juru Masak (Dapur Utama)", "Cook Nasi & Karbohidrat", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-008", "Agus Supriyadi", "Juru Masak (Dapur Utama)", "Cook Tambahan", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-009", "Rahmat Hidayat", "Persiapan Bahan (Prep Cook)", "Prep Bahan Segar", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-010", "Dewi Kurniasih", "Persiapan Bahan (Prep Cook)", "Pemotongan & Pencucian Sayur", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-011", "Sri Wahyuni", "Persiapan Bahan (Prep Cook)", "Pembersihan Unggas & Ikan", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-012", "Ilham Ramadhan", "Persiapan Bahan (Prep Cook)", "Penimbangan Bumbu & Marinasi", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-013", "Annisa Rahmawati", "Pengemasan & Pemorsian (Packing)", "Leader Packing", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-014", "Dina Novitasari", "Pengemasan & Pemorsian (Packing)", "Penimbangan Porsi", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-015", "Rina Marlina", "Pengemasan & Pemorsian (Packing)", "Sealer & Quality Pack", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-016", "Yuliana Sari", "Pengemasan & Pemorsian (Packing)", "Labeling & Kontrol Suhu", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-017", "Mega Puspita", "Pengemasan & Pemorsian (Packing)", "Pengepakan Box Distribusi", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-018", "Bambang Irawan", "Distribusi & Pengiriman (Logistik)", "Driver Rute 1 (Cileungsi Barat)", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-019", "Danu Prayoga", "Distribusi & Pengiriman (Logistik)", "Driver Rute 2 (Cileungsi Timur)", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-020", "Fajar Prasetyo", "Distribusi & Pengiriman (Logistik)", "Driver Rute 3 (Kawasan Sekolah)", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-021", "Wahyu Triyono", "Distribusi & Pengiriman (Logistik)", "Asisten Logistik", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-022", "Supardi", "Sanitasi, Pencucian & Kebersihan", "Leader Sanitasi & Dishwashing", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-023", "Titin Sumarni", "Sanitasi, Pencucian & Kebersihan", "Pencucian Alat Masak Besar", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-024", "Mulyadi", "Sanitasi, Pencucian & Kebersihan", "Sanitasi Ruang Dapur & Limbah", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-025", "Endang Suhendar", "Sanitasi, Pencucian & Kebersihan", "Sterilisasi Ombreng/Tray", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-026", "Lilis Suryani, S.Ak", "Administrasi & Pengadaan Gudang", "Staf Administrasi & Kasir", "P", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-027", "Dedi Kusnadi", "Administrasi & Pengadaan Gudang", "Pengelola Gudang Kering & Dingin", "L", "2026", "Belum Ganti", "Aktif"],
  ["SPPG-028", "Zulfikar Ali", "Administrasi & Pengadaan Gudang", "Purchasing Bahan Pangan", "L", "2026", "Belum Ganti", "Aktif"]
];

// Helper: Setup Sheet Rekapitulasi KPI
function setupRekapSheetIfNeeded(ss) {
  let sheet = ss.getSheetByName(SHEET_REKAP_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_REKAP_NAME);
    sheet.getRange(1, 1, 1, HEADERS_REKAP.length).setValues([HEADERS_REKAP]);
    const hr = sheet.getRange(1, 1, 1, HEADERS_REKAP.length);
    hr.setBackground("#064E3B"); // Emerald Green
    hr.setFontColor("#FFFFFF");
    hr.setFontWeight("bold");
    hr.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Helper: Setup Sheet Master Data Karyawan & PIN
function setupKaryawanSheetIfNeeded(ss) {
  let sheet = ss.getSheetByName(SHEET_KARYAWAN_NAME);
  const nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_KARYAWAN_NAME);
    sheet.getRange(1, 1, 1, HEADERS_KARYAWAN.length).setValues([HEADERS_KARYAWAN]);
    const hr = sheet.getRange(1, 1, 1, HEADERS_KARYAWAN.length);
    hr.setBackground("#1E3A8A"); // Royal Navy Blue
    hr.setFontColor("#FFFFFF");
    hr.setFontWeight("bold");
    hr.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // Format kolom PIN sebagai Plain Text agar angka '0' di depan tidak hilang
    sheet.getRange("F:F").setNumberFormat("@");

    // Tulis data 28 karyawan awal
    const rowsToAdd = SEED_KARYAWAN.map(k => [...k, nowStr]);
    sheet.getRange(2, 1, rowsToAdd.length, HEADERS_KARYAWAN.length).setValues(rowsToAdd);
  }
  return sheet;
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER POST: Kirim KPI, Update PIN, atau Tambah Karyawan Baru
// ═══════════════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let rawContent = e.postData ? e.postData.contents : "{}";
    let payload = JSON.parse(rawContent);
    const action = payload.action || 'SUBMIT_KPI';
    const nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // ── 1. AKSI: UPDATE PIN KARYAWAN ──
    if (action === 'UPDATE_PIN') {
      const sheetKaryawan = setupKaryawanSheetIfNeeded(ss);
      const nikTarget = String(payload.nik || '').trim().toUpperCase();
      const newPin = String(payload.pin || '').trim();

      if (!nikTarget || !newPin) {
        return createJsonResponse({ status: "error", message: "NIK dan PIN baru wajib diisi" });
      }

      const data = sheetKaryawan.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim().toUpperCase() === nikTarget) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow > 0) {
        // Kolom F = PIN, Kolom G = Status PIN, Kolom I = Terakhir Update
        sheetKaryawan.getRange(foundRow, 6).setValue("'" + newPin); // Set sebagai plain text
        sheetKaryawan.getRange(foundRow, 7).setValue("Sudah Ganti");
        sheetKaryawan.getRange(foundRow, 9).setValue(nowStr);
        return createJsonResponse({ status: "success", message: "PIN berhasil diperbarui di spreadsheet", nik: nikTarget });
      } else {
        // Jika NIK belum ada, tambahkan baris baru
        sheetKaryawan.appendRow([
          nikTarget,
          payload.nama || "Karyawan Baru",
          payload.divisi || "SPPG Cileungsi 30",
          "Staf SPPG",
          "L",
          "'" + newPin,
          "Sudah Ganti",
          "Aktif",
          nowStr
        ]);
        return createJsonResponse({ status: "success", message: "Karyawan baru dan PIN ditambahkan ke spreadsheet", nik: nikTarget });
      }
    }

    // ── 2. AKSI: SIMPAN / UPDATE KPI HARIAN ──
    const sheetRekap = setupRekapSheetIfNeeded(ss);
    setupKaryawanSheetIfNeeded(ss); // Pastikan sheet karyawan juga ada
    let item = payload.data || payload;

    if (!item.nik || !item.tanggal) {
      return createJsonResponse({ status: "error", message: "NIK dan Tanggal wajib diisi" });
    }

    const docId = item.docId || (item.nik + "_" + item.tanggal);

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
      (item.tilawah ? item.tilawah + " Lembar" : "0"),
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

    const values = sheetRekap.getDataRange().getValues();
    let rowIndexToUpdate = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === docId) {
        rowIndexToUpdate = i + 1;
        break;
      }
    }

    if (rowIndexToUpdate > 0) {
      sheetRekap.getRange(rowIndexToUpdate, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheetRekap.appendRow(rowData);
    }

    return createJsonResponse({ status: "success", docId: docId });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER GET: Mengambil Data Rekap KPI atau Master Karyawan
// ═══════════════════════════════════════════════════════════════════════════
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupRekapSheetIfNeeded(ss);
    const sheetKaryawan = setupKaryawanSheetIfNeeded(ss);

    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'GET_REKAP';

    // ── 1. AMBIL MASTER DATA KARYAWAN & STATUS PIN ──
    if (action === 'GET_KARYAWAN') {
      const dataKaryawan = sheetKaryawan.getDataRange().getValues();
      const rosterList = [];

      for (let i = 1; i < dataKaryawan.length; i++) {
        const row = dataKaryawan[i];
        if (!row[0]) continue;
        rosterList.push({
          nik: String(row[0]).trim(),
          nama: String(row[1] || '').trim(),
          divisi: String(row[2] || '').trim(),
          role: String(row[3] || 'Staf SPPG').trim(),
          jenisKelamin: String(row[4] || 'L').trim(),
          pin: String(row[5] || '2026').trim(),
          pinChanged: String(row[6] || '').toLowerCase().includes('sudah'),
          status: String(row[7] || 'Aktif').trim(),
          updatedAt: row[8] ? Utilities.formatDate(new Date(row[8]), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss") : ""
        });
      }

      return createJsonResponse({ status: "success", count: rosterList.length, data: rosterList });
    }

    // ── 2. AMBIL DATA REKAPITULASI KPI UNTUK DASHBOARD ──
    const sheetRekap = setupRekapSheetIfNeeded(ss);
    const data = sheetRekap.getDataRange().getValues();

    if (data.length <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }

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

    return createJsonResponse({ status: "success", data: rows });

  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
