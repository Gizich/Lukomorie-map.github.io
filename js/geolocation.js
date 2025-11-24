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
// Флаг, чтобы не спамить уведомлениями каждую секунду
let isAlertShown = false; 

function gpsToSvg(lat, lon) {
    const x = mX * (lon - GPS_CONSTANTS.LonA) + GPS_CONSTANTS.xA;
    const y = mY * (lat - GPS_CONSTANTS.LatA) + GPS_CONSTANTS.yA;
    return { x, y };
}

// Проверка: находится ли точка внутри границ карты
function isOutOfBounds(lat, lon) {
    // Определяем границы (мин/макс широта и долгота)
    const minLat = Math.min(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const maxLat = Math.max(GPS_CONSTANTS.LatA, GPS_CONSTANTS.LatB);
    const minLon = Math.min(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);
    const maxLon = Math.max(GPS_CONSTANTS.LonA, GPS_CONSTANTS.LonB);

    // Если текущая точка за пределами этих рамок
    if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
        return true;
    }
    return false;
}

function success(pos) {
    const crd = pos.coords;
    const btn = document.querySelector('.location-btn');
    locationPin = document.getElementById('user-location-pin');

    // 1. Проверяем, на территории ли клиент
    if (isOutOfBounds(crd.latitude, crd.longitude)) {
        if (!isAlertShown) {
            alert("Вы находитесь за пределами территории базы. Маркер может быть не виден.");
            isAlertShown = true; // Больше не показываем алерт в этом сеансе
        }
        if(btn) btn.innerText = '📍 Вы далеко';
        // Мы все равно можем обновить маркер, но он улетит за границу видимости
    } else {
        if(btn) btn.innerText = '🛰️ Вы найдены!';
    }

    // 2. Обновляем маркер
    const { x, y } = gpsToSvg(crd.latitude, crd.longitude);
    if (locationPin) {
        locationPin.setAttribute('cx', x);
        locationPin.setAttribute('cy', y);
        locationPin.style.opacity = 1; 
        
        // Скроллим к маркеру только если он ВНУТРИ карты (иначе скролл улетит в пустоту)
        if (!isOutOfBounds(crd.latitude, crd.longitude)) {
             locationPin.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }
    }
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
    alert("Не удалось определить местоположение. Разрешите доступ к геолокации.");
}

function startGeolocationTracking() {
    if (!navigator.geolocation) {
        alert('Ваш браузер не поддерживает GPS.');
        return;
    }

    const btn = document.querySelector('.location-btn');
    if(btn) btn.innerText = '📡 Поиск...';

    navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}