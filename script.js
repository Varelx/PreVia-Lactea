import { categories } from './prompts.js';

// Variables globales para que sean accesibles en todo el script
let currentCategoryKey = null;
let currentTone = 'normal';
let seenPrompts = [];
let players = [];

document.addEventListener('DOMContentLoaded', () => {
    const gamePicker = document.getElementById('gamePicker');
    const gameView = document.getElementById('gameView');
    const gameTitle = document.getElementById('gameTitle');
    const gameSubtitle = document.getElementById('gameSubtitle');
    const activeQuestion = document.getElementById('activeQuestion');
    const btnNextPrompt = document.getElementById('btnNextPrompt');
    const btnBackPicker = document.getElementById('btnBackPicker');
    const toneButtons = document.querySelectorAll('.tone-btn');
    const tiles = document.querySelectorAll('.game-tile');
    const themeToggle = document.getElementById('themeToggle');

    const playerNameInput = document.getElementById('playerNameInput');
    const btnAddPlayer = document.getElementById('btnAddPlayer');
    const playerList = document.getElementById('playerList');

    // Cambiar Tema (Claro / Oscuro)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        themeToggle.textContent = document.body.classList.contains('theme-light') ? '☀️' : '🌙';
    });

    // Seleccionar Juego
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const target = tile.dataset.target;
            openGame(target);
        });
    });

    function openGame(key) {
        currentCategoryKey = key;
        currentTone = 'normal';
        seenPrompts = [];

        toneButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tone === 'normal');
        });

        const category = categories.find(c => c.key === key);
        if (category) {
            gameTitle.textContent = category.label;
            gameSubtitle.textContent = `Modo actual: ${currentTone.toUpperCase()}`;
            renderPrompt();
        }

        gamePicker.setAttribute('aria-hidden', 'true');
        gameView.setAttribute('aria-hidden', 'false');

        const playerSetup = document.getElementById('playerSetup');
        if (key === 'interaccion') {
            playerSetup.style.display = 'flex';
            renderPlayerList();
        } else {
            playerSetup.style.display = 'none';
        }
    }

    // Cambiar Tono
    toneButtons.forEach(button => {
        button.addEventListener('click', () => {
            toneButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTone = button.dataset.tone || 'normal';
            
            gameSubtitle.textContent = `Modo actual: ${currentTone.toUpperCase()}`;
            
            seenPrompts = [];
            renderPrompt();
        });
    });

    // Obtener y Renderizar Siguiente Pregunta
    function getNextPromptText() {
        let pool = [];

        if (currentCategoryKey === 'mix') {
            // Recorre todas las categorías EXCEPTO 'mix' y 'interaccion'
            const otherCategories = categories.filter(c => c.key !== 'mix' && c.key !== 'interaccion');

            otherCategories.forEach(cat => {
                // Filtra las frases que coincidan con el tono actual
                const validPrompts = cat.prompts.filter(item => item.tone === currentTone);
                
                validPrompts.forEach(item => {
                    pool.push({
                        text: item.text,
                        tone: item.tone
                    });
                });
            });
        } else {
            const category = categories.find(c => c.key === currentCategoryKey);
            if (!category) return 'Selecciona un juego válido.';

            // Filtrado estricto por el tono actual seleccionado
            const filtered = category.prompts.filter(item => item.tone === currentTone);
            pool = filtered;
        }

        if (!pool.length) return `No hay preguntas disponibles para el tono "${currentTone}".`;

        const unseen = pool.filter(item => !seenPrompts.includes(item.text));
        const finalPool = unseen.length ? unseen : pool;

        const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
        seenPrompts.push(selected.text);
        let selectedText = selected.text;

        // Reemplazar nombres si es el juego de interacción
        if (currentCategoryKey === 'interaccion') {
            let p1 = 'Jugador 1';
            let p2 = 'Jugador 2';

            if (players.length >= 2) {
                const shuffled = [...players].sort(() => 0.5 - Math.random());
                p1 = shuffled[0];
                p2 = shuffled[1];
            } else if (players.length === 1) {
                p1 = players[0];
                p2 = 'alguien del grupo';
            }

            selectedText = selectedText
                .replace('{p1}', `<strong>${p1}</strong>`)
                .replace('{p2}', `<strong>${p2}</strong>`);
        }

        return selectedText;
    }

    function renderPrompt() {
        activeQuestion.innerHTML = getNextPromptText();
    }

    btnNextPrompt.addEventListener('click', renderPrompt);

    // Volver al Selector
    btnBackPicker.addEventListener('click', () => {
        gamePicker.setAttribute('aria-hidden', 'false');
        gameView.setAttribute('aria-hidden', 'true');
        currentCategoryKey = null;
    });

    // Escape para volver
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            gamePicker.setAttribute('aria-hidden', 'false');
            gameView.setAttribute('aria-hidden', 'true');
        }
    });

    // Gestión de jugadores
    btnAddPlayer.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });

    function addPlayer() {
        const name = playerNameInput.value.trim();
        if (name && !players.includes(name)) {
            players.push(name);
            playerNameInput.value = '';
            renderPlayerList();
            renderPrompt();
        }
    }

    window.removePlayer = function(name) {
        players = players.filter(p => p !== name);
        renderPlayerList();
        renderPrompt();
    }

    function renderPlayerList() {
        playerList.innerHTML = '';
        players.forEach(p => {
            const chip = document.createElement('div');
            chip.className = 'player-chip';
            chip.innerHTML = `${p} <button onclick="removePlayer('${p}')">×</button>`;
            playerList.appendChild(chip);
        });
    }
});