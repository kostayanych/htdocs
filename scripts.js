// scripts.js

// Base URL for API
const API_BASE = "http://localhost:3000/api";

// Fetch and display stories
async function loadStories(filters = {}) {
    try {
        // Создаем строку параметров для фильтров
        const params = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/stories/getByFilters?${params}`);
        console.log(`Запрос к API: /stories/getByFilters?${params}`);

        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.status);
        }

        const stories = await response.json();
        const storiesContainer = document.getElementById('storiesContainer');
        storiesContainer.innerHTML = ''; // Очистка контейнера перед загрузкой

        if (stories.length === 0) {
           storiesContainer.innerHTML = '<p>Истории не найдены.</p>';
        }

        // Выводим загруженные истории для отладки
        console.log('Загруженные истории:', stories);

        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.classList.add('storyCard');
            storyElement.innerHTML = `
                <h3>${story.name}</h3>
                <p>Автор: ${story.author ? story.author.name : 'Неизвестен'} ${story.author ? story.author.surname : ''}</p>
                <p>Дата: ${new Date(story.date).toLocaleDateString()}</p>
                <div class="descriptionContainer">
                    <span>Описание:</span>
                        <p>${story.desc}</p>
                </div>
                <div class="buttonContainer">
                    <span class="likeCount" id="likeCount-${story._id}">${story.likesCount || 0}</span>
                    <img class="LikeButton" src="/src/icons/heart.png" alt="Like" onclick="toggleLike(${story._id}, ${story.likesCount})" style="cursor: pointer; width: 20px; height: 20px;">
                    <span class="likeCount" id="commentsCount-${story._id}">${story.comments.length || 0}</span>
                    <img class="commentButton" src="/src/icons/chat.png" alt="Comment" onclick="toggleComment(${story._id})" style="cursor: pointer; width: 20px; height: 20px;">
                </div>
            `;
            storiesContainer.appendChild(storyElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки историй:', error);
    }
}

function toggleLike(storyId, likesCount) {
    console.log(`Запрос на обновление лайков для истории с ID: ${storyId}`);
    const data = {
        likesCount: likesCount
    };
    fetch(`http://localhost:3000/api/stories/updateById/${storyId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function checkAuth() {
    const token = localStorage.getItem('jwt');
    console.log('Токен из localStorage:', token);  // Логируем токен перед проверкой

    if (!token) {
        window.location.href = 'login.html';
        console.log('Токен отсутствует, редирект на login.html');
        return;
    }

    const payload = parseJwt(token);  // Парсим JWT
    console.log('Payload токена:', payload);  // Логируем полезную нагрузку токена

    if (!payload) { // || isTokenExpired(payload)
        logout();
        console.log('Токен некорректен или просрочен, редирект на login.html');
        return;
    }

    console.log('Пользователь авторизован');
}

// Проверка истечения срока действия токена
function isTokenExpired(payload) {
    if (!payload.exp) {
        console.log('Нет поля exp в токене');
        return true;  // Если нет информации о сроке годности
    }
    const expirationTime = payload.exp * 1000;  // Срок действия токена в миллисекундах
    const currentTime = Date.now();
    return currentTime >= expirationTime;
}

function parseJwt(token) {
    if (!token) {
        console.error('JWT токен не передан');
        return null;  // Если токен пустой или отсутствует
    }


    const parts = token.split('.');  // Разбиваем токен на части
    if (parts.length !== 3) {
        console.error('Неверный формат JWT токена');
        return null;  // Токен не состоит из 3 частей
    }

    const base64Url = parts[1];  // Вторая часть — полезная нагрузка
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');  // Заменяем символы для корректного base64

    try {
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);  // Парсим JSON-полезную нагрузку
    } catch (error) {
        console.error('Ошибка при парсинге полезной нагрузки токена:', error);
        return null;  // Ошибка при декодировании или парсинге
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';  // Редиректим на страницу логина
}
