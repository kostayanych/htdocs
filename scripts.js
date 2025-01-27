// scripts.js

// Base URL for API
const API_BASE = "http://localhost:5500/api";

async function getStoryById(storyId) {
    const protocol = 'http'; // или 'https'
    const host = 'localhost'; // замените на ваш хост
    const port = '5500'; // замените на ваш порт

    const url = `${protocol}://${host}:${port}/api/stories/getById/${storyId}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сети: ${response.status} - ${errorText}`);
        }

        const story = await response.json(); // Преобразуем ответ в JSON
        console.log('Полученная история:', story); // Выводим историю в консоль
        return story; // Возвращаем объект истории
    } catch (error) {
        console.error('Ошибка при получении истории:', error);
    }
}



// Fetch and display stories
let likedStories = new Set(); // Множество для отслеживания, какие истории были лайкнуты

async function loadStories(filters = {}) {
    try {
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
                    <img class="LikeButton" src="/src/icons/heart.png" alt="Like" onclick="toggleLike('${story._id}')" style="cursor: pointer; width: 20px; height: 20px;">
                    <span class="likeCount" id="commentsCount-${story._id}">${story.comments.length || 0}</span>
                    <img class="commentButton" src="/src/icons/chat.png" alt="Comment" onclick="toggleComment('${story._id}')" style="cursor: pointer; width: 20px; height: 20px;">
                </div>
                <div class="commentsContainer" id="commentsContainer-${story._id}" style="display: none;">
                    <h4>Комментарии:</h4>
                    <div class="commentsList" id="commentsList-${story._id}">
                        ${story.comments.map(comment => `<p>${comment.content}</p>`).join('')}
                    </div>
                    <textarea id="commentInput-${story._id}" placeholder="Введите ваш комментарий..."></textarea>
                    <button onclick="addComment('${story._id}')">Добавить комментарий</button>
                </div>
            `;
            storiesContainer.appendChild(storyElement);
            //console.log(story.comments);
        });
    } catch (error) {
        console.error('Ошибка загрузки историй:', error);
    }
    
}

function toggleComment(storyId) {
    const commentsContainer = document.getElementById(`commentsContainer-${storyId}`);
    
    if (commentsContainer.style.display === 'none' || commentsContainer.style.display === '') {
        commentsContainer.style.display = 'block'; // Показываем комментарии
    } else {
        commentsContainer.style.display = 'none'; // Скрываем комментарии
    }
}

async function addComment(storyId) {
    const commentInput = document.getElementById(`commentInput-${storyId}`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Пожалуйста, введите комментарий.');
        return;
    }
    
    // Создаем объект автора
    const author = {
        name: 'TestNAME1', // Имя автора
        surname: 'TestSURNAME1', // Фамилия автора
        lastName: 'TestLASTNAME1', // Отчество автора
        position: {
            department: 'test department',
            position: 'test position',
            cmd: 'test cmd'
        }
    };

    // Создаем объект комментария
    const newComment = {
        date: new Date().toISOString(), // Получаем текущую дату в формате ISO
        author: author,
        content: commentText + '\nКомментарий был оставлен - ' + author.name + ' ' + author.surname // Содержимое комментария
    };

    const comments = [];
    const story = await getStoryById(storyId); // Дожидаемся получения истории
    if (story) {
        story.comments.forEach(comment => {
            comments.push(comment);
        });
        comments.push(newComment); // Добавляем новый комментарий
    }
    console.log('final', comments);

    try {
        const response = await fetch(`http://localhost:5500/api/stories/updateById/${storyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comments: comments }) // Отправляем обновленный массив комментариев
        });

        // Проверяем статус ответа
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка сети: ${response.status} - ${errorText}`);
        }

        // Добавляем комментарий в список комментариев на клиенте
        const commentsList = document.getElementById(`commentsList-${storyId}`);
        commentsList.innerHTML += `<div>${commentText}</div><div>Комментарий был оставлен - ${author.name} ${author.surname}</div>`; // Используем <div> для разделения строк
        commentInput.value = ''; // Очищаем текстовое поле

    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
    }
}


async function toggleLike(storyId) {
    const likeCountElement = document.getElementById(`likeCount-${storyId}`);
    const currentLikesCount = parseInt(likeCountElement.textContent);
    let newLikesCount;

    // Проверим, лайкнули ли мы эту историю
    if (likedStories.has(storyId)) {
        // Если лайкнули, убираем лайк
        newLikesCount = currentLikesCount - 1;
        likedStories.delete(storyId); // Удаляем из множества лайкнутых
    } else {
        // Если не лайкнули, добавляем лайк
        newLikesCount = currentLikesCount + 1;
        likedStories.add(storyId); // Добавляем в множество лайкнутых
    }

    // Обновляем отображение лайков сразу
    likeCountElement.textContent = newLikesCount;

    try {
        const response = await fetch(`http://localhost:5500/api/stories/updateById/${storyId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ likesCount: newLikesCount })
        });

        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.status);
        }
    } catch (error) {
        console.error('Ошибка при обновлении лайков:', error);
        // В случае ошибки откатываем изменение
        likeCountElement.textContent = currentLikesCount; // Вернуть к предыдущему значению
        if (likedStories.has(storyId)) {
            likedStories.delete(storyId);
        } else {
            likedStories.add(storyId);
        }
    }
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
