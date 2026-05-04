// Data storage
let transaksiHariIni = JSON.parse(localStorage.getItem('transaksiHariIni')) || [];

// Kategori pengeluaran default + custom
let kategoriPengeluaran = JSON.parse(localStorage.getItem('kategoriPengeluaran')) || [
    'Bensin', 'Karyawan', 'Kopi', 'Karcis', 'Parkir', 'Makan', 'Pulsa', 'Lain-lain'
];

let riwayatMinggu = JSON.parse(localStorage.getItem('riwayatMinggu')) || [];

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    updateTanggal();
    loadTransaksi();
    updateSummary();
    updateRiwayat();
    updateWeekly();
    updateDropdownKategori(); // TAMBAHAN INI
});
// Update dropdown kategori
function updateDropdownKategori() {
    const select = document.getElementById('kategoriPengeluaran');
    select.innerHTML = '<option value="">Pilih kategori...</option>';
    
    kategoriPengeluaran.forEach(kategori => {
        const option = document.createElement('option');
        option.value = kategori;
        option.textContent = kategori;
        select.appendChild(option);
    });
}

// Event listener tombol tambah kategori
document.getElementById('tambahKategoriBtn').addEventListener('click', bukaModal);

// Modal functions
function bukaModal() {
    document.getElementById('modalTambahKategori').style.display = 'block';
    document.getElementById('kategoriBaru').focus();
}

function tutupModal() {
    document.getElementById('modalTambahKategori').style.display = 'none';
    document.getElementById('kategoriBaru').value = '';
}

function simpanKategoriBaru() {
    const namaBaru = document.getElementById('kategoriBaru').value.trim();
    if (namaBaru && !kategoriPengeluaran.includes(namaBaru)) {
        kategoriPengeluaran.push(namaBaru);
        localStorage.setItem('kategoriPengeluaran', JSON.stringify(kategoriPengeluaran));
        updateDropdownKategori();
        tutupModal();
        alert(`✅ Kategori "${namaBaru}" berhasil ditambahkan!`);
    } else if (kategoriPengeluaran.includes(namaBaru)) {
        alert('❌ Kategori sudah ada!');
    } else {
        alert('❌ Isi nama kategori!');
    }
}

// Tutup modal klik luar
window.onclick = function(event) {
    const modal = document.getElementById('modalTambahKategori');
    if (event.target == modal) {
        tutupModal();
    }
}

// Update tanggal
function updateTanggal() {
    const sekarang = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('tanggal').textContent = sekarang.toLocaleDateString('id-ID', options);
}

// Format Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Tab functionality
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Tambah Pembelian
function tambahPembelian() {
    const berat = parseFloat(document.getElementById('berat').value) || 0;
    const hargaKg = parseFloat(document.getElementById('hargaKg').value) || 0;
    const total = berat * hargaKg;
    
    if (total > 0) {
        transaksiHariIni.push({
            type: 'pembelian',
            keterangan: `Beli ${berat}kg @ Rp${hargaKg.toLocaleString()}/kg`,
            jumlah: total,
            waktu: new Date().toLocaleTimeString('id-ID')
        });
        saveData();
        loadTransaksi();
        updateSummary();
        document.getElementById('berat').value = '';
        document.getElementById('hargaKg').value = '';
    }
}

// Tambah Penjualan
function tambahPenjualan() {
    const pendapatan = parseFloat(document.getElementById('pendapatan').value) || 0;
    
    if (pendapatan > 0) {
        transaksiHariIni.push({
            type: 'penjualan',
            keterangan: `Penjualan hari ini`,
            jumlah: pendapatan,
            waktu: new Date().toLocaleTimeString('id-ID')
        });
        saveData();
        loadTransaksi();
        updateSummary();
        document.getElementById('pendapatan').value = '';
    }
}

// Tambah Pengeluaran (VERSI BARU)
function tambahPengeluaran() {
    const keterangan = document.getElementById('kategoriPengeluaran').value;
    const jumlah = parseFloat(document.getElementById('jumlahPengeluaran').value) || 0;
    
    if (keterangan && jumlah > 0) {
        transaksiHariIni.push({
            type: 'pengeluaran',
            keterangan: keterangan,
            jumlah: jumlah,
            waktu: new Date().toLocaleTimeString('id-ID')
        });
        saveData();
        loadTransaksi();
        updateSummary();
        
        // Reset form
        document.getElementById('kategoriPengeluaran').value = '';
        document.getElementById('jumlahPengeluaran').value = '';
    } else {
        alert('❌ Pilih kategori dan isi jumlah!');
    }
}

