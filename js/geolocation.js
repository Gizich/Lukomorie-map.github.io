// --- НАСТРОЙКИ ГЕОПРИВЯЗКИ ---
const GPS_CONSTANTS = {
    xA: 0, yA: 0,
    xB: 1392, yB: 2480,
    LatA: 54.835948, LonA: 55.852392,
    LatB: 54.827467, LonB: 55.860459
};

const mX = (GPS_CONSTANTS.xB - GPS_CONSTANTS.xA) / (GPS_CONSTANTS.LonB - GPS_CONSTANTS.LonA);
const mY = (GPS_CONSTANTS.yB - GPS_CONSTANTS.yA) / (GPS_CONSTANTS.LatB - GPS_CONSTANTS.LatA);

let locationPin;
let isAlertShown = false;
let watchId = null; // ID процесса слежения
let cooldownTimer = null; // ID таймера

function gpsToSvg(lat, lon) {
    const x = mX * (lon - GPS_CONSTANTS.LonA) + GPS_CONSTANTS.xA;
    const y = mY * (lat - GPS_CONSTANTS.LatA) + GPS_CONSTANTS.yA;
    return { x, y };
}

function isOutOfBounds(lat, lon) {
    const minLat = Math.min(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const maxLat = Math.max(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const minLon = Math.min(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);
    const maxLon = Math.max(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);

    if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
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
            alert("Вы находитесь за пределами территории Лукоморья.");
            isAlertShown = true;
        }
        // Если кнопка доступна (таймер не идет), пишем статус
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
        
        if (!isOutOfBounds(crd.latitude, crd.longitude)) {
             locationPin.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
    }
}

function error(err) {
    console.warn(`GPS ERROR(${err.code}): ${err.message}`);
    if (err.code === 1) {
        alert("Доступ к геолокации запрещен.");
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

    // --- ВАЖНОЕ ИСПРАВЛЕНИЕ: Сбрасываем флаг уведомления при новом запуске ---
    isAlertShown = false; 

    // Сброс предыдущего поиска
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