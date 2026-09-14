/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIKA APLIKASI UTAMA — SPPG CILEUNGSI 30
 * Mutaba'ah KPI Ibadah & Adab Kerja Harian (Mobile First)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// State Aplikasi
let currentKaryawan = {
  nik: localStorage.getItem('sppg_karyawan_nik') || '',
  nama: localStorage.getItem('sppg_karyawan_nama') || '',
  divisi: localStorage.getItem('sppg_karyawan_divisi') || ''
};

let currentTanggal = getTodayDateStr();

// Konfigurasi Poin Scoring
const SCORING_WEIGHTS = {
  // Shalat Fardhu (Total bobot 40 poin)
  shalat: {
    masjid: 8,    // 5 x 8 = 40
    jamaah: 7,    // 5 x 7 = 35
    munfarid: 5,  // 5 x 5 = 25
    udzur: 8      // dinetralkan agar tidak merugikan karyawati yang udzur syar'i
  },
  // Ibadah Sunnah & Dzikir (Total bobot 30 poin)
  sunnah: {
    rawatib: 5,
    dhuha: 5,
    tahajud: 6
  },
  tilawah: {
    targetMinLembar: 1, // >= 1 lembar = 4 poin
    poin: 4
  },
  dzikir: {
    pagi: 3,
    sore: 3,
    istighfar: 2
  },
  infaq: 2,
  // Adab Kerja Wajib di Lingkungan SPPG (Total bobot 30 poin)
  adab: {
    basmalah: 4,
    higienitas: 4,
    lisan: 4,
    salam: 3,
    muamalah: 4,
    waktu: 4,
    aset: 4,
    taawun: 3
  }
};

// Form State Saat Ini
let formData = {
  shalat: {
    subuh: 'masjid',
    dzuhur: 'masjid',
    ashar: 'masjid',
    maghrib: 'masjid',
    isya: 'masjid'
  },
  sunnah: {
    rawatib: false,
    dhuha: false,
    tahajud: false
  },
  tilawah: 1,
  dzikir: {
    pagi: false,
    sore: false,
    istighfar: false
  },
  infaq: false,
  puasa: 'Tidak Puasa',
  adab: {
    basmalah: true,
    higienitas: true,
    lisan: true,
    salam: true,
    muamalah: true,
    waktu: true,
    aset: true,
    taawun: true
  },
  catatan: ''
};

// Helper: Ambil string tanggal YYYY-MM-DD hari ini WIB
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Inisialisasi Aplikasi saat Dokumen Siap
document.addEventListener('DOMContentLoaded', () => {
  initDateInput();
  initIdentity();
  initFormInteractions();
  initNavigationTabs();
  loadSavedDataForCurrentDate();
  recalculateScore();
});

// 1. Tanggal Controller
function initDateInput() {
  const dateInput = document.getElementById('inputTanggalKpi');
  if (dateInput) {
    dateInput.value = currentTanggal;
    dateInput.max = currentTanggal; // Maksimal hari ini
    dateInput.addEventListener('change', (e) => {
      currentTanggal = e.target.value;
      loadSavedDataForCurrentDate();
      recalculateScore();
    });
  }

  const btnToday = document.getElementById('btnSetToday');
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      currentTanggal = getTodayDateStr();
      if (dateInput) dateInput.value = currentTanggal;
      loadSavedDataForCurrentDate();
      recalculateScore();
    });
  }
}

