// --- НАСТРОЙКИ ГЕОПРИВЯЗКИ ---
const GPS_CONSTANTS = {
    xA: 0, yA: 0,
    xB: 1392, yB: 2480,
    LatA: 54.835948, LonA: 55.852392,
    LatB: 54.827467, LonB: 55.860459
};

// ==========================================
// 🛠️ КОРРЕКЦИЯ (Сдвигаем точку выше и левее)
// ==========================================
const CORRECTION_X = -40;  // Сдвиг влево
const CORRECTION_Y = -300;  // Сдвиг вверх
// ==========================================

const mX = (GPS_CONSTANTS.xB - GPS_CONSTANTS.xA) / (GPS_CONSTANTS.LonB - GPS_CONSTANTS.LonA);
const mY = (GPS_CONSTANTS.yB - GPS_CONSTANTS.yA) / (GPS_CONSTANTS.LatB - GPS_CONSTANTS.LatA);

let locationPin;
let isAlertShown = false;
let watchId = null;
let cooldownTimer = null;

function gpsToSvg(lat, lon) {
    // Базовый расчет
    let x = mX * (lon - GPS_CONSTANTS.LonA) + GPS_CONSTANTS.xA;
    let y = mY * (lat - GPS_CONSTANTS.LatA) + GPS_CONSTANTS.yA;
    
    // Применяем коррекцию
    x = x + CORRECTION_X;
    y = y + CORRECTION_Y;
    
    return { x, y };
}

function isOutOfBounds(lat, lon) {
    const minLat = Math.min(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const maxLat = Math.max(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const minLon = Math.min(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);
    const maxLon = Math.max(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);

    // Добавляем небольшой допуск (buffer), чтобы не ругался на границе
    const buffer = 0.0005; 

    if (lat < minLat - buffer || lat > maxLat + buffer || lon < minLon - buffer || lon > maxLon + buffer) {
        return true;
    }
    return false;
}

function success(pos) {
    const crd = pos.coords;
    const btn = document.querySelector('.location-btn');
    locationPin = document.getElementById('user-location-pin');

    if (isOutOfBounds(crd.latitude, crd.longitude)) {
        if (!isAlertShown) {
            // Уведомление убрали, чтобы не раздражало, если человек рядом
            console.log("Пользователь за пределами карты");
            isAlertShown = true;
        }
        if (btn && !btn.disabled) {
             btn.innerText = '📍 Вы далеко';
        }
    } else {
        if (btn && !btn.disabled) {
             btn.innerText = '🛰️ Вы найдены!';
        }
    }

    const { x, y } = gpsToSvg(crd.latitude, crd.longitude);
    if (locationPin) {
        locationPin.setAttribute('cx', x);
        locationPin.setAttribute('cy', y);
        locationPin.style.opacity = 1; 
        
        // Скроллим к маркеру (убрали проверку границ для скролла, чтобы всегда показывал где мы)
        locationPin.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
}

function error(err) {
    console.warn(`GPS ERROR(${err.code}): ${err.message}`);
    const btn = document.querySelector('.location-btn');
    
    if (err.code === 1) {
        alert("Доступ к геолокации запрещен.");
    }
    
    if(btn) {
        btn.innerText = '📍 Где я?';
        btn.disabled = false;
    }
}

function startCooldown(seconds) {
    const btn = document.querySelector('.location-btn');
    if (!btn) return;

    let timeLeft = seconds;
    btn.disabled = true;
    btn.innerText = `Ждите ${timeLeft}с...`;

    if (cooldownTimer) clearInterval(cooldownTimer);

    cooldownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(cooldownTimer);
            btn.disabled = false;
            btn.innerText = "📍 Обновить"; 
        } else {
            btn.innerText = `Ждите ${timeLeft}с...`;
        }
    }, 1000);
}

function startGeolocationTracking() {
    const btn = document.querySelector('.location-btn');

    if (!navigator.geolocation) {
        alert('Ваш браузер не поддерживает GPS.');
        return;
    }

    isAlertShown = false; 

    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }

    startCooldown(20);

    watchId = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });

}