// Update Summary
function updateSummary() {
    const pembelian = transaksiHariIni
        .filter(t => t.type === 'pembelian')
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    const penjualan = transaksiHariIni
        .filter(t => t.type === 'penjualan')
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    const pengeluaranLain = transaksiHariIni
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + t.jumlah, 0);
    
    const totalPengeluaran = pembelian + pengeluaranLain;
    const laba = penjualan - totalPengeluaran;
    
    document.getElementById('modalHariIni').textContent = formatRupiah(pembelian);
    document.getElementById('pendapatanHariIni').textContent = formatRupiah(penjualan);
    document.getElementById('pengeluaranHariIni').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('labaHariIni').textContent = formatRupiah(laba);
    
    // Update warna laba
    const labaEl = document.getElementById('labaHariIni');
    if (laba >= 0) {
        labaEl.parentElement.classList.add('profit');
    } else {
        labaEl.parentElement.classList.remove('profit');
    }
}

// Load Riwayat
function loadTransaksi() {
    const list = document.getElementById('riwayatList');
    list.innerHTML = '';
    
    transaksiHariIni.forEach((transaksi, index) => {
        const div = document.createElement('div');
        // Di dalam loadTransaksi(), ganti className jadi:
        div.className = `history-item ${transaksi.type}`;
        div.innerHTML = `
            <div>
                <strong>${transaksi.keterangan}</strong><br>
                <small>${transaksi.waktu}</small>
            </div>
            <div>
                <span class="amount ${transaksi.type === 'penjualan' ? 'income' : 'expense'}">
                    ${transaksi.type === 'penjualan' ? '+' : '-'}${formatRupiah(transaksi.jumlah)}
                </span>
                <button onclick="hapusTransaksi(${index})" style="margin-left: 1rem; padding: 5px 10px; font-size: 0.8rem;">🗑️</button>
            </div>
        `;
        list.appendChild(div);
    });
}

// Update Weekly Summary
function updateWeekly() {
    const weeklyEl = document.getElementById('weeklySummary');
    weeklyEl.innerHTML = '';
    
    // Ambil 7 hari terakhir dari riwayat
    const tujuhHari = riwayatMinggu.slice(-7);
    
    tujuhHari.forEach((hari, index) => {
        const div = document.createElement('div');
        div.className = 'weekly-item';
        div.innerHTML = `
            <span>${new Date(hari.tanggal).toLocaleDateString('id-ID', {weekday: 'short', day: 'numeric'})}</span>
            <span>${formatRupiah(hari.laba)}</span>
        `;
        weeklyEl.appendChild(div);
    });
}

// Hapus transaksi
function hapusTransaksi(index) {
    transaksiHariIni.splice(index, 1);
    saveData();
    loadTransaksi();
    updateSummary();
}

// Hapus semua hari ini
function hapusSemuaHariIni() {
    if (confirm('Hapus semua transaksi hari ini?')) {
        transaksiHariIni = [];
        saveData();
        loadTransaksi();
        updateSummary();
    }
}

// Simpan data
function saveData() {
    localStorage.setItem('transaksiHariIni', JSON.stringify(transaksiHariIni));
    
    // Simpan ringkasan hari ini ke riwayat minggu
    const hariIni = new Date().toDateString();
    const existingIndex = riwayatMinggu.findIndex(h => h.tanggal === hariIni);
    
    const summary = {
        tanggal: hariIni,
        laba: parseInt(document.getElementById('labaHariIni').textContent.replace(/[^\d]/g, '')) || 0
    };
    
    if (existingIndex > -1) {
        riwayatMinggu[existingIndex] = summary;
    } else {
        riwayatMinggu.push(summary);
    }
    
    // Keep only last 30 days
    if (riwayatMinggu.length > 30) {
        riwayatMinggu = riwayatMinggu.slice(-30);
    }
    
    localStorage.setItem('riwayatMinggu', JSON.stringify(riwayatMinggu));
}
// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBvoEIz4NzT5LvebWCRMHD6xvtgXL1GtWI",
  authDomain: "juraganbawang.firebaseapp.com",
  projectId: "juraganbawang",
  storageBucket: "juraganbawang.firebasestorage.app",
  messagingSenderId: "546901896995",
  appId: "1:546901896995:web:80c20ad881e0342815a696",
  measurementId: "G-6BSG012KL1",
  databaseURL: "https://juraganbawang-default-rtdb.firebaseio.com" // Sesuaikan dengan URL di tab Realtime Database Anda
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Fungsi untuk menyimpan transaksi
function simpanKeFirebase(tipe, berat, harga) {
    const total = berat * harga;
    const dataRef = database.ref('kas_harian');

    dataRef.child(tipe).push({
        berat: berat,
        harga: harga,
        total: total,
        waktu: new Date().toISOString()
    });
}

// Fungsi Mendengarkan Perubahan Data (SINKRONISASI OTOMATIS)
database.ref('kas_harian').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Logika untuk menghitung total modal, pendapatan, dll dari data Firebase
        // Contoh: update tampilan di laptop/HP secara otomatis
        console.log("Data terbaru diterima:", data);
        updateTampilanLayar(data);
    }
});

function updateTampilanLayar(data) {
    // Di sini Anda masukkan logika DOM untuk mengubah angka Rp 0 menjadi angka dari Firebase
    // Contoh: document.getElementById('modal-id').innerText = ...
}
