document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    
    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyListPanel = document.getElementById("lobby-list-panel"); // НОВЫЙ ЭКРАН
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");
    const lobbiesContainer = document.getElementById("lobbies-container"); // Контейнер для списка

    // --- Кнопки ---
    const playButton = document.getElementById("play-btn"); // Наша главная кнопка "Играть"
    // (остальные переменные для кнопок)
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const backToMenuFromListBtn = document.getElementById("back-to-menu-from-list-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");
    
    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;
    function connect() {
        const websocketUrl = "wss://10ee-83-172-150-93.ngrok-free.app"; // ВАШ АКТУАЛЬНЫЙ АДРЕС NGROK
        ws = new WebSocket(websocketUrl);

        ws.onopen = function() {
            console.log("WebSocket connection established.");
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                ws.send(JSON.stringify({ action: 'init', user_id: tg.initDataUnsafe.user.id }));
                ws.send(JSON.stringify({ action: 'request_lobbies' }));
            }
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            const data = JSON.parse(event.data);
            if (data.action === 'update_lobbies') {
                updateLobbyList(data.lobbies);
            }
        };
        // ... (onclose, onerror из вашего старого файла)
    }
    if (tg) { connect(); }

    // --- НОВАЯ ФУНКЦИЯ: ОБНОВЛЕНИЕ СПИСКА ЛОББИ ---
    function updateLobbyList(lobbies) {
        if (!lobbiesContainer) return;
        lobbiesContainer.innerHTML = ''; 

        if (!lobbies || lobbies.length === 0) {
            lobbiesContainer.innerHTML = '<p class="no-lobbies-message">Активных лобби нет. Создайте своё!</p>';
            return;
        }

        lobbies.forEach(lobby => {
            const lobbyElement = document.createElement('div');
            lobbyElement.className = 'lobby-item';
            const isFull = lobby.players_joined >= lobby.players_needed;
            const joinButtonHTML = `<button class="join-button" data-lobby-owner-id="${lobby.owner_id}" ${isFull ? 'disabled' : ''}>${isFull ? 'Полное' : 'Войти'}</button>`;

            lobbyElement.innerHTML = `
                <div class="lobby-details">
                    <div class="stake">Ставка: ${lobby.stake} ★</div>
                    <div class="players">Игроков: ${lobby.players_joined}/${lobby.players_needed}</div>
                </div>
                ${joinButtonHTML}
            `;
            lobbiesContainer.appendChild(lobbyElement);
        });
    }
    
    // --- Добавляем обработчик для кнопок "Войти" ---
    if(lobbiesContainer){
        lobbiesContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('join-button')) {
                const lobbyOwnerId = event.target.getAttribute('data-lobby-owner-id');
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        action: 'join_lobby',
                        lobby_owner_id: parseInt(lobbyOwnerId)
                    }));
                    showScreen(waitingPanel);
                }
            }
        });
    }
    
    // --- Логика переключения экранов ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyListPanel, lobbyCreationPanel, paymentPanel, waitingPanel].forEach(p => {
            if (p) p.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }
    
    if (playButton) playButton.addEventListener("click", () => {
        showScreen(lobbyListPanel);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'request_lobbies' }));
        }
    });
    // ... (остальные обработчики переключения из вашего старого файла)
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromListBtn) backToMenuFromListBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => showScreen(mainMenuPanel));
    
    // Остальной код из вашего script.js (создание лобби, проверка ставки и т.д.) остается без изменений
});