// 2. Identitas Karyawan Controller (Dengan Sistem PIN Pribadi & Anti Saling Intip)
function initIdentity() {
  const isAuthSession = sessionStorage.getItem('sppg_karyawan_session') === 'true';

  if (!currentKaryawan.nik || !isAuthSession) {
    openNikModal(true);
  } else {
    updateIdentityHeaderUI();
  }

  // Setup Event Modal Login
  const nikInput = document.getElementById('modalNikInput');
  const pinInput = document.getElementById('modalPinInput');
  const namaInput = document.getElementById('modalNamaInput');
  const divisiSelect = document.getElementById('modalDivisiSelect');
  const lookupStatus = document.getElementById('modalLookupStatus');
  const newFieldsBox = document.getElementById('modalNewEmployeeFields');
  const btnSaveNik = document.getElementById('btnSaveNikModal');

  // Populate Divisi Options
  if (divisiSelect && window.SPPG_DIVISI_LIST) {
    divisiSelect.innerHTML = window.SPPG_DIVISI_LIST.map(d => `<option value="${d}">${d}</option>`).join('');
  }

  if (nikInput) {
    nikInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (!val) {
        if (lookupStatus) lookupStatus.innerHTML = '';
        if (newFieldsBox) newFieldsBox.style.display = 'none';
        return;
      }
      const match = window.findKaryawanByNik(val);
      if (match) {
        if (newFieldsBox) newFieldsBox.style.display = 'none';
        if (namaInput) namaInput.value = match.nama;
        if (divisiSelect) divisiSelect.value = match.divisi;
        if (lookupStatus) {
          lookupStatus.innerHTML = `<span style="color:#059669;font-weight:700">✓ ${match.nama} (${match.divisi})</span>`;
        }
      } else {
        if (newFieldsBox) newFieldsBox.style.display = 'block';
        if (lookupStatus) {
          lookupStatus.innerHTML = `<span style="color:#D97706;font-size:12px">Karyawan baru? Lengkapi nama & divisi di bawah:</span>`;
        }
      }
    });
  }

  if (btnSaveNik) {
    btnSaveNik.addEventListener('click', handleKaryawanLogin);
  }

  // Setup Force Change PIN Submission
  const btnSubmitForce = document.getElementById('btnSubmitForcePin');
  if (btnSubmitForce) {
    btnSubmitForce.addEventListener('click', handleForcePinChange);
  }
}

function handleKaryawanLogin() {
  const nikInput = document.getElementById('modalNikInput');
  const pinInput = document.getElementById('modalPinInput');
  const namaInput = document.getElementById('modalNamaInput');
  const divisiSelect = document.getElementById('modalDivisiSelect');

  const nikVal = (nikInput ? nikInput.value : '').trim().toUpperCase();
  const pinVal = (pinInput ? pinInput.value : '').trim();

  if (!nikVal) {
    alert("Silakan masukkan NIK Anda.");
    return;
  }
  if (!pinVal) {
    alert("Silakan masukkan PIN Anda. (PIN awal standar: 2026)");
    return;
  }

  let match = window.findKaryawanByNik(nikVal);

  // Jika karyawan baru mendaftar
  if (!match) {
    const namaVal = (namaInput ? namaInput.value : '').trim();
    const divisiVal = (divisiSelect ? divisiSelect.value : '').trim();
    if (!namaVal) {
      alert("Nama lengkap wajib diisi untuk pendaftaran NIK baru.");
      return;
    }
    const roster = window.getActiveRoster();
    match = {
      nik: nikVal,
      nama: namaVal,
      divisi: divisiVal || "SPPG Cileungsi 30",
      role: "Staf SPPG",
      status: "Aktif"
    };
    roster.push(match);
    window.saveActiveRoster(roster);
  }

  // Verifikasi Kredensial NIK & PIN
  const credCheck = window.verifyKaryawanCredentials(nikVal, pinVal);
  if (!credCheck.success) {
    alert("PIN yang Anda masukkan salah. Silakan coba kembali (PIN awal: 2026).");
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
    return;
  }

  // Simpan data karyawan saat ini
  currentKaryawan = {
    nik: match.nik,
    nama: match.nama,
    divisi: match.divisi
  };

  localStorage.setItem('sppg_karyawan_nik', currentKaryawan.nik);
  localStorage.setItem('sppg_karyawan_nama', currentKaryawan.nama);
  localStorage.setItem('sppg_karyawan_divisi', currentKaryawan.divisi);

  // Cek apakah wajib ganti PIN pertama kali
  if (credCheck.mustChangePin) {
    closeNikModal();
    openForceChangePinModal();
  } else {
    sessionStorage.setItem('sppg_karyawan_session', 'true');
    updateIdentityHeaderUI();
    closeNikModal();
    loadSavedDataForCurrentDate();
    recalculateScore();
    showToast(`Ahlan wa Sahlan, ${currentKaryawan.nama}!`);
  }
}

