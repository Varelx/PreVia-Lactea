let currentGameKey = null;
let currentTone = 'normal';
let currentPool = [];

// Elementos del DOM
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameTitle = document.getElementById('gameTitle');
const activeQuestion = document.getElementById('activeQuestion');
const promptCategoryBadge = document.getElementById('promptCategoryBadge');
const btnNextPrompt = document.getElementById('btnNextPrompt');
const btnBack = document.getElementById('btnBack');

// Inicializar selección de juegos
document.querySelectorAll('.game-tile').forEach(tile => {
    tile.addEventListener('click', () => {
        const target = tile.getAttribute('data-target');
        startGame(target);
    });
});

// Selector de tono (Normal / Hot)
document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTone = btn.getAttribute('data-tone');
        loadPool();
        nextPrompt();
    });
});

btnBack.addEventListener('click', () => {
    gameScreen.classList.remove('active');
    homeScreen.classList.add('active');
    currentGameKey = null;
});

btnNextPrompt.addEventListener('click', nextPrompt);

function startGame(gameKey) {
    currentGameKey = gameKey;
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    if (gameKey === 'mix') {
        gameTitle.textContent = 'Mix de Juegos';
    } else {
        gameTitle.textContent = gameData[gameKey].title;
    }

    loadPool();
    nextPrompt();
}

function loadPool() {
    currentPool = [];
    if (currentGameKey === 'mix') {
        // Combinar prompts de todas las categorías disponibles para el tono actual
        Object.keys(gameData).forEach(key => {
            const promptsOfTone = gameData[key][currentTone] || [];
            promptsOfTone.forEach(text => {
                currentPool.push({
                    text: text,
                    categoryName: gameData[key].title
                });
            });
        });
    } else {
        const promptsOfTone = gameData[currentGameKey][currentTone] || [];
        promptsOfTone.forEach(text => {
            currentPool.push({
                text: text,
                categoryName: gameData[currentGameKey].title
            });
        });
    }
    // Barajar aleatoriamente el mazo
    currentPool.sort(() => Math.random() - 0.5);
}

function nextPrompt() {
    if (currentPool.length === 0) {
        loadPool(); // Recargar si se acaban
    }
    if (currentPool.length === 0) {
        activeQuestion.textContent = "No hay preguntas disponibles para este modo/tono.";
        promptCategoryBadge.style.display = 'none';
        return;
    }

    const item = currentPool.pop();
    activeQuestion.textContent = item.text;

    // Mostrar el badge de categoría si estamos en modo Mix
    if (currentGameKey === 'mix') {
        promptCategoryBadge.textContent = item.categoryName;
        promptCategoryBadge.style.display = 'inline-block';
    } else {
        promptCategoryBadge.style.display = 'none';
    }
}

