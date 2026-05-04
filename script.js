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