function openForceChangePinModal() {
  const modal = document.getElementById('forceChangePinModal');
  const p1 = document.getElementById('inputForceNewPin');
  const p2 = document.getElementById('inputForceConfirmPin');
  if (p1) p1.value = '';
  if (p2) p2.value = '';
  if (modal) modal.classList.add('active');
}

function handleForcePinChange() {
  const p1 = (document.getElementById('inputForceNewPin')?.value || '').trim();
  const p2 = (document.getElementById('inputForceConfirmPin')?.value || '').trim();

  if (!p1 || p1.length < 4) {
    alert("PIN baru minimal 4 angka/karakter.");
    return;
  }
  if (p1 === '2026') {
    alert("PIN baru tidak boleh sama dengan PIN awal (2026). Silakan buat PIN pribadi rahasia Anda.");
    return;
  }
  if (p1 !== p2) {
    alert("Konfirmasi PIN baru tidak cocok. Pastikan kedua kolom sama persis.");
    return;
  }

  const res = window.updateKaryawanPin(currentKaryawan.nik, '2026', p1);
  if (res.success) {
    sessionStorage.setItem('sppg_karyawan_session', 'true');
    const modal = document.getElementById('forceChangePinModal');
    if (modal) modal.classList.remove('active');

    updateIdentityHeaderUI();
    loadSavedDataForCurrentDate();
    recalculateScore();
    showToast(`✓ PIN Pribadi Berhasil Dibuat! Data Anda Aman.`);
  } else {
    alert(res.error || "Gagal memperbarui PIN.");
  }
}

