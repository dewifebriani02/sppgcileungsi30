/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MASTER ROSTER KARYAWAN — SPPG CILEUNGSI 30
 * Satuan Pelayanan Pemenuhan Gizi (SPPG) Cileungsi 30
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Daftar Divisi Resmi di SPPG Cileungsi 30
const SPPG_DIVISI_LIST = [
  "Unit Gizi & Quality Control",
  "Juru Masak (Dapur Utama)",
  "Persiapan Bahan (Prep Cook)",
  "Pengemasan & Pemorsian (Packing)",
  "Distribusi & Pengiriman (Logistik)",
  "Sanitasi, Pencucian & Kebersihan",
  "Administrasi & Pengadaan Gudang",
  "Koordinator & Pimpinan Unit"
];

// Data Awal Karyawan SPPG Cileungsi 30 (Dapat ditambah/diedit via LocalStorage / Dashboard)
const DEFAULT_KARYAWAN_ROSTER = [
  // --- Koordinator & Unit Gizi ---
  { nik: "SPPG-001", nama: "Ust. Muhammad Ridwan, S.Gz", divisi: "Unit Gizi & Quality Control", role: "Koordinator SPPG", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-002", nama: "Nurul Aini, A.Md.Gz", divisi: "Unit Gizi & Quality Control", role: "Quality Control & Dietisien", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-003", nama: "Fatimah Azzahra, S.Tr.Gz", divisi: "Unit Gizi & Quality Control", role: "Nutrisionis", jenisKelamin: "P", status: "Aktif" },

  // --- Juru Masak (Dapur Utama) ---
  { nik: "SPPG-004", nama: "Ahmad Fauzi (Chef Fauzi)", divisi: "Juru Masak (Dapur Utama)", role: "Head Cook", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-005", nama: "Budi Santoso", divisi: "Juru Masak (Dapur Utama)", role: "Cook Lauk Hewani", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-006", nama: "Hendra Wijaya", divisi: "Juru Masak (Dapur Utama)", role: "Cook Sayur & Nabati", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-007", nama: "Siti Masitoh", divisi: "Juru Masak (Dapur Utama)", role: "Cook Nasi & Karbohidrat", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-008", nama: "Agus Supriyadi", divisi: "Juru Masak (Dapur Utama)", role: "Cook Tambahan", jenisKelamin: "L", status: "Aktif" },

  // --- Persiapan Bahan (Prep Cook) ---
  { nik: "SPPG-009", nama: "Rahmat Hidayat", divisi: "Persiapan Bahan (Prep Cook)", role: "Prep Bahan Segar", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-010", nama: "Dewi Kurniasih", divisi: "Persiapan Bahan (Prep Cook)", role: "Pemotongan & Pencucian Sayur", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-011", nama: "Sri Wahyuni", divisi: "Persiapan Bahan (Prep Cook)", role: "Pembersihan Unggas & Ikan", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-012", nama: "Ilham Ramadhan", divisi: "Persiapan Bahan (Prep Cook)", role: "Penimbangan Bumbu & Marinasi", jenisKelamin: "L", status: "Aktif" },

  // --- Pengemasan & Pemorsian (Packing) ---
  { nik: "SPPG-013", nama: "Annisa Rahmawati", divisi: "Pengemasan & Pemorsian (Packing)", role: "Leader Packing", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-014", nama: "Dina Novitasari", divisi: "Pengemasan & Pemorsian (Packing)", role: "Penimbangan Porsi", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-015", nama: "Rina Marlina", divisi: "Pengemasan & Pemorsian (Packing)", role: "Sealer & Quality Pack", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-016", nama: "Yuliana Sari", divisi: "Pengemasan & Pemorsian (Packing)", role: "Labeling & Kontrol Suhu", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-017", nama: "Mega Puspita", divisi: "Pengemasan & Pemorsian (Packing)", role: "Pengepakan Box Distribusi", jenisKelamin: "P", status: "Aktif" },

  // --- Distribusi & Logistik ---
  { nik: "SPPG-018", nama: "Bambang Irawan", divisi: "Distribusi & Pengiriman (Logistik)", role: "Driver Rute 1 (Cileungsi Barat)", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-019", nama: "Danu Prayoga", divisi: "Distribusi & Pengiriman (Logistik)", role: "Driver Rute 2 (Cileungsi Timur)", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-020", nama: "Fajar Prasetyo", divisi: "Distribusi & Pengiriman (Logistik)", role: "Driver Rute 3 (Kawasan Sekolah)", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-021", nama: "Wahyu Triyono", divisi: "Distribusi & Pengiriman (Logistik)", role: "Asisten Logistik", jenisKelamin: "L", status: "Aktif" },

  // --- Sanitasi & Kebersihan ---
  { nik: "SPPG-022", nama: "Supardi", divisi: "Sanitasi, Pencucian & Kebersihan", role: "Leader Sanitasi & Dishwashing", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-023", nama: "Titin Sumarni", divisi: "Sanitasi, Pencucian & Kebersihan", role: "Pencucian Alat Masak Besar", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-024", nama: "Mulyadi", divisi: "Sanitasi, Pencucian & Kebersihan", role: "Sanitasi Ruang Dapur & Limbah", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-025", nama: "Endang Suhendar", divisi: "Sanitasi, Pencucian & Kebersihan", role: "Sterilisasi Ombreng/Tray", jenisKelamin: "L", status: "Aktif" },

  // --- Administrasi, Gudang & Kasir ---
  { nik: "SPPG-026", nama: "Lilis Suryani, S.Ak", divisi: "Administrasi & Pengadaan Gudang", role: "Staf Administrasi & Kasir", jenisKelamin: "P", status: "Aktif" },
  { nik: "SPPG-027", nama: "Dedi Kusnadi", divisi: "Administrasi & Pengadaan Gudang", role: "Pengelola Gudang Kering & Dingin", jenisKelamin: "L", status: "Aktif" },
  { nik: "SPPG-028", nama: "Zulfikar Ali", divisi: "Administrasi & Pengadaan Gudang", role: "Purchasing Bahan Pangan", jenisKelamin: "L", status: "Aktif" },

  // --- Akun Owner / Pengawas ---
  { nik: "SPPG-000", nama: "Owner / Pengawas Pimpinan", divisi: "Koordinator & Pimpinan Unit", role: "Pemilik & Pengawas Mutu", jenisKelamin: "L", status: "Aktif" }
];

// Inisialisasi Karyawan di LocalStorage jika belum ada
function getActiveRoster() {
  try {
    const stored = localStorage.getItem('sppg_master_roster');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal membaca roster dari localStorage, gunakan default:", e);
  }
  return DEFAULT_KARYAWAN_ROSTER;
}

function saveActiveRoster(roster) {
  try {
    localStorage.setItem('sppg_master_roster', JSON.stringify(roster));
    window.activeRoster = roster;
    return true;
  } catch (e) {
    console.error("Gagal menyimpan roster ke localStorage:", e);
    return false;
  }
}

// Helper: Cari Karyawan Berdasarkan NIK (Case-Insensitive & Whitespace Trimming)
function findKaryawanByNik(nik) {
  if (!nik) return null;
  const cleanNik = String(nik).trim().toUpperCase();
  const currentRoster = getActiveRoster();
  
  // 1. Cek kecocokan persis
  let found = currentRoster.find(k => k.nik.toUpperCase() === cleanNik);
  if (found) return found;

  // 2. Cek format angka saja (misal user hanya mengetik '1' atau '01' untuk 'SPPG-001')
  const numOnly = cleanNik.replace(/\D/g, '');
  if (numOnly) {
    found = currentRoster.find(k => {
      const kNum = k.nik.replace(/\D/g, '');
      return parseInt(kNum, 10) === parseInt(numOnly, 10);
    });
    if (found) return found;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// SISTEM PIN PRIBADI KARYAWAN & PROTEKSI PRIVASI (ANTI SALING INTIP)
// ═══════════════════════════════════════════════════════════════════════════
const DEFAULT_INITIAL_PIN = "2026";

function getKaryawanPinMap() {
  try {
    const raw = localStorage.getItem('sppg_karyawan_pins');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveKaryawanPinMap(map) {
  try {
    localStorage.setItem('sppg_karyawan_pins', JSON.stringify(map));
    return true;
  } catch (e) {
    return false;
  }
}

// Verifikasi Login NIK + PIN
function verifyKaryawanCredentials(nik, inputPin) {
  const karyawan = findKaryawanByNik(nik);
  if (!karyawan) {
    return { success: false, error: "NIK tidak terdaftar dalam roster SPPG." };
  }

  const cleanNik = karyawan.nik.toUpperCase();
  const cleanPin = String(inputPin || '').trim();
  const pinMap = getKaryawanPinMap();
  const pinEntry = pinMap[cleanNik] || { pin: DEFAULT_INITIAL_PIN, changed: false };

  if (cleanPin !== pinEntry.pin) {
    return { success: false, error: "PIN yang Anda masukkan salah." };
  }

  const mustChangePin = (!pinEntry.changed && pinEntry.pin === DEFAULT_INITIAL_PIN);

  return {
    success: true,
    mustChangePin: mustChangePin,
    karyawan: karyawan
  };
}

// Ubah PIN Karyawan
function updateKaryawanPin(nik, oldPin, newPin) {
  const cleanNik = String(nik).trim().toUpperCase();
  const cleanOld = String(oldPin || '').trim();
  const cleanNew = String(newPin || '').trim();

  if (cleanNew.length < 4) {
    return { success: false, error: "PIN baru minimal 4 karakter/angka." };
  }
  if (cleanNew === DEFAULT_INITIAL_PIN) {
    return { success: false, error: "PIN baru tidak boleh sama dengan PIN awal (2026)." };
  }

  const pinMap = getKaryawanPinMap();
  const pinEntry = pinMap[cleanNik] || { pin: DEFAULT_INITIAL_PIN, changed: false };

  // Verifikasi old pin
  if (cleanOld !== pinEntry.pin && pinEntry.changed) {
    return { success: false, error: "PIN lama tidak sesuai." };
  }

  pinMap[cleanNik] = {
    pin: cleanNew,
    changed: true,
    updatedAt: new Date().toISOString()
  };

  saveKaryawanPinMap(pinMap);
  return { success: true, message: "PIN berhasil diperbarui!" };
}

// Global Exports
window.SPPG_DIVISI_LIST = SPPG_DIVISI_LIST;
window.DEFAULT_KARYAWAN_ROSTER = DEFAULT_KARYAWAN_ROSTER;
window.getActiveRoster = getActiveRoster;
window.saveActiveRoster = saveActiveRoster;
window.findKaryawanByNik = findKaryawanByNik;
window.DEFAULT_INITIAL_PIN = DEFAULT_INITIAL_PIN;
window.verifyKaryawanCredentials = verifyKaryawanCredentials;
window.updateKaryawanPin = updateKaryawanPin;
window.getKaryawanPinMap = getKaryawanPinMap;
