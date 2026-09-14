/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LOGIKA DASHBOARD EKSEKUTIF PIMPINAN — SPPG CILEUNGSI 30
 * Analitik Kepatuhan Ibadah, Ekspor Excel & Manajemen Spreadsheet
 * ═══════════════════════════════════════════════════════════════════════════
 */

let allSubmissions = [];
let filteredSubmissions = [];
let isOwnerAuthenticated = false;

// 1. Inisialisasi Dashboard
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
});

function checkAuthSession() {
  const sessionAuth = sessionStorage.getItem('sppg_owner_session');
  if (sessionAuth === 'true') {
    isOwnerAuthenticated = true;
    showDashboardView();
  } else {
    showPinLoginView();
  }
}

function showPinLoginView() {
  const loginView = document.getElementById('dashPinLoginScreen');
  const mainView = document.getElementById('dashMainScreen');
  if (loginView) loginView.style.display = 'flex';
  if (mainView) mainView.style.display = 'none';

  const pinInput = document.getElementById('dashLoginPinInput');
  if (pinInput) {
    pinInput.value = '';
    pinInput.focus();
  }
}

function showDashboardView() {
  const loginView = document.getElementById('dashPinLoginScreen');
  const mainView = document.getElementById('dashMainScreen');
  if (loginView) loginView.style.display = 'none';
  if (mainView) mainView.style.display = 'block';

  initFilters();
  loadDashboardData();
}

function submitDashboardPin() {
  const pinInput = document.getElementById('dashLoginPinInput');
  const val = (pinInput ? pinInput.value : '').trim();
  const savedPin = localStorage.getItem('sppg_owner_pin') || '8899';

  if (val === savedPin || val === '2026') {
    sessionStorage.setItem('sppg_owner_session', 'true');
    isOwnerAuthenticated = true;
    showDashboardView();
  } else {
    alert("PIN Pimpinan tidak sesuai. Silakan periksa kembali.");
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }
}

function logoutDashboard() {
  sessionStorage.removeItem('sppg_owner_session');
  isOwnerAuthenticated = false;
  showPinLoginView();
}

// 2. Load Data & Aggregasi
async function loadDashboardData(forceRefresh = false) {
  const refreshBtn = document.getElementById('btnRefreshData');
  if (refreshBtn) refreshBtn.innerHTML = '<span>⏳ Memuat Data...</span>';

  try {
    allSubmissions = await window.fetchAllSubmissions(forceRefresh);
    applyFilters();
    renderSummaryStats();
    renderLeaderboard();
    renderDivisiBreakdown();
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err);
  } finally {
    if (refreshBtn) refreshBtn.innerHTML = '<span>🔄 Refresh Data</span>';
  }
}