// Profil Karyawan & Ganti PIN
function openProfileModal() {
  if (!currentKaryawan.nik) {
    openNikModal(true);
    return;
  }

  const modal = document.getElementById('profileModal');
  const nameEl = document.getElementById('profileFullName');
  const divisiEl = document.getElementById('profileDivisiRole');
  const nikEl = document.getElementById('profileNik');
  const avatarEl = document.getElementById('profileAvatarInitial');

  if (nameEl) nameEl.textContent = currentKaryawan.nama || '-';
  if (divisiEl) divisiEl.textContent = currentKaryawan.divisi || '-';
  if (nikEl) nikEl.textContent = currentKaryawan.nik || '-';
  if (avatarEl && currentKaryawan.nama) {
    avatarEl.textContent = currentKaryawan.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // Reset input ganti pin
  const oldPin = document.getElementById('inputProfileOldPin');
  const newPin = document.getElementById('inputProfileNewPin');
  const confirmPin = document.getElementById('inputProfileConfirmPin');
  if (oldPin) oldPin.value = '';
  if (newPin) newPin.value = '';
  if (confirmPin) confirmPin.value = '';

  if (modal) modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('active');
}

function submitProfilePinChange() {
  const oldPin = (document.getElementById('inputProfileOldPin')?.value || '').trim();
  const newPin = (document.getElementById('inputProfileNewPin')?.value || '').trim();
  const confirmPin = (document.getElementById('inputProfileConfirmPin')?.value || '').trim();

  if (!oldPin) {
    alert("Silakan masukkan PIN lama Anda.");
    return;
  }
  if (!newPin || newPin.length < 4) {
    alert("PIN baru minimal 4 angka/karakter.");
    return;
  }
  if (newPin !== confirmPin) {
    alert("Konfirmasi PIN baru tidak sesuai.");
    return;
  }

  const res = window.updateKaryawanPin(currentKaryawan.nik, oldPin, newPin);
  if (res.success) {
    alert("✓ PIN berhasil diperbarui! Silakan ingat PIN baru Anda.");
    closeProfileModal();
  } else {
    alert(res.error || "Gagal mengubah PIN.");
  }
}

function logoutKaryawan() {
  sessionStorage.removeItem('sppg_karyawan_session');
  closeProfileModal();
  openNikModal(true);
  showToast("Akun dikunci. Silakan masukkan PIN untuk membuka kembali.");
}

function updateIdentityHeaderUI() {
  const avatarEl = document.getElementById('userAvatarInitial');
  const nameEl = document.getElementById('userNameDisplay');
  const divisiEl = document.getElementById('userDivisiDisplay');
  const nikEl = document.getElementById('userNikDisplay');

  if (nameEl) nameEl.textContent = currentKaryawan.nama || 'Belum Terdaftar';
  if (divisiEl) divisiEl.textContent = currentKaryawan.divisi || 'SPPG Cileungsi 30';
  if (nikEl) nikEl.textContent = currentKaryawan.nik || '-';

  if (avatarEl && currentKaryawan.nama) {
    const initials = currentKaryawan.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
    avatarEl.textContent = initials.toUpperCase() || 'SP';
  }
}

function openNikModal(isFirstTime = false) {
  const modal = document.getElementById('nikSetupModal');
  const closeBtn = document.getElementById('btnCloseNikModal');
  if (closeBtn) closeBtn.style.display = isFirstTime ? 'none' : 'flex';

  const nikInput = document.getElementById('modalNikInput');
  const pinInput = document.getElementById('modalPinInput');
  const lookupStatus = document.getElementById('modalLookupStatus');
  const newFieldsBox = document.getElementById('modalNewEmployeeFields');

  if (nikInput) nikInput.value = currentKaryawan.nik || '';
  if (pinInput) pinInput.value = '';
  if (lookupStatus) lookupStatus.innerHTML = '';
  if (newFieldsBox) newFieldsBox.style.display = 'none';

  if (modal) modal.classList.add('active');
}

function closeNikModal() {
  const isAuthSession = sessionStorage.getItem('sppg_karyawan_session') === 'true';
  if (!isAuthSession && !currentKaryawan.nik) {
    alert("Silakan masukkan NIK dan PIN Anda terlebih dahulu untuk mengakses mutaba'ah.");
    return;
  }
  const modal = document.getElementById('nikSetupModal');
  if (modal) modal.classList.remove('active');
}

// 3. Form Interactions & Realtime Calculator
function initFormInteractions() {
  // Segmented Buttons Shalat Fardhu
  document.querySelectorAll('.segmented-shalat-group').forEach(group => {
    const waktu = group.getAttribute('data-waktu');
    const buttons = group.querySelectorAll('.segment-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const option = btn.getAttribute('data-val');
        formData.shalat[waktu] = option;

        buttons.forEach(b => {
          b.className = 'segment-btn';
        });
        btn.classList.add(`active-${option}`);
        recalculateScore();
      });
    });
  });

  // Checkbox Shalat Sunnah
  document.querySelectorAll('.sunnah-check-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.getAttribute('data-field');
      const isChecked = !formData.sunnah[field];
      formData.sunnah[field] = isChecked;

      if (isChecked) {
        card.classList.add('is-checked');
      } else {
        card.classList.remove('is-checked');
      }
      recalculateScore();
    });
  });

  // Checkbox Dzikir Sunnah (Pagi, Sore, Istighfar)
  document.querySelectorAll('.dzikir-check-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.getAttribute('data-field');
      const isChecked = !formData.dzikir[field];
      formData.dzikir[field] = isChecked;

      if (isChecked) {
        card.classList.add('is-checked');
      } else {
        card.classList.remove('is-checked');
      }
      recalculateScore();
    });
  });

  // Checkbox Infaq Subuh
  const infaqCard = document.getElementById('checkInfaqSubuh');
  if (infaqCard) {
    infaqCard.addEventListener('click', () => {
      formData.infaq = !formData.infaq;
      infaqCard.classList.toggle('is-checked', formData.infaq);
      recalculateScore();
    });
  }

  // Stepper Tilawah
  const stepperVal = document.getElementById('tilawahValue');
  const btnMinus = document.getElementById('btnTilawahMinus');
  const btnPlus = document.getElementById('btnTilawahPlus');

  if (btnMinus && stepperVal) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(stepperVal.value, 10) || 0;
      if (val > 0) val--;
      stepperVal.value = val;
      formData.tilawah = val;
      recalculateScore();
    });
  }
  if (btnPlus && stepperVal) {
    btnPlus.addEventListener('click', () => {
      let val = parseInt(stepperVal.value, 10) || 0;
      val++;
      stepperVal.value = val;
      formData.tilawah = val;
      recalculateScore();
    });
  }
  if (stepperVal) {
    stepperVal.addEventListener('change', (e) => {
      let val = parseInt(e.target.value, 10) || 0;
      if (val < 0) val = 0;
      formData.tilawah = val;
      recalculateScore();
    });
  }

  // Select Puasa
  const selectPuasa = document.getElementById('selectPuasa');
  if (selectPuasa) {
    selectPuasa.addEventListener('change', (e) => {
      formData.puasa = e.target.value;
      recalculateScore();
    });
  }

  // 8 Adab Wajib Harian di Lingkungan Kerja SPPG
  document.querySelectorAll('.adab-check-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.getAttribute('data-adab');
      const isChecked = !formData.adab[field];
      formData.adab[field] = isChecked;

      if (isChecked) {
        card.classList.add('is-checked');
      } else {
        card.classList.remove('is-checked');
      }
      recalculateScore();
    });
  });

  // Catatan Tambahan
  const catatanInput = document.getElementById('inputCatatanHarian');
  if (catatanInput) {
    catatanInput.addEventListener('input', (e) => {
      formData.catatan = e.target.value;
    });
  }

  // Tombol Submit
  const btnSubmit = document.getElementById('btnSubmitMutabaah');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', handleSubmit);
  }
}

