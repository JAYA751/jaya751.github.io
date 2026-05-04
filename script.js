// --- 1. KONFIGURASI FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBvoEIz4NzT5LvebWCRMHD6xvtgXL1GtWI",
    authDomain: "juraganbawang.firebaseapp.com",
    projectId: "juraganbawang",
    storageBucket: "juraganbawang.firebasestorage.app",
    messagingSenderId: "546901896995",
    appId: "1:546901896995:web:80c20ad881e0342815a696",
    measurementId: "G-6BSG012KL1",
    // PASTIKAN databaseURL ini sama dengan yang ada di panel Firebase Realtime Database Anda
    databaseURL: "https://juraganbawang-default-rtdb.firebaseio.com" 
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. DATA STORAGE ---
let transaksiHariIni = [];
let kategoriPengeluaran = JSON.parse(localStorage.getItem('kategoriPengeluaran')) || [
    'Bensin', 'Karyawan', 'Kopi', 'Karcis', 'Parkir', 'Makan', 'Pulsa', 'Lain-lain'
];

// --- 3. INISIALISASI & SYNC ---
document.addEventListener('DOMContentLoaded', function() {
    updateTanggal();
    updateDropdownKategori();
    
    // Listening data secara real-time
    database.ref('transaksi_bawang').on('value', (snapshot) => {
        const data = snapshot.val();
        transaksiHariIni = []; 
        
        if (data) {
            // Mengubah Object Firebase menjadi Array
            Object.keys(data).forEach(key => {
                transaksiHariIni.push({
                    id: key,
                    ...data[key]
                });
            });
            // Urutkan berdasarkan waktu (terbaru di atas) jika diperlukan
        }
        
        // Memaksa UI untuk update
        renderSemua();
    }, (error) => {
        console.error("Gagal membaca database:", error);
    });
});

function renderSemua() {
    loadTransaksiUI();
    updateSummaryUI();
}

// --- 4. FUNGSI INPUT ---
function tambahPembelian() {
    const berat = parseFloat(document.getElementById('berat').value) || 0;
    const hargaKg = parseFloat(document.getElementById('hargaKg').value) || 0;
    const total = berat * hargaKg;
    
    if (total > 0) {
        database.ref('transaksi_bawang').push({
            type: 'pembelian',
            keterangan: `Beli ${berat}kg @ Rp${hargaKg.toLocaleString()}/kg`,
            jumlah: total,
            waktu: new Date().toLocaleTimeString('id-ID')
        }).then(() => {
            document.getElementById('berat').value = '';
            document.getElementById('hargaKg').value = '';
        });
    }
}

function tambahPenjualan() {
    const pendapatan = parseFloat(document.getElementById('pendapatan').value) || 0;
    if (pendapatan > 0) {
        database.ref('transaksi_bawang').push({
            type: 'penjualan',
            keterangan: `Penjualan bawang`,
            jumlah: pendapatan,
            waktu: new Date().toLocaleTimeString('id-ID')
        }).then(() => {
            document.getElementById('pendapatan').value = '';
        });
    }
}

function tambahPengeluaran() {
    const kategori = document.getElementById('kategoriPengeluaran').value;
    const jumlah = parseFloat(document.getElementById('jumlahPengeluaran').value) || 0;
    
    if (kategori && jumlah > 0) {
        database.ref('transaksi_bawang').push({
            type: 'pengeluaran',
            keterangan: kategori,
            jumlah: jumlah,
            waktu: new Date().toLocaleTimeString('id-ID')
        }).then(() => {
            document.getElementById('kategoriPengeluaran').value = '';
            document.getElementById('jumlahPengeluaran').value = '';
        });
    } else {
        alert('Pilih kategori dan isi jumlah!');
    }
}

// --- 5. UPDATE UI ---
function loadTransaksiUI() {
    const list = document.getElementById('riwayatList');
    if (!list) return;
    list.innerHTML = '';
    
    // Balik urutan agar transaksi terbaru muncul di paling atas
    const displayData = [...transaksiHariIni].reverse();

    displayData.forEach((t) => {
        const div = document.createElement('div');
        div.className = `history-item ${t.type}`;
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #eee";

        div.innerHTML = `
            <div>
                <strong>${t.keterangan}</strong><br>
                <small>${t.waktu}</small>
            </div>
            <div style="text-align: right;">
                <span class="amount ${t.type === 'penjualan' ? 'income' : 'expense'}" style="font-weight: bold; color: ${t.type === 'penjualan' ? '#27ae60' : '#e74c3c'}">
                    ${t.type === 'penjualan' ? '+' : '-'}${formatRupiah(t.jumlah)}
                </span><br>
                <button onclick="hapusTransaksi('${t.id}')" style="background:none; border:none; color:red; cursor:pointer; font-size:1.2rem;">🗑️</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function updateSummaryUI() {
    const modal = transaksiHariIni.filter(t => t.type === 'pembelian').reduce((s, t) => s + t.jumlah, 0);
    const pendapatan = transaksiHariIni.filter(t => t.type === 'penjualan').reduce((s, t) => s + t.jumlah, 0);
    const pengeluaranLain = transaksiHariIni.filter(t => t.type === 'pengeluaran').reduce((s, t) => s + t.jumlah, 0);
    
    const totalPengeluaran = modal + pengeluaranLain;
    const laba = pendapatan - totalPengeluaran;
    
    document.getElementById('modalHariIni').textContent = formatRupiah(modal);
    document.getElementById('pendapatanHariIni').textContent = formatRupiah(pendapatan);
    document.getElementById('pengeluaranHariIni').textContent = formatRupiah(totalPengeluaran);
    document.getElementById('labaHariIni').textContent = formatRupiah(laba);

    const labaEl = document.getElementById('labaHariIni');
    labaEl.style.color = laba >= 0 ? "#27ae60" : "#e74c3c";
}

// --- 6. UTILS ---
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
}

function updateTanggal() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const el = document.getElementById('tanggal');
    if (el) el.textContent = new Date().toLocaleDateString('id-ID', options);
}

function hapusTransaksi(id) {
    if (confirm('Hapus transaksi ini dari semua perangkat?')) {
        database.ref(`transaksi_bawang/${id}`).remove();
    }
}

function hapusSemuaHariIni() {
    if (confirm('PERINGATAN: Ini akan menghapus seluruh data di HP dan Laptop. Lanjutkan?')) {
        database.ref('transaksi_bawang').remove();
    }
}

// Tab & Dropdown
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    if (event) event.target.classList.add('active');
}

function updateDropdownKategori() {
    const select = document.getElementById('kategoriPengeluaran');
    if (!select) return;
    select.innerHTML = '<option value="">Pilih kategori...</option>';
    kategoriPengeluaran.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = k;
        select.appendChild(opt);
    });
}

function simpanKategoriBaru() {
    const namaBaru = document.getElementById('kategoriBaru').value.trim();
    if (namaBaru && !kategoriPengeluaran.includes(namaBaru)) {
        kategoriPengeluaran.push(namaBaru);
        localStorage.setItem('kategoriPengeluaran', JSON.stringify(kategoriPengeluaran));
        updateDropdownKategori();
        tutupModal();
    }
}

function bukaModal() { document.getElementById('modalTambahKategori').style.display = 'block'; }
function tutupModal() { document.getElementById('modalTambahKategori').style.display = 'none'; }
const btnAddKategori = document.getElementById('tambahKategoriBtn');
if (btnAddKategori) btnAddKategori.addEventListener('click', bukaModal);
