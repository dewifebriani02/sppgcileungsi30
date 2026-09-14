/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GOOGLE SHEETS SYNC ENGINE — SPPG CILEUNGSI 30
 * Database Berbasis Google Spreadsheet via Google Apps Script Web App
 * ═══════════════════════════════════════════════════════════════════════════
 */

// URL Google Apps Script Web App Default Resmi SPPG Cileungsi 30
let DEFAULT_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwNGWey3fWQyMDRckUBnjqLwZPHu-q6tN39J-ZsojFdPywMpDIDkUiuHqejfGeoUf-G9Q/exec";

// Ambil URL Webhook aktif dari localStorage atau fallback default
function getSheetsWebhookUrl() {
  const localUrl = localStorage.getItem('sppg_sheets_webhook_url');
  if (localUrl && localUrl.trim()) return localUrl.trim();
  return DEFAULT_SHEETS_WEBHOOK_URL;
}

function saveSheetsWebhookUrl(url) {
  if (!url) {
    localStorage.removeItem('sppg_sheets_webhook_url');
  } else {
    localStorage.setItem('sppg_sheets_webhook_url', url.trim());
  }
}

// 1. Operasi Local Storage (Offline-First Cache)
function getLocalRecords() {
  try {
    const raw = localStorage.getItem('sppg_kpi_records');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Gagal baca data lokal:", e);
    return [];
  }
}

function saveLocalRecords(records) {
  try {
    localStorage.setItem('sppg_kpi_records', JSON.stringify(records));
    return true;
  } catch (e) {
    console.error("Gagal simpan data lokal:", e);
    return false;
  }
}

// 2. Simpan Catatan KPI Ibadah & Adab ke Google Spreadsheet
async function saveKpiSubmission(submission) {
  // Tambahkan timestamp & ID unik (Format: NIK_YYYY-MM-DD)
  const docId = `${submission.nik}_${submission.tanggal}`;
  submission.docId = docId;
  submission.updatedAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  // 1. Simpan ke LocalStorage seketika (Offline-First)
  const records = getLocalRecords();
  const existingIdx = records.findIndex(r => r.docId === docId || (r.nik === submission.nik && r.tanggal === submission.tanggal));
  
  if (existingIdx >= 0) {
    records[existingIdx] = submission;
  } else {
    records.unshift(submission);
  }
  saveLocalRecords(records);

  // 2. Kirim ke Google Spreadsheet jika Webhook URL sudah terisi
  const webhookUrl = getSheetsWebhookUrl();
  let sheetsSynced = false;
  let syncMessage = "Tersimpan di perangkat lokal";

  if (webhookUrl && webhookUrl.startsWith('https://script.google.com/')) {
    try {
      // Menggunakan fetch dengan mode no-cors / form payload agar bypass CORS Google Apps Script
      const payload = {
        action: 'SUBMIT_KPI',
        data: submission
      };

      // Catatan: Google Apps Script Web App memerlukan URL-encoded atau text plain untuk no-cors
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      sheetsSynced = true;
      syncMessage = "Tersinkron ke Google Spreadsheet ✓";
      console.log(`✓ Data ${docId} berhasil dikirim ke Google Spreadsheet.`);
    } catch (err) {
      console.warn("Gagal mengirim ke Google Sheets webhook (disimpan di antrian lokal):", err);
      enqueuePendingSync(submission);
      syncMessage = "Disimpan lokal (Antrian kirim saat online)";
    }
  } else {
    // Belum disetel webhook-nya, tetap aman di localStorage
    enqueuePendingSync(submission);
    syncMessage = "Tersimpan lokal (Belum setting link Spreadsheet)";
  }

  return { success: true, sheetsSynced, syncMessage, submission };
}

// 3. Antrian Sinkronisasi Tertunda (Pending Queue)
function enqueuePendingSync(submission) {
  try {
    let pending = JSON.parse(localStorage.getItem('sppg_pending_sync') || '[]');
    if (!pending.some(p => p.docId === submission.docId)) {
      pending.push(submission);
      localStorage.setItem('sppg_pending_sync', JSON.stringify(pending));
    }
  } catch (e) {}
}

async function syncPendingToSheets() {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) return;

  try {
    let pending = JSON.parse(localStorage.getItem('sppg_pending_sync') || '[]');
    if (pending.length === 0) return;

    console.log(`Menyinkronkan ${pending.length} data tertunda ke Google Spreadsheet...`);
    const remaining = [];

    for (const item of pending) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'SUBMIT_KPI', data: item })
        });
      } catch (e) {
        remaining.push(item);
      }
    }

    localStorage.setItem('sppg_pending_sync', JSON.stringify(remaining));
    if (remaining.length === 0) {
      console.log("✓ Semua data tertunda berhasil dikirim ke Google Spreadsheet!");
    }
  } catch (e) {
    console.warn("Error syncPendingToSheets:", e);
  }
}

// 4. Ambil Catatan Karyawan untuk Tanggal Tertentu
function getKpiForDate(nik, tanggal) {
  const records = getLocalRecords();
  return records.find(r => r.nik.toUpperCase() === String(nik).trim().toUpperCase() && r.tanggal === tanggal) || null;
}