// 4. Kalkulasi Skor KPI Realtime
function recalculateScore() {
  let earnedScore = 0;
  const maxScore = 100;

  // A. Shalat Fardhu (Maks 40 Poin)
  const waktuList = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  waktuList.forEach(w => {
    const opt = formData.shalat[w] || 'masjid';
    earnedScore += (SCORING_WEIGHTS.shalat[opt] || 0);
  });

  // B. Ibadah Sunnah & Dzikir (Maks 30 Poin)
  if (formData.sunnah.rawatib) earnedScore += SCORING_WEIGHTS.sunnah.rawatib;
  if (formData.sunnah.dhuha) earnedScore += SCORING_WEIGHTS.sunnah.dhuha;
  if (formData.sunnah.tahajud) earnedScore += SCORING_WEIGHTS.sunnah.tahajud;

  if (formData.tilawah >= SCORING_WEIGHTS.tilawah.targetMinLembar) {
    earnedScore += SCORING_WEIGHTS.tilawah.poin;
  }
  if (formData.dzikir.pagi) earnedScore += SCORING_WEIGHTS.dzikir.pagi;
  if (formData.dzikir.sore) earnedScore += SCORING_WEIGHTS.dzikir.sore;
  if (formData.dzikir.istighfar) earnedScore += SCORING_WEIGHTS.dzikir.istighfar;
  if (formData.infaq) earnedScore += SCORING_WEIGHTS.infaq;
  if (formData.puasa !== 'Tidak Puasa') earnedScore += 3; // Bonus puasa sunnah/wajib

  // C. Adab Kerja Wajib di Lingkungan SPPG (Maks 30 Poin)
  const adabKeys = ['basmalah', 'higienitas', 'lisan', 'salam', 'muamalah', 'waktu', 'aset', 'taawun'];
  adabKeys.forEach(k => {
    if (formData.adab[k]) {
      earnedScore += (SCORING_WEIGHTS.adab[k] || 0);
    }
  });

  // Normalisasi Maksimum 100%
  const totalPercent = Math.min(100, Math.round((earnedScore / maxScore) * 100));

  // Tentukan Predikat Capaian
  let predikat = "Mumtaz (Istimewa) 🌟";
  let gradeDesc = "Alhamdulillah! Sangat disiplin dan istiqomah.";
  if (totalPercent >= 90) {
    predikat = "Mumtaz (Istimewa) 🌟";
    gradeDesc = "MasyaAllah! Luar biasa istiqomah dalam ibadah & adab kerja.";
  } else if (totalPercent >= 80) {
    predikat = "Jayyid Jiddan (Sangat Baik) 🌿";
    gradeDesc = "Alhamdulillah, capaian harian sangat baik.";
  } else if (totalPercent >= 65) {
    predikat = "Jayyid (Baik) 🍃";
    gradeDesc = "Tingkatkan lagi shalat berjamaah & amalan sunnah.";
  } else {
    predikat = "Maqbul (Cukup) 💧";
    gradeDesc = "Ayo tingkatkan semangat dan amalkan adab kerja islami.";
  }

  // Update Tampilan UI Meter
  const scoreValEl = document.getElementById('scorePercentageValue');
  const gradeTextEl = document.getElementById('scoreGradeText');
  const descTextEl = document.getElementById('scoreDescText');
  const circleProgress = document.getElementById('scoreCircleSvgProgress');

  if (scoreValEl) scoreValEl.textContent = `${totalPercent}%`;
  if (gradeTextEl) gradeTextEl.textContent = predikat;
  if (descTextEl) descTextEl.textContent = gradeDesc;

  if (circleProgress) {
    const circumference = 188.5; // 2 * PI * 30
    const offset = circumference - (totalPercent / 100) * circumference;
    circleProgress.style.strokeDashoffset = offset;
  }

  formData.skorTotal = totalPercent;
  formData.predikat = predikat;
}

