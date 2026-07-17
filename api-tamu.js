// ==========================================
// KONFIGURASI API
// ==========================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzkjpzYtYwY0BgYlUssFaXgK33OFsHpLn_usbm8dC3J2VS1cUT3nn33W6VStVobRFLK8w/exec';

// ==========================================
// LOGIC LOAD DATA TAMU DINAMIS
// ==========================================
async function loadGuestData() {
    const params = new URLSearchParams(window.location.search);
    const guestId = params.get('id');

    const nameEl = document.getElementById('guest-name');
    const gelarEl = document.getElementById('guest-gelar');
    const sapaanEl = document.getElementById('guest-sapaan');

    // 1. Cek LocalStorage Cache dulu (Instant load!)
    if (guestId) {
        const cached = localStorage.getItem(`guest_${guestId}`);
        if (cached) {
            updateUI(JSON.parse(cached));
            finishLoading();
            return;
        }
    }

    // 2. Fallback jika tidak ada ID
    if (!guestId) {
        nameEl.innerText = "Bapak/Ibu/Saudara/i";
        gelarEl.innerText = "";
        sapaanEl.innerText = "Kepada Yth.";
        finishLoading();
        return;
    }

    // 3. Fetch dari Google Apps Script
    try {
        const response = await fetch(`${GAS_API_URL}?id=${encodeURIComponent(guestId)}`);
        const data = await response.json();

        if (data.error || !data.nama_lengkap) {
            nameEl.innerText = "Tamu Undangan";
            gelarEl.innerText = "";
        } else {
            // Simpan ke cache untuk kunjungan berikutnya
            localStorage.setItem(`guest_${guestId}`, JSON.stringify(data));
            updateUI(data);
        }
    } catch (err) {
        console.error("Gagal memuat data:", err);
        nameEl.innerText = "Bapak/Ibu/Saudara/i";
    } finally {
        finishLoading();
    }
}

function updateUI(data) {
    const nameEl = document.getElementById('guest-name');

    // 1. Gabungkan Nama & Gelar menjadi satu string horizontal
    const fullDisplayName = data.gelar 
        ? `${data.nama_lengkap}, ${data.gelar}` 
        : data.nama_lengkap;

    // 2. Masukkan ke elemen nama (Warna kuning otomatis mengikuti class CSS text-yellow-500)
    nameEl.innerText = fullDisplayName;

    // 3. Kosongkan elemen gelar terpisah karena sudah digabung
    document.getElementById('guest-gelar').innerText = '';

    // 4. LOGIKA RESPONSIVE FONT SCALING (Agar nama panjang tetap rapi)
    // Reset class ukuran font dulu
    nameEl.classList.remove('text-2xl', 'md:text-3xl', 'text-lg', 'sm:text-xl', 'md:text-2xl');

    if (fullDisplayName.length > 45) {
        // Nama SANGAT PANJANG: Gunakan font paling kecil
        nameEl.classList.add('text-lg', 'sm:text-xl', 'md:text-2xl');
    } else if (fullDisplayName.length > 30) {
        // Nama SEDANG: Gunakan font menengah
        nameEl.classList.add('text-xl', 'sm:text-2xl', 'md:text-3xl');
    } else {
        // Nama PENDEK: Gunakan font standar (besar)
        nameEl.classList.add('text-2xl', 'md:text-3xl');
    }

    // 5. Personalisasi Sapaan BERDASARKAN GENDER SAJA (Sesuai Permintaan)
    const gender = data.jenis_kelamin?.toUpperCase().trim();
    
    let sapaanCover = "Yth. Saudara/i"; // Default jika gender kosong/tidak valid
    let sapaanSambutan = "Yth. Bapak/Ibu/Saudara/i"; // Default

    // Logika Mutlak Berdasarkan Gender
    if (gender === 'L') {
        sapaanCover = "Yth. Bapak";
        sapaanSambutan = "Yth. Bapak";
    } else if (gender === 'P') {
        sapaanCover = "Yth. Ibu";
        sapaanSambutan = "Yth. Ibu";
    }

    // 6. Apply Sapaan ke Elemen HTML
    document.getElementById('guest-sapaan').innerText = sapaanCover;
    document.getElementById('sambutan-sapaan').innerText = sapaanSambutan;
    
    // Update nama di section sambutan juga (format sama: Nama, Gelar)
    document.getElementById('sambutan-nama').innerText = fullDisplayName;
}

function finishLoading() {
    setTimeout(() => {
        document.body.classList.add('loaded');
        AOS.init({ once: true, offset: 100, duration: 1000 });
    }, 800);
}

// Jalankan saat DOM ready
document.addEventListener('DOMContentLoaded', loadGuestData);
