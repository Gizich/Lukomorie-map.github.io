// Элементы интерфейса
const menuScreen = document.getElementById('menu-screen');
const mapScreen = document.getElementById('map-screen');
const cardsContainer = document.getElementById('cards-container');

// 1. Инициализация (Генерация меню)
document.addEventListener('DOMContentLoaded', () => {
    houses.forEach(house => {
        const card = document.createElement('div');
        card.className = 'house-card';
        const bgStyle = house.img ? `background-image: url('${house.img}')` : 'background-color: #cbd5e1';

        // Создаем карточку
        card.innerHTML = `<div class="card-image" style="${bgStyle}"></div><div class="card-title">${house.name}</div>`;
        
        // Вешаем обработчик клика
        card.onclick = () => openMap(house);
        
        cardsContainer.appendChild(card);
    });
});

// 2. Простая функция открытия карты (БЕЗ сложной математики)
function openMap(houseData) {
    // Переключаем экраны
    menuScreen.style.display = 'none';
    mapScreen.style.display = 'flex';

    // Сброс старых активных классов
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
        
        // БЕЗОПАСНЫЙ СКРОЛЛ: Просто прокручиваем элемент в видимую область
        // Это встроенная функция браузера, она не вызывает ошибок
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