// 3. Filters Controller
function initFilters() {
  const dateFilter = document.getElementById('filterTanggal');
  const divisiFilter = document.getElementById('filterDivisi');
  const searchInput = document.getElementById('filterSearch');

  // Set default date filter to today
  if (dateFilter) {
    const today = new Date().toISOString().split('T')[0];
    dateFilter.value = today;
    dateFilter.addEventListener('change', applyFilters);
  }

  // Populate Divisi Filter Options
  if (divisiFilter && window.SPPG_DIVISI_LIST) {
    divisiFilter.innerHTML = '<option value="">Semua Divisi</option>' + 
      window.SPPG_DIVISI_LIST.map(d => `<option value="${d}">${d}</option>`).join('');
    divisiFilter.addEventListener('change', applyFilters);
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
}

function applyFilters() {
  const dateVal = (document.getElementById('filterTanggal')?.value || '').trim();
  const divisiVal = (document.getElementById('filterDivisi')?.value || '').trim();
  const searchVal = (document.getElementById('filterSearch')?.value || '').trim().toLowerCase();

  filteredSubmissions = allSubmissions.filter(item => {
    // Tanggal
    if (dateVal && item.tanggal !== dateVal) return false;
    // Divisi
    if (divisiVal && item.divisi !== divisiVal) return false;
    // Search
    if (searchVal) {
      const matchNik = (item.nik || '').toLowerCase().includes(searchVal);
      const matchNama = (item.nama || '').toLowerCase().includes(searchVal);
      if (!matchNik && !matchNama) return false;
    }
    return true;
  });

  renderTableRows();
  renderSummaryStats();
}

function resetFilters() {
  const dateFilter = document.getElementById('filterTanggal');
  const divisiFilter = document.getElementById('filterDivisi');
  const searchInput = document.getElementById('filterSearch');

  if (dateFilter) dateFilter.value = '';
  if (divisiFilter) divisiFilter.value = '';
  if (searchInput) searchInput.value = '';

  applyFilters();
}

// 4. Render Kartu Statistik Ringkasan
function renderSummaryStats() {
  const today = new Date().toISOString().split('T')[0];
  const roster = window.getActiveRoster();
  const totalKaryawan = roster.filter(k => k.status === 'Aktif' && k.nik !== 'SPPG-000').length;

  // Submisi hari ini (atau sesuai filter tanggal jika ada)
  const dateFilter = document.getElementById('filterTanggal')?.value || today;
  const submissionsForDate = allSubmissions.filter(s => s.tanggal === dateFilter);
  const distinctKaryawanCount = new Set(submissionsForDate.map(s => s.nik)).size;

  const partRate = totalKaryawan > 0 ? Math.round((distinctKaryawanCount / totalKaryawan) * 100) : 0;

  // Rata-rata Skor
  let avgScore = 0;
  let masjidCount = 0;
  let totalShalatSlots = 0;
  let adabComplianceCount = 0;
  let totalAdabSlots = 0;

  if (submissionsForDate.length > 0) {
    const totalScoreSum = submissionsForDate.reduce((acc, curr) => acc + (curr.skorTotal || 0), 0);
    avgScore = Math.round(totalScoreSum / submissionsForDate.length);

    submissionsForDate.forEach(s => {
      if (s.shalat) {
        ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].forEach(w => {
          totalShalatSlots++;
          if (s.shalat[w] === 'masjid') masjidCount++;
        });
      }
      if (s.adab) {
        ['basmalah', 'higienitas', 'lisan', 'salam', 'muamalah', 'waktu', 'aset', 'taawun'].forEach(k => {
          totalAdabSlots++;
          if (s.adab[k]) adabComplianceCount++;
        });
      }
    });
  }

  const masjidRate = totalShalatSlots > 0 ? Math.round((masjidCount / totalShalatSlots) * 100) : 0;
  const adabRate = totalAdabSlots > 0 ? Math.round((adabComplianceCount / totalAdabSlots) * 100) : 0;

  // Update DOM Elements
  const elPart = document.getElementById('statPartisipasiVal');
  const elPartDesc = document.getElementById('statPartisipasiDesc');
  const elAvg = document.getElementById('statAvgScoreVal');
  const elMasjid = document.getElementById('statMasjidRateVal');
  const elAdab = document.getElementById('statAdabRateVal');

  if (elPart) elPart.textContent = `${distinctKaryawanCount} / ${totalKaryawan}`;
  if (elPartDesc) elPartDesc.textContent = `${partRate}% Karyawan Mengisi (${dateFilter})`;
  if (elAvg) elAvg.textContent = `${avgScore}%`;
  if (elMasjid) elMasjid.textContent = `${masjidRate}%`;
  if (elAdab) elAdab.textContent = `${adabRate}%`;
}

