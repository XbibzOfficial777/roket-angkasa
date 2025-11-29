// sec.js - Security Script untuk Xbibz API
(function() {
    'use strict';
    
    // --- LOGIKA KEAMANAN ---
    
    // 1. Blokir Klik Kanan
    document.addEventListener('contextmenu', function(e) {
        // Untuk production, blokir semua klik kanan
        e.preventDefault();
    });

    // 2. Blokir Hotkey DevTools (F12, Ctrl+Shift+I, dll)
    document.addEventListener('keydown', function(e) {
        if (
            e.key === 'F12' || // F12
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) || // Ctrl+Shift+J
            (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || // Ctrl+Shift+C
            (e.ctrlKey && (e.key === 'U' || e.key === 'u')) || // Ctrl+U (View Source)
            (e.key === 'PrintScreen') // Print Screen
        ) {
            e.preventDefault();
            // Opsional: Tampilkan pesan peringatan
            console.warn('Aksi ini diblokir untuk keamanan.');
        }
    });

    // 3. Deteksi DevTools (Metode Cek Ukuran Jendela)
    const devToolsThreshold = 150;
    let devToolsOpen = false;
    let devToolsCheckInterval;

    function detectDevTools() {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if ((widthDiff > devToolsThreshold || heightDiff > devToolsThreshold) && !devToolsOpen) {
            devToolsOpen = true;
            // Mengganti konten body
            document.body.innerHTML = `
                <div style="background-color: #000; color: #ff4444; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Inter', sans-serif; user-select: none;">
                    <div style="font-size: 5rem; line-height: 1;"><i class="fas fa-ban"></i></div>
                    <h1 style="font-size: 2rem; font-weight: bold; margin-top: 1.5rem;">Akses Ditolak</h1>
                    <p style="font-size: 1.25rem; margin-top: 0.5rem;">Developer Tools tidak diizinkan di halaman ini.</p>
                    <p style="font-size: 1rem; color: #888; margin-top: 2rem;">Silakan tutup DevTools dan segarkan halaman.</p>
                </div>`;
                
            // Hentikan interval setelah deteksi
            if (devToolsCheckInterval) {
                clearInterval(devToolsCheckInterval);
            }
        } else if (widthDiff <= devToolsThreshold && heightDiff <= devToolsThreshold) {
            devToolsOpen = false;
        }
    }

    // 4. Anti Image Copy
    function preventImageDrag() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('draggable', 'false');
            img.style.pointerEvents = 'none';
        });
    }

    // 5. Anti Text Selection (dengan pengecualian untuk elemen tertentu)
    function preventTextSelection() {
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        
        // Izinkan seleksi pada elemen dengan class 'allow-select'
        const allowSelectElements = document.querySelectorAll('.allow-select');
        allowSelectElements.forEach(el => {
            el.style.userSelect = 'text';
            el.style.webkitUserSelect = 'text';
            el.style.mozUserSelect = 'text';
            el.style.msUserSelect = 'text';
        });
    }

    // 6. Blokir Inspect Element melalui menu browser
    function blockInspectElement() {
        // Override fungsi yang biasa digunakan untuk inspect
        if (typeof EventTarget !== 'undefined') {
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'devtoolschange' || type === 'devtoolsopened') {
                    return;
                }
                originalAddEventListener.call(this, type, listener, options);
            };
        }
    }

    // 7. Deteksi jika halaman di-embed dalam iframe (clickjacking protection)
    function preventFraming() {
        if (window !== window.top) {
            window.top.location = window.location;
        }
    }

    // 8. Inisialisasi semua fungsi keamanan
    function initSecurity() {
        preventTextSelection();
        preventImageDrag();
        blockInspectElement();
        preventFraming();
        
        // Jalankan deteksi DevTools secara berkala (opsional, aktifkan jika diperlukan)
        // devToolsCheckInterval = setInterval(detectDevTools, 1000);
        
        // Deteksi saat ukuran jendela berubah
        window.addEventListener('resize', detectDevTools);
        
        // Jalankan deteksi awal
        detectDevTools();
    }

    // Tunggu hingga DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurity);
    } else {
        initSecurity();
    }

    // Ekspos fungsi untuk penggunaan eksternal jika diperlukan
    window.xbibzSecurity = {
        init: initSecurity,
        detectDevTools: detectDevTools,
        preventTextSelection: preventTextSelection,
        preventImageDrag: preventImageDrag
    };

})();