import { categories } from './prompts.js';

let currentCategoryKey = null;
let currentTone = 'normal';
let seenPrompts = [];
let players = [];

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentCategoryKey = urlParams.get('cat') || 'mix';

    const gameTitle = document.getElementById('gameTitle');
    const gameSubtitle = document.getElementById('gameSubtitle');
    const activeQuestion = document.getElementById('activeQuestion');
    const cardElement = document.getElementById('cardElement');
    const btnNextPrompt = document.getElementById('btnNextPrompt');
    const toneButtons = document.querySelectorAll('.tone-btn');

    const playerNameInput = document.getElementById('playerNameInput');
    const btnAddPlayer = document.getElementById('btnAddPlayer');
    const playerList = document.getElementById('playerList');
    const playerSetup = document.getElementById('playerSetup');

    // Inicializar vista del juego y alinear textos de forma segura
    const category = categories.find(c => c.key === currentCategoryKey);
    
    if (gameTitle) {
        gameTitle.textContent = category ? category.label : "Juego";
    }
    
    if (gameSubtitle) {
        gameSubtitle.textContent = `Modo actual: ${currentTone.toUpperCase()}`;
    }

    if (activeQuestion) {
        if (category) {
            renderPromptWithAnimation();
        } else {
            activeQuestion.innerHTML = "Categoría no encontrada.";
        }
    }

    if (playerSetup) {
        if (currentCategoryKey === 'interaccion') {
            playerSetup.style.display = 'flex';
            renderPlayerList();
        } else {
            playerSetup.style.display = 'none';
        }
    }

    // Cambiar Tono con animación
    toneButtons.forEach(button => {
        button.addEventListener('click', () => {
            toneButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentTone = button.dataset.tone || 'normal';
            
            if (gameSubtitle) {
                gameSubtitle.textContent = `Modo actual: ${currentTone.toUpperCase()}`;
            }
            
            seenPrompts = [];
            renderPromptWithAnimation();
        });
    });

    function getNextPromptText() {
        let pool = [];

        if (currentCategoryKey === 'mix') {
            const otherCategories = categories.filter(c => c.key !== 'mix' && c.key !== 'interaccion');
            otherCategories.forEach(cat => {
                if (cat.prompts && Array.isArray(cat.prompts)) {
                    const validPrompts = cat.prompts.filter(item => item.tone === currentTone);
                    validPrompts.forEach(item => {
                        pool.push({ text: item.text, tone: item.tone });
                    });
                }
            });
        } else {
            const foundCategory = categories.find(c => c.key === currentCategoryKey);
            if (!foundCategory || !foundCategory.prompts) return 'Selecciona un juego válido.';
            pool = foundCategory.prompts.filter(item => item.tone === currentTone);
        }

        if (!pool.length) return `No hay preguntas disponibles para el tono "${currentTone}".`;

        const unseen = pool.filter(item => !seenPrompts.includes(item.text));
        const finalPool = unseen.length ? unseen : pool;

        const selected = finalPool[Math.floor(Math.random() * finalPool.length)];
        seenPrompts.push(selected.text);
        let selectedText = selected.text;

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

    // Renderizar pregunta aplicando animación fluida estilo carta deslizante
    function renderPromptWithAnimation() {
        if (cardElement) {
            cardElement.style.animation = 'none';
            cardElement.offsetHeight; // Trigger reflow
            cardElement.style.animation = 'cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        }
        if (activeQuestion) {
            activeQuestion.innerHTML = getNextPromptText();
        }
    }

    if (btnNextPrompt) {
        btnNextPrompt.addEventListener('click', renderPromptWithAnimation);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });

    if (btnAddPlayer && playerNameInput) {
        btnAddPlayer.addEventListener('click', addPlayer);
        playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addPlayer();
        });
    }

    function addPlayer() {
        if (!playerNameInput) return;
        const name = playerNameInput.value.trim();
        if (name && !players.includes(name)) {
            players.push(name);
            playerNameInput.value = '';
            renderPlayerList();
            renderPromptWithAnimation();
        }
    }

    window.removePlayer = function(name) {
        players = players.filter(p => p !== name);
        renderPlayerList();
        renderPromptWithAnimation();
    }

    function renderPlayerList() {
        if (!playerList) return;
        playerList.innerHTML = '';
        players.forEach(p => {
            const chip = document.createElement('div');
            chip.className = 'player-chip';
            chip.innerHTML = `${p} <button type="button" onclick="removePlayer('${p}')">×</button>`;
            playerList.appendChild(chip);
        });
    }
});