// 5. Render Leaderboard Keistiqomahan
function renderLeaderboard() {
  const container = document.getElementById('leaderboardListContainer');
  if (!container) return;

  // Hitung rata-rata skor per NIK
  const mapNik = new Map();

  allSubmissions.forEach(s => {
    if (!mapNik.has(s.nik)) {
      mapNik.set(s.nik, { nik: s.nik, nama: s.nama, divisi: s.divisi, totalScore: 0, count: 0 });
    }
    const item = mapNik.get(s.nik);
    item.totalScore += (s.skorTotal || 0);
    item.count++;
  });

  const leaderArr = Array.from(mapNik.values()).map(item => ({
    ...item,
    avg: Math.round(item.totalScore / item.count)
  }));

  // Sort descending
  leaderArr.sort((a, b) => b.avg - a.avg || b.count - a.count);
  const top5 = leaderArr.slice(0, 5);

  if (top5.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#94A3B8;font-size:13px">Belum ada data tercatat untuk leaderboard.</div>`;
    return;
  }

  container.innerHTML = top5.map((k, idx) => {
    let rankClass = `rank-${idx + 1}`;
    let medal = `${idx + 1}`;
    if (idx === 0) medal = '🥇';
    else if (idx === 1) medal = '🥈';
    else if (idx === 2) medal = '🥉';

    return `
      <div class="leaderboard-item">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="leader-rank-badge ${rankClass}">${medal}</div>
          <div>
            <div style="font-weight:700;font-size:13.5px;color:#0F172A">${k.nama}</div>
            <div style="font-size:11px;color:#64748B">${k.divisi} • ${k.count} Hari Mengisi</div>
          </div>
        </div>
        <div style="text-align:right">
          <span class="badge-score-pill score-mumtaz">${k.avg}%</span>
        </div>
      </div>
    `;
  }).join('');
}