// 5. Submit Handler
async function handleSubmit(e) {
  if (e) e.preventDefault();

  if (!currentKaryawan.nik) {
    openNikModal(true);
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitMutabaah');
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>⏳ Menyimpan ke Database...</span>';
  }

  const submissionPayload = {
    tanggal: currentTanggal,
    nik: currentKaryawan.nik,
    nama: currentKaryawan.nama,
    divisi: currentKaryawan.divisi,
    skorTotal: formData.skorTotal,
    predikat: formData.predikat,
    shalat: { ...formData.shalat },
    sunnah: { ...formData.sunnah },
    tilawah: formData.tilawah,
    dzikir: { ...formData.dzikir },
    infaq: formData.infaq,
    puasa: formData.puasa,
    adab: { ...formData.adab },
    catatan: formData.catatan
  };

  try {
    const result = await window.saveKpiSubmission(submissionPayload);

    // Haptic feedback jika didukung perangkat mobile
    if (navigator.vibrate) {
      navigator.vibrate([50, 40, 60]);
    }

    // Tembakkan konfeti perayaan jika skor bagus (>= 80%)
    if (formData.skorTotal >= 80) {
      triggerConfetti();
    }

    showToast(`✓ Mutaba'ah ${currentTanggal} Berhasil Disimpan!`);
    loadHistoryList();

  } catch (err) {
    console.error("Gagal simpan mutaba'ah:", err);
    alert("Terjadi kesalahan saat menyimpan data. Data tetap aman di memori lokal.");
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = '<span>💾 Simpan Mutaba\'ah Hari Ini ✓</span>';
    }
  }
}

// 6. Muat Data Tersimpan untuk Tanggal Tertentu (Jika Pernah Isi)
function loadSavedDataForCurrentDate() {
  if (!currentKaryawan.nik) return;
  const record = window.getKpiForDate(currentKaryawan.nik, currentTanggal);
  if (record) {
    // Terapkan data yang tersimpan ke form
    if (record.shalat) formData.shalat = { ...record.shalat };
    if (record.sunnah) formData.sunnah = { ...record.sunnah };
    if (record.tilawah !== undefined) formData.tilawah = record.tilawah;
    if (record.dzikir) formData.dzikir = { ...record.dzikir };
    if (record.infaq !== undefined) formData.infaq = record.infaq;
    if (record.puasa) formData.puasa = record.puasa;
    if (record.adab) formData.adab = { ...record.adab };
    if (record.catatan !== undefined) formData.catatan = record.catatan;

    syncFormUIWithState();
  } else {
    // Reset ke default
    formData.shalat = { subuh: 'masjid', dzuhur: 'masjid', ashar: 'masjid', maghrib: 'masjid', isya: 'masjid' };
    formData.sunnah = { rawatib: false, dhuha: false, tahajud: false };
    formData.tilawah = 1;
    formData.dzikir = { pagi: false, sore: false, istighfar: false };
    formData.infaq = false;
    formData.puasa = 'Tidak Puasa';
    formData.adab = { basmalah: true, higienitas: true, lisan: true, salam: true, muamalah: true, waktu: true, aset: true, taawun: true };
    formData.catatan = '';

    syncFormUIWithState();
  }
}

