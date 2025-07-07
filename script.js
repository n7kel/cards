document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    
    // --- Экраны и элементы ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyListPanel = document.getElementById("lobby-list-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");
    const lobbiesContainer = document.getElementById("lobbies-container");

    // --- Кнопки ---
    const playButton = document.getElementById("play-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const balanceButton = document.getElementById("balance-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const backToMenuFromListBtn = document.getElementById("back-to-menu-from-list-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");
    
    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;
    function connect() {
        // ВАЖНО: Убедитесь, что здесь ваш АКТУАЛЬНЫЙ адрес ngrok!
        const websocketUrl = "wss://f842e332b342.ngrok-free.app"; 
        
        ws = new WebSocket(websocketUrl);

        ws.onopen = function() {
            console.log("WebSocket connection established.");
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                ws.send(JSON.stringify({ action: 'init', user_id: tg.initDataUnsafe.user.id }));
                // Сразу после подключения запрашиваем список лобби
                ws.send(JSON.stringify({ action: 'request_lobbies' }));
            }
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            const data = JSON.parse(event.data);

            // --- ОБРАБОТКА СООБЩЕНИЙ ОТ СЕРВЕРА ---
            if (data.action === 'update_lobbies') {
                updateLobbyList(data.lobbies);
            }
        };

        ws.onclose = () => setTimeout(connect, 3000);
        ws.onerror = (error) => {
            console.error("WebSocket error: ", error);
            if(tg) tg.showAlert("Не удалось подключиться к игровому серверу.");
        };
    }
    if (tg) { connect(); }

    // --- НОВАЯ ФУНКЦИЯ: ОБНОВЛЕНИЕ СПИСКА ЛОББИ ---
    function updateLobbyList(lobbies) {
        if (!lobbiesContainer) return;
        lobbiesContainer.innerHTML = ''; // Очищаем старый список

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
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromListBtn) backToMenuFromListBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => showScreen(mainMenuPanel));
    
    // --- Остальная логика ---
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error');
    function validateStake() {
        if (!stakeInput) return true;
        const value = parseInt(stakeInput.value);
        if (isNaN(value) || value < 20) {
            if(stakeError) stakeError.textContent = "Минимальная ставка: 20 звёзд";
            return false;
        } else {
            if(stakeError) stakeError.textContent = "";
            return true;
        }
    }
    if (stakeInput) stakeInput.addEventListener('input', validateStake);

    if (createLobbyButton) {
        createLobbyButton.addEventListener("click", function() {
            if (validateStake()) {
                const activePlayerOption = document.querySelector(".player-option.active");
                const playerCount = activePlayerOption ? activePlayerOption.textContent.trim() : '2';
                const lobbyData = { action: "create_lobby", stake: stakeInput.value, players: playerCount };
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(lobbyData));
                    showScreen(waitingPanel);
                }
            }
        });
    }
});
