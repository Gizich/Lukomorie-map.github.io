// Элементы интерфейса
const menuScreen = document.getElementById('menu-screen');
const mapScreen = document.getElementById('map-screen');
const cardsContainer = document.getElementById('cards-container');

// 1. Инициализация (Генерация меню)
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, загрузились ли данные (поддержка и window.houses и просто houses)
    const housesData = (typeof window.houses !== 'undefined') ? window.houses : (typeof houses !== 'undefined' ? houses : []);

    if (housesData.length === 0) {
        console.error('Ошибка: Данные о домиках не найдены.');
        return;
    }

    // Сортировка: Администрация первая, остальные по алфавиту
    const adminHouse = housesData.find(h => h.id === 'house_Administracia');
    let otherHouses = housesData.filter(h => h.id !== 'house_Administracia');
    otherHouses.sort((a, b) => a.name.localeCompare(b.name));
    
    const sortedHouses = [];
    if (adminHouse) sortedHouses.push(adminHouse);
    sortedHouses.push(...otherHouses);

    // Создание карточек
    sortedHouses.forEach(house => {
        const card = document.createElement('div');
        card.className = 'house-card';
        const bgStyle = house.img ? `background-image: url('${house.img}')` : 'background-color: #cbd5e1';

        card.innerHTML = `<div class="card-image" style="${bgStyle}"></div><div class="card-title">${house.name}</div>`;
        
        card.onclick = () => {
            // --- НОВОЕ: Отправка аналитики ---
            if (typeof trackEvent === 'function') {
                trackEvent('select_' + house.id); 
            }
            // ---------------------------------
            openMap(house);
        };
        
        cardsContainer.appendChild(card);
    });
});

// 2. Открытие карты
function openMap(houseData) {
    menuScreen.style.display = 'none';
    mapScreen.style.display = 'flex';

    // Сброс старых классов
    document.querySelectorAll('.active-route').forEach(el => el.classList.remove('active-route'));
    document.querySelectorAll('.active-house').forEach(el => el.classList.remove('active-house'));

    // Гарантируем жесткую высоту (чтобы не было белого экрана)
    const mapWrapper = document.querySelector('.map-wrapper');
    if (mapWrapper) {
        mapWrapper.style.height = '100vh'; 
        mapWrapper.style.minHeight = '100vh';
    }
    const mapScreenEl = document.getElementById('map-screen');
    if(mapScreenEl) {
        mapScreenEl.style.position = 'fixed';
        mapScreenEl.style.height = '100%';
    }
    
    // Активация маршрута
    if (houseData.route) {
        const routeEl = document.getElementById(houseData.route);
        if (routeEl) routeEl.classList.add('active-route');
    }

    // Активация домика
    const houseEl = document.getElementById(houseData.id);
    if (houseEl) {
        houseEl.classList.add('active-house');

        // Простой безопасный скролл к домику
        setTimeout(() => {
           houseEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }, 100);
    }
}

// 3. Функция кнопки "Назад"
function showMenu() {
    mapScreen.style.display = 'none';
    menuScreen.style.display = 'flex';
}