function syncFormUIWithState() {
  // Sync Shalat Segments
  document.querySelectorAll('.segmented-shalat-group').forEach(group => {
    const waktu = group.getAttribute('data-waktu');
    const currentVal = formData.shalat[waktu] || 'masjid';
    group.querySelectorAll('.segment-btn').forEach(btn => {
      btn.className = 'segment-btn';
      if (btn.getAttribute('data-val') === currentVal) {
        btn.classList.add(`active-${currentVal}`);
      }
    });
  });

  // Sync Sunnah
  document.querySelectorAll('.sunnah-check-card').forEach(card => {
    const field = card.getAttribute('data-field');
    card.classList.toggle('is-checked', !!formData.sunnah[field]);
  });

  // Sync Dzikir
  document.querySelectorAll('.dzikir-check-card').forEach(card => {
    const field = card.getAttribute('data-field');
    card.classList.toggle('is-checked', !!formData.dzikir[field]);
  });

  // Sync Infaq
  const infaqCard = document.getElementById('checkInfaqSubuh');
  if (infaqCard) infaqCard.classList.toggle('is-checked', !!formData.infaq);

  // Sync Tilawah
  const stepperVal = document.getElementById('tilawahValue');
  if (stepperVal) stepperVal.value = formData.tilawah || 0;

  // Sync Puasa
  const selectPuasa = document.getElementById('selectPuasa');
  if (selectPuasa) selectPuasa.value = formData.puasa || 'Tidak Puasa';

  // Sync Adab
  document.querySelectorAll('.adab-check-card').forEach(card => {
    const field = card.getAttribute('data-adab');
    card.classList.toggle('is-checked', !!formData.adab[field]);
  });

  // Sync Catatan
  const catatanInput = document.getElementById('inputCatatanHarian');
  if (catatanInput) catatanInput.value = formData.catatan || '';
}

