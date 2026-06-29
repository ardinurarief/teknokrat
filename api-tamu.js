// ==========================================
// KONFIGURASI API - GANTI DENGAN URL ANDA
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
    document.getElementById('guest-name').innerText = data.nama_lengkap;
    document.getElementById('guest-gelar').innerText = data.gelar ? `, ${data.gelar}` : '';

    // Personalisasi sapaan berdasarkan hubungan
    const rel = data.hubungan?.toLowerCase() || '';
    if (rel.includes('orang tua') || rel.includes('ayah') || rel.includes('ibu')) {
        document.getElementById('guest-sapaan').innerText = "Yth. Bapak/Ibu";
    } else if (rel.includes('dosen') || rel.includes('rektor') || rel.includes('kaprodi')) {
        document.getElementById('guest-sapaan').innerText = "Yth. Bapak/Ibu Dosen";
    } else {
        document.getElementById('guest-sapaan').innerText = "Yth. Saudara/i";
    }

    const rel = data.hubungan?.toLowerCase() || '';
    let sapaanSambutan = "Yth. Bapak/Ibu/Saudara/i"; // Default
    
    if (rel.includes('orang tua') || rel.includes('ayah') || rel.includes('ibu')) {
        sapaanSambutan = "Yth. Bapak/Ibu";
    } else if (rel.includes('dosen') || rel.includes('rektor') || rel.includes('kaprodi')) {
        sapaanSambutan = "Yth. Bapak/Ibu Dosen";
    }
    
    document.getElementById('sambutan-sapaan').innerText = sapaanSambutan;
    document.getElementById('sambutan-nama').innerText = 
        `${data.nama_lengkap}${data.gelar ? ', ' + data.gelar : ''}`;
}

function finishLoading() {
    // Beri jeda minimal agar transisi loading smooth
    setTimeout(() => {
        document.body.classList.add('loaded');
        // Inisialisasi AOS hanya setelah data siap agar animasi tidak glitch
        AOS.init({ once: true, offset: 100, duration: 1000 });
    }, 800);
}

// Jalankan saat DOM ready
document.addEventListener('DOMContentLoaded', loadGuestData);
