// scripts.js

// Base URL for API
const API_BASE = "http://localhost:3000/api";



// Fetch and display stories
async function loadStories(filters = {}) {
    try {
        // Создаем строку параметров для фильтров
        const params = new URLSearchParams(filters).toString();
        const response = await fetch(`http://localhost:3000/api/stories/getByFilters?${params}`);
        console.log(`Запрос к API: /api/stories/getByFilters?${params}`);


        if (!response.ok) {
            throw new Error('Ошибка сети: ' + response.status);
        }

        const stories = await response.json();
        const storiesContainer = document.getElementById('storiesContainer');
        storiesContainer.innerHTML = ''; // Очистка контейнера перед загрузкой

        if (stories.length === 0) {
           storiesContainer.innerHTML = '<p>Истории не найдены.</p>';
        }

        stories.forEach(story => {
            const storyElement = document.createElement('div');
            storyElement.classList.add('storyCard')
            storyElement.innerHTML = `
                <h3>${story.name}</h3>
                <p>Автор: ${story.author.name} ${story.author.surname}</p>
                <p>Дата: ${new Date(story.date).toLocaleDateString()}</p>
                <p>Описание: ${story.desc}</p>
                <div class="buttonContainer">
                    <span class="likeCount" id="likeCount-${story._id}">${story.likesCount}</span>
                    <img class="LikeButton" src="/src/icons/heart.png" alt="Like" onclick="toggleLike(${story._id})" style="cursor: pointer; width: 20px; height: 20px;"></img>
                    <span class="likeCount" id="commentsCount-${story._id}">${story.comments.length}</span>
                    <img class="commentButton" src="/src/icons/chat.png" alt="Comment" onclick="toggleComment(${story._id})" style="cursor: pointer; width: 20px; height: 20px;"></img>
                </div>
            `;
            storiesContainer.appendChild(storyElement);
        });
    } catch (error) {
        console.error('Ошибка загрузки историй:', error);
    }
}

function toggleLike(storyId) {
    fetch(`http://localhost:3000/api/stories/updateById/${storyId}`, {method: `PUT`})
        .then(response => response.json())
        .then(data => {
            const likeCountElement = document.getElementById(`likeCount-${storyId}`);
            likeCountElement.textContent = `${data.newLikesCount}`;
        })
        .catch(error => console.error('Ошибка при обновлении лайков:', error));
}