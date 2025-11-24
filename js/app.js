// Элементы интерфейса
const menuScreen = document.getElementById('menu-screen');
const mapScreen = document.getElementById('map-screen');
const cardsContainer = document.getElementById('cards-container');

// 1. Инициализация (Генерация меню)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof houses === 'undefined') {
        console.error('Ошибка: Файл data.js не загружен или пуст.');
        return;
    }

    // --- ЛОГИКА СОРТИРОВКИ ---
    // 1. Находим Администрацию
    const adminHouse = houses.find(h => h.id === 'house_Administracia');
    
    // 2. Берем всех остальных
    let otherHouses = houses.filter(h => h.id !== 'house_Administracia');
    
    // 3. Сортируем остальных по алфавиту (по имени)
    otherHouses.sort((a, b) => a.name.localeCompare(b.name));

    // 4. Собираем новый список: Администрация первая, потом остальные
    const sortedHouses = [];
    if (adminHouse) sortedHouses.push(adminHouse);
    sortedHouses.push(...otherHouses);

    // --- ОТРИСОВКА ---
    sortedHouses.forEach(house => {
        const card = document.createElement('div');
        card.className = 'house-card';
        const bgStyle = house.img ? `background-image: url('${house.img}')` : 'background-color: #cbd5e1';

        card.innerHTML = `<div class="card-image" style="${bgStyle}"></div><div class="card-title">${house.name}</div>`;
        card.onclick = () => openMap(house);
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