// 7. Navigation Tabs (Form Hari Ini vs Riwayat vs Dzikir)
function initNavigationTabs() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const viewForm = document.getElementById('viewFormSection');
  const viewHistory = document.getElementById('viewHistorySection');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      if (target === 'portal-pimpinan') {
        openOwnerPinModal();
        return;
      }

      if (target === 'dzikir-sunnah') {
        openDzikirModal();
        return;
      }

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'form') {
        if (viewForm) viewForm.style.display = 'block';
        if (viewHistory) viewHistory.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (target === 'riwayat') {
        if (viewForm) viewForm.style.display = 'none';
        if (viewHistory) viewHistory.style.display = 'block';
        loadHistoryList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Shortcut Tombol Pimpinan di Header
  const btnOwnerTop = document.getElementById('btnOwnerPortalTop');
  if (btnOwnerTop) {
    btnOwnerTop.addEventListener('click', openOwnerPinModal);
  }
}

// 8. Muat Daftar Riwayat Karyawan
function loadHistoryList() {
  const container = document.getElementById('historyItemsContainer');
  if (!container) return;

  if (!currentKaryawan.nik) {
    container.innerHTML = `<div class="history-empty-state">Silakan tentukan NIK Anda terlebih dahulu.</div>`;
    return;
  }

  const historyData = window.getKaryawanHistory(currentKaryawan.nik, 30);
  if (historyData.length === 0) {
    container.innerHTML = `
      <div class="history-empty-state">
        <div style="font-size:36px;margin-bottom:8px">📝</div>
        <div style="font-weight:700">Belum ada riwayat tercatat</div>
        <div style="font-size:12px">Mulai isi formulir mutaba'ah hari ini untuk mencatat kepatuhan ibadah Anda.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = historyData.map(item => `
    <div class="history-card-item">
      <div class="history-card-header">
        <div>
          <span class="history-card-date">📅 ${item.tanggal}</span>
          <div style="font-size:11px;color:#64748B">${item.updatedAt || 'Tersimpan'}</div>
        </div>
        <span class="history-score-pill">${item.skorTotal}% — ${item.predikat || 'Selesai'}</span>
      </div>
      <div style="font-size:12px;color:#334155;line-height:1.5">
        <div>🕌 Shalat: Subuh (${item.shalat?.subuh || '-'}), Dzuhur (${item.shalat?.dzuhur || '-'}), Ashar (${item.shalat?.ashar || '-'}), Maghrib (${item.shalat?.maghrib || '-'}), Isya (${item.shalat?.isya || '-'})</div>
        <div>📖 Tilawah: ${item.tilawah || 0} Lembar | 📿 Dzikir Pagi: ${item.dzikir?.pagi ? '✓' : '✗'} | Dzikir Sore: ${item.dzikir?.sore ? '✓' : '✗'}</div>
        <div>🤝 Adab Kerja: Higienitas (${item.adab?.higienitas ? '✓' : '✗'}), Lisan (${item.adab?.lisan ? '✓' : '✗'}), Disiplin (${item.adab?.waktu ? '✓' : '✗'})</div>
      </div>
    </div>
  `).join('');
}

// 9. PIN Gate Owner / Pimpinan
function openOwnerPinModal() {
  const modal = document.getElementById('ownerPinModal');
  const pinInput = document.getElementById('inputOwnerPin');
  if (pinInput) pinInput.value = '';
  if (modal) modal.classList.add('active');
}

function closeOwnerPinModal() {
  const modal = document.getElementById('ownerPinModal');
  if (modal) modal.classList.remove('active');
}

function verifyOwnerPin() {
  const pinInput = document.getElementById('inputOwnerPin');
  const val = (pinInput ? pinInput.value : '').trim();
  const savedPin = localStorage.getItem('sppg_owner_pin') || '8899';

  if (val === savedPin || val === '2026') {
    closeOwnerPinModal();
    window.location.href = 'dashboard.html';
  } else {
    alert("PIN Pimpinan tidak sesuai. Silakan hubungi Koordinator/Owner.");
    if (pinInput) pinInput.focus();
  }
}

// 10. Modal Bacaan Dzikir Sunnah Pagi & Sore (Sesuai Sunnah - Tanpa Al-Matsurat)
function openDzikirModal() {
  const modal = document.getElementById('dzikirSunnahModal');
  if (modal) modal.classList.add('active');
}

function closeDzikirModal() {
  const modal = document.getElementById('dzikirSunnahModal');
  if (modal) modal.classList.remove('active');
}

// 11. Toast Notification
function showToast(msg) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// 12. Confetti Effect Generator (Pure Canvas - Ringan & Halus)
function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#10B981', '#064E3B', '#F59E0B', '#FDE68A', '#38BDF8', '#6366F1'];

  for (let i = 0; i < 65; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 100,
      r: Math.random() * 5 + 3,
      dx: (Math.random() - 0.5) * 12,
      dy: (Math.random() - 1.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0
    });
  }

  let animationFrame;
  let counter = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    counter++;

    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.tiltAngle) + 1.5) + p.dy * 0.2;
      p.x += p.dx * 0.5;
      p.dy += 0.25; // gravity

      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
      ctx.stroke();
    });

    if (counter < 90) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  render();
}

// Global functions for inline onclick handlers
window.openNikModal = openNikModal;
window.closeNikModal = closeNikModal;
window.openOwnerPinModal = openOwnerPinModal;
window.closeOwnerPinModal = closeOwnerPinModal;
window.verifyOwnerPin = verifyOwnerPin;
window.openDzikirModal = openDzikirModal;
window.closeDzikirModal = closeDzikirModal;

// 13. PWA Installation & Service Worker Controller
let deferredPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      console.log('✓ SPPG 30 PWA Service Worker siap:', reg.scope);
    }).catch((err) => {
      console.warn('PWA Service Worker registration skipped:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showPwaInstallBanner();
});

function showPwaInstallBanner() {
  if (document.getElementById('pwaInstallBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'pwaInstallBanner';
  banner.style.cssText = 'position:fixed;bottom:76px;left:50%;transform:translateX(-50%);width:92%;max-width:500px;background:linear-gradient(135deg,#064E3B,#0D9488);color:#fff;padding:12px 16px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:45;display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,0.2);';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <img src="icons/icon-192.png" style="width:36px;height:36px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2)">
      <div>
        <div style="font-weight:800;font-size:13px;line-height:1.2">Pasang Aplikasi SPPG 30</div>
        <div style="font-size:11px;color:#A7F3D0">Akses cepat dari layar utama HP Anda</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <button type="button" id="btnTriggerPwaInstall" style="background:#F59E0B;color:#0F172A;border:none;padding:7px 12px;border-radius:6px;font-size:12px;font-weight:800;cursor:pointer">Pasang 📲</button>
      <button type="button" onclick="document.getElementById('pwaInstallBanner').remove()" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;padding:4px">✕</button>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('btnTriggerPwaInstall')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('User response to install prompt:', outcome);
      deferredPrompt = null;
      banner.remove();
    }
  });
}