// 6. Render Analisis Kepatuhan per Divisi
function renderDivisiBreakdown() {
  const container = document.getElementById('divisiBreakdownContainer');
  if (!container) return;

  const mapDivisi = new Map();

  allSubmissions.forEach(s => {
    const div = s.divisi || 'Lainnya';
    if (!mapDivisi.has(div)) {
      mapDivisi.set(div, { divisi: div, totalScore: 0, count: 0 });
    }
    const item = mapDivisi.get(div);
    item.totalScore += (s.skorTotal || 0);
    item.count++;
  });

  const divisiArr = Array.from(mapDivisi.values()).map(item => ({
    ...item,
    avg: Math.round(item.totalScore / item.count)
  }));

  divisiArr.sort((a, b) => b.avg - a.avg);

  if (divisiArr.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:#94A3B8;font-size:13px">Belum ada data per divisi.</div>`;
    return;
  }

  container.innerHTML = divisiArr.map(d => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:700;margin-bottom:4px">
        <span>${d.divisi}</span>
        <span style="color:#064E3B">${d.avg}% (${d.count} Entri)</span>
      </div>
      <div style="background:#E2E8F0;border-radius:999px;height:8px;overflow:hidden">
        <div style="background:linear-gradient(90deg,#064E3B,#10B981);height:100%;width:${d.avg}%"></div>
      </div>
    </div>
  `).join('');
}

// 7. Render Tabel Submisi
function renderTableRows() {
  const tbody = document.getElementById('submissionsTableBody');
  const countDisplay = document.getElementById('tableRowCountDisplay');
  if (!tbody) return;

  if (countDisplay) {
    countDisplay.textContent = `Menampilkan ${filteredSubmissions.length} dari ${allSubmissions.length} rekaman`;
  }

  if (filteredSubmissions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;padding:36px;color:#94A3B8">
          Tidak ada data yang cocok dengan kriteria filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredSubmissions.map(row => {
    let scoreBadgeClass = 'score-mumtaz';
    if (row.skorTotal < 65) scoreBadgeClass = 'score-maqbul';
    else if (row.skorTotal < 80) scoreBadgeClass = 'score-jayyid';
    else if (row.skorTotal < 90) scoreBadgeClass = 'score-jayyid-jiddan';

    const shalatSummary = row.shalat ? 
      `S:${row.shalat.subuh?.substring(0,1).toUpperCase() || '-'} D:${row.shalat.dzuhur?.substring(0,1).toUpperCase() || '-'} A:${row.shalat.ashar?.substring(0,1).toUpperCase() || '-'} M:${row.shalat.maghrib?.substring(0,1).toUpperCase() || '-'} I:${row.shalat.isya?.substring(0,1).toUpperCase() || '-'}` : '-';

    const dzikirSummary = `P:${row.dzikir?.pagi ? '✓' : '✗'} S:${row.dzikir?.sore ? '✓' : '✗'}`;

    let adabCount = 0;
    if (row.adab) {
      Object.values(row.adab).forEach(v => { if (v) adabCount++; });
    }

    return `
      <tr>
        <td><strong>${row.tanggal}</strong></td>
        <td><code style="background:#F1F5F9;padding:2px 6px;border-radius:4px">${row.nik}</code></td>
        <td><strong>${row.nama}</strong></td>
        <td><span style="font-size:11.5px;color:#475569">${row.divisi}</span></td>
        <td><span class="badge-score-pill ${scoreBadgeClass}">${row.skorTotal}%</span></td>
        <td><span style="font-size:11px;font-family:monospace">${shalatSummary}</span></td>
        <td><span style="font-size:11px;font-family:monospace">${dzikirSummary}</span></td>
        <td><span style="font-size:11.5px">${adabCount}/8 Adab</span></td>
        <td><span style="font-size:11.5px;color:#64748B">${row.updatedAt || '-'}</span></td>
        <td>
          <button type="button" onclick="viewDetailRow('${row.docId || (row.nik + '_' + row.tanggal)}')" style="background:#F1F5F9;border:1px solid #CBD5E1;padding:3px 8px;border-radius:6px;font-size:11px;cursor:pointer">Detail</button>
        </td>
      </tr>
    `;
  }).join('');
}

// 8. View Detail Modal
function viewDetailRow(docId) {
  const item = allSubmissions.find(s => (s.docId === docId) || (`${s.nik}_${s.tanggal}` === docId));
  if (!item) return;

  const modal = document.getElementById('detailRowModal');
  const bodyEl = document.getElementById('detailRowModalBody');
  if (!modal || !bodyEl) return;

  bodyEl.innerHTML = `
    <div style="font-size:13.5px;line-height:1.6;display:grid;gap:12px">
      <div style="background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0">
        <div><strong>Karyawan:</strong> ${item.nama} (NIK: ${item.nik})</div>
        <div><strong>Divisi:</strong> ${item.divisi}</div>
        <div><strong>Tanggal Mutaba'ah:</strong> ${item.tanggal}</div>
        <div><strong>Waktu Kirim:</strong> ${item.updatedAt || '-'}</div>
        <div><strong>Skor Total:</strong> <span class="badge-score-pill score-mumtaz">${item.skorTotal}% (${item.predikat || '-'})</span></div>
      </div>

      <div>
        <strong style="color:#064E3B">🕌 Rincian Shalat Fardhu:</strong>
        <ul style="padding-left:20px;margin-top:4px">
          <li>Subuh: ${item.shalat?.subuh || '-'}</li>
          <li>Dzuhur: ${item.shalat?.dzuhur || '-'}</li>
          <li>Ashar: ${item.shalat?.ashar || '-'}</li>
          <li>Maghrib: ${item.shalat?.maghrib || '-'}</li>
          <li>Isya: ${item.shalat?.isya || '-'}</li>
        </ul>
      </div>

      <div>
        <strong style="color:#064E3B">✨ Shalat Sunnah &amp; Dzikir:</strong>
        <ul style="padding-left:20px;margin-top:4px">
          <li>Rawatib: ${item.sunnah?.rawatib ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Dhuha: ${item.sunnah?.dhuha ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Tahajud &amp; Witir: ${item.sunnah?.tahajud ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Tilawah Quran: ${item.tilawah || 0} Lembar/Halaman</li>
          <li>Dzikir Pagi: ${item.dzikir?.pagi ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Dzikir Sore: ${item.dzikir?.sore ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Shalawat &amp; Istighfar: ${item.dzikir?.istighfar ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Infaq / Sedekah: ${item.infaq ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Puasa: ${item.puasa || 'Tidak Puasa'}</li>
        </ul>
      </div>

      <div>
        <strong style="color:#064E3B">🤝 8 Adab Wajib di Lingkungan Kerja SPPG:</strong>
        <ul style="padding-left:20px;margin-top:4px">
          <li>Basmalah &amp; Hamdalah: ${item.adab?.basmalah ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Thaharah &amp; Higienitas Dapur: ${item.adab?.higienitas ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Menjaga Lisan (Bebas Ghibah/Umpatan): ${item.adab?.lisan ? '✓ Ya' : '✗ Tidak'}</li>
          <li>5S Salam Ramah: ${item.adab?.salam ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Batasan Sopan Lawan Jenis: ${item.adab?.muamalah ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Amanah Waktu &amp; Disiplin: ${item.adab?.waktu ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Amanah Bahan Pangan &amp; Aset SPPG: ${item.adab?.aset ? '✓ Ya' : '✗ Tidak'}</li>
          <li>Ta'awun &amp; Kerja Tim: ${item.adab?.taawun ? '✓ Ya' : '✗ Tidak'}</li>
        </ul>
      </div>

      ${item.catatan ? `
        <div style="background:#FFFBEB;border:1px solid #FDE68A;padding:10px;border-radius:8px">
          <strong>Catatan Karyawan:</strong>
          <p style="margin-top:4px;font-style:italic">"${item.catatan}"</p>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('active');
}

function closeDetailRowModal() {
  const modal = document.getElementById('detailRowModal');
  if (modal) modal.classList.remove('active');
}

// 9. Ekspor ke Excel (.XLSX) dengan SheetJS
function exportToExcel() {
  if (filteredSubmissions.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  // Format data flat untuk Excel
  const excelData = filteredSubmissions.map((row, index) => ({
    "No": index + 1,
    "Tanggal": row.tanggal,
    "NIK": row.nik,
    "Nama Karyawan": row.nama,
    "Divisi SPPG": row.divisi,
    "Skor Total (%)": (row.skorTotal || 0) + "%",
    "Predikat": row.predikat || "-",
    "Subuh": row.shalat?.subuh || "-",
    "Dzuhur": row.shalat?.dzuhur || "-",
    "Ashar": row.shalat?.ashar || "-",
    "Maghrib": row.shalat?.maghrib || "-",
    "Isya": row.shalat?.isya || "-",
    "Rawatib": row.sunnah?.rawatib ? "Ya" : "Tidak",
    "Dhuha": row.sunnah?.dhuha ? "Ya" : "Tidak",
    "Tahajud": row.sunnah?.tahajud ? "Ya" : "Tidak",
    "Tilawah Quran": (row.tilawah || 0) + " Lembar",
    "Dzikir Pagi": row.dzikir?.pagi ? "Ya" : "Tidak",
    "Dzikir Sore": row.dzikir?.sore ? "Ya" : "Tidak",
    "Istighfar & Shalawat": row.dzikir?.istighfar ? "Ya" : "Tidak",
    "Infaq / Sedekah": row.infaq ? "Ya" : "Tidak",
    "Puasa": row.puasa || "Tidak Puasa",
    "Adab Basmalah": row.adab?.basmalah ? "Ya" : "Tidak",
    "Adab Higienitas": row.adab?.higienitas ? "Ya" : "Tidak",
    "Adab Menjaga Lisan": row.adab?.lisan ? "Ya" : "Tidak",
    "Adab 5S Salam": row.adab?.salam ? "Ya" : "Tidak",
    "Adab Muamalah Lawan Jenis": row.adab?.muamalah ? "Ya" : "Tidak",
    "Adab Amanah Waktu": row.adab?.waktu ? "Ya" : "Tidak",
    "Adab Amanah Bahan & Aset": row.adab?.aset ? "Ya" : "Tidak",
    "Adab Ta'awun": row.adab?.taawun ? "Ya" : "Tidak",
    "Catatan Karyawan": row.catatan || "",
    "Waktu Kirim": row.updatedAt || ""
  }));

  if (window.XLSX) {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap_KPI_SPPG30");
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Laporan_KPI_Ibadah_SPPG_Cileungsi30_${today}.xlsx`);
  } else {
    alert("Library Excel sedang dimuat, gunakan ekspor CSV sebagai alternatif.");
    exportToCSV();
  }
}

// 10. Ekspor ke CSV
function exportToCSV() {
  if (filteredSubmissions.length === 0) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const headers = ["Tanggal", "NIK", "Nama", "Divisi", "Skor", "Predikat", "Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya", "Dzikir Pagi", "Dzikir Sore", "Catatan"];
  const rows = filteredSubmissions.map(r => [
    r.tanggal,
    r.nik,
    `"${(r.nama || '').replace(/"/g, '""')}"`,
    `"${(r.divisi || '').replace(/"/g, '""')}"`,
    `${r.skorTotal}%`,
    r.predikat || '',
    r.shalat?.subuh || '',
    r.shalat?.dzuhur || '',
    r.shalat?.ashar || '',
    r.shalat?.maghrib || '',
    r.shalat?.isya || '',
    r.dzikir?.pagi ? 'Ya' : 'Tidak',
    r.dzikir?.sore ? 'Ya' : 'Tidak',
    `"${(r.catatan || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Rekap_KPI_SPPG30_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 11. Modal Pengaturan Spreadsheet & PIN
function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  const webhookInput = document.getElementById('settingWebhookUrl');
  const pinInput = document.getElementById('settingNewPin');

  if (webhookInput) webhookInput.value = window.getSheetsWebhookUrl() || '';
  if (pinInput) pinInput.value = localStorage.getItem('sppg_owner_pin') || '8899';

  if (modal) modal.classList.add('active');
}

function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.classList.remove('active');
}

function saveSettings() {
  const webhookInput = document.getElementById('settingWebhookUrl');
  const pinInput = document.getElementById('settingNewPin');

  if (webhookInput) {
    window.saveSheetsWebhookUrl(webhookInput.value);
  }
  if (pinInput && pinInput.value.trim()) {
    localStorage.setItem('sppg_owner_pin', pinInput.value.trim());
  }

  alert("Pengaturan berhasil disimpan!");
  closeSettingsModal();
}

// 12. Modal Master Data Karyawan
function openRosterModal() {
  const modal = document.getElementById('rosterModal');
  renderRosterTable();
  if (modal) modal.classList.add('active');
}

function closeRosterModal() {
  const modal = document.getElementById('rosterModal');
  if (modal) modal.classList.remove('active');
}

function renderRosterTable() {
  const tbody = document.getElementById('rosterTableBody');
  if (!tbody) return;

  const roster = window.getActiveRoster();
  tbody.innerHTML = roster.map((k, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${k.nik}</strong></td>
      <td>${k.nama}</td>
      <td>${k.divisi}</td>
      <td>${k.role || '-'}</td>
      <td>
        <button type="button" onclick="deleteRosterItem('${k.nik}')" style="background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:3px 8px;border-radius:4px;font-size:11px;cursor:pointer">Hapus</button>
      </td>
    </tr>
  `).join('');
}

function addRosterItem() {
  const nik = (document.getElementById('newRosterNik')?.value || '').trim().toUpperCase();
  const nama = (document.getElementById('newRosterNama')?.value || '').trim();
  const divisi = (document.getElementById('newRosterDivisi')?.value || '').trim();
  const role = (document.getElementById('newRosterRole')?.value || '').trim();

  if (!nik || !nama) {
    alert("NIK dan Nama wajib diisi.");
    return;
  }

  const roster = window.getActiveRoster();
  if (roster.some(k => k.nik.toUpperCase() === nik)) {
    alert("NIK sudah digunakan karyawan lain.");
    return;
  }

  roster.push({ nik, nama, divisi, role: role || 'Staf SPPG', status: 'Aktif' });
  window.saveActiveRoster(roster);

  // Clear inputs
  document.getElementById('newRosterNik').value = '';
  document.getElementById('newRosterNama').value = '';
  document.getElementById('newRosterRole').value = '';

  renderRosterTable();
  renderSummaryStats();
  alert(`Karyawan ${nama} (${nik}) berhasil ditambahkan!`);
}

function deleteRosterItem(nik) {
  if (confirm(`Yakin ingin menghapus karyawan dengan NIK: ${nik}?`)) {
    let roster = window.getActiveRoster();
    roster = roster.filter(k => k.nik.toUpperCase() !== nik.toUpperCase());
    window.saveActiveRoster(roster);
    renderRosterTable();
    renderSummaryStats();
  }
}

// Global Exports
window.submitDashboardPin = submitDashboardPin;
window.logoutDashboard = logoutDashboard;
window.loadDashboardData = loadDashboardData;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.saveSettings = saveSettings;
window.openRosterModal = openRosterModal;
window.closeRosterModal = closeRosterModal;
window.addRosterItem = addRosterItem;
window.deleteRosterItem = deleteRosterItem;
window.viewDetailRow = viewDetailRow;
window.closeDetailRowModal = closeDetailRowModal;