// 5. Ambil Semua Riwayat Seorang Karyawan
function getKaryawanHistory(nik, limitCount = 30) {
  const records = getLocalRecords();
  const cleanNik = String(nik).trim().toUpperCase();
  const filtered = records.filter(r => r.nik.toUpperCase() === cleanNik);
  filtered.sort((a, b) => (b.tanggal > a.tanggal ? 1 : -1));
  return filtered.slice(0, limitCount);
}

// 6. Ambil Semua Catatan (Untuk Dashboard Owner)
async function fetchAllSubmissions(forceRefresh = false) {
  let localData = getLocalRecords();

  const webhookUrl = getSheetsWebhookUrl();
  if (forceRefresh && webhookUrl && webhookUrl.startsWith('https://script.google.com/')) {
    try {
      const response = await fetch(`${webhookUrl}?action=GET_ALL_KPI`);
      if (response.ok) {
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          // Gabungkan data dari Google Spreadsheet ke LocalStorage
          const mergedMap = new Map();
          localData.forEach(item => mergedMap.set(item.docId || `${item.nik}_${item.tanggal}`, item));
          result.data.forEach(item => mergedMap.set(item.docId || `${item.nik}_${item.tanggal}`, item));
          localData = Array.from(mergedMap.values());
          saveLocalRecords(localData);
          console.log(`✓ Berhasil memuat ${result.data.length} baris dari Google Spreadsheet.`);
        }
      }
    } catch (e) {
      console.warn("Gagal fetch dari Google Spreadsheet, menggunakan data lokal:", e);
    }
  }

  // Sort descending by tanggal & waktu
  localData.sort((a, b) => {
    if (b.tanggal !== a.tanggal) return b.tanggal > a.tanggal ? 1 : -1;
    return (b.updatedAt || '') > (a.updatedAt || '') ? 1 : -1;
  });

  return localData;
}

// 7. Sinkronisasi Update PIN ke Google Spreadsheet (Sheet: Data_Karyawan)
async function syncPinUpdateToSheets(nik, newPin, nama = '', divisi = '') {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    return { success: true, localOnly: true };
  }

  try {
    const payload = {
      action: 'UPDATE_PIN',
      nik: String(nik).trim().toUpperCase(),
      pin: String(newPin).trim(),
      nama: nama,
      divisi: divisi
    };

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    console.log(`✓ PIN ${nik} berhasil disinkronkan ke Google Spreadsheet (Data_Karyawan).`);
    return { success: true, synced: true };
  } catch (err) {
    console.warn("Gagal menyinkronkan PIN ke spreadsheet:", err);
    return { success: false, error: err };
  }
}

// 8. Tarik Master Karyawan & Status PIN dari Google Spreadsheet (Sheet: Data_Karyawan)
async function fetchRosterAndPinsFromSheets() {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) return null;

  try {
    const res = await fetch(`${webhookUrl}?action=GET_KARYAWAN`);
    if (!res.ok) return null;
    const json = await res.json();

    if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      // 1. Update master roster lokal
      const newRoster = json.data.map(k => ({
        nik: k.nik,
        nama: k.nama,
        divisi: k.divisi,
        role: k.role || 'Staf SPPG',
        jenisKelamin: k.jenisKelamin || 'L',
        status: k.status || 'Aktif'
      }));
      if (window.saveActiveRoster) {
        window.saveActiveRoster(newRoster);
      }

      // 2. Update pin map lokal
      if (window.getKaryawanPinMap && window.saveKaryawanPinMap) {
        const pinMap = window.getKaryawanPinMap() || {};
        json.data.forEach(k => {
          const cleanNik = String(k.nik).trim().toUpperCase();
          if (k.pin) {
            pinMap[cleanNik] = {
              pin: String(k.pin).trim(),
              changed: k.pinChanged || String(k.pin).trim() !== '2026',
              updatedAt: k.updatedAt || new Date().toISOString()
            };
          }
        });
        window.saveKaryawanPinMap(pinMap);
      }
      console.log(`✓ Sinkronisasi ${json.data.length} karyawan & PIN dari Google Spreadsheet berhasil.`);
      return json.data;
    }
  } catch (e) {
    console.warn("Sinkronisasi roster dari sheets dilewati (menggunakan data lokal):", e);
  }
  return null;
}

// Global exports
window.getSheetsWebhookUrl = getSheetsWebhookUrl;
window.saveSheetsWebhookUrl = saveSheetsWebhookUrl;
window.saveKpiSubmission = saveKpiSubmission;
window.getKpiForDate = getKpiForDate;
window.getKaryawanHistory = getKaryawanHistory;
window.fetchAllSubmissions = fetchAllSubmissions;
window.getLocalRecords = getLocalRecords;
window.saveLocalRecords = saveLocalRecords;
window.syncPendingToSheets = syncPendingToSheets;
window.syncPinUpdateToSheets = syncPinUpdateToSheets;
window.fetchRosterAndPinsFromSheets = fetchRosterAndPinsFromSheets;

// Auto-sync antrian jika online
window.addEventListener('online', () => {
  syncPendingToSheets();
  fetchRosterAndPinsFromSheets();
});
