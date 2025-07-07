document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    let userTelegramId = null; // Для хранения user_id из initData

    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;

    function connect() {
        // ВАЖНО: Этот адрес нужно будет заменить на публичный адрес от ngrok/Cloudflare
        const websocketUrl = "wss://f842e332b342.ngrok-free.app"; // Убедитесь, что это ваш АКТУАЛЬНЫЙ адрес ngrok!
                                                                    // Обновил на последний адрес из вашего вывода
        ws = new WebSocket(websocketUrl);

        ws.onopen = function() {
            console.log("WebSocket connection established. ReadyState:", ws.readyState);
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                userTelegramId = tg.initDataUnsafe.user.id; // Сохраняем user_id
                console.log("Sending init with user_id:", userTelegramId);
                ws.send(JSON.stringify({
                    action: 'init',
                    user_id: userTelegramId
                }));
            }
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            const message = JSON.parse(event.data);

            if (message.action === 'update_lobbies') {
                updateLobbiesList(message.lobbies);
            } else if (message.action === 'lobby_update') {
                // Обновляем информацию на waitingPanel
                const waitingInfoElement = document.getElementById('waiting-info');
                if (waitingInfoElement) {
                    waitingInfoElement.innerHTML = `
                        Ожидание игроков...<br>
                        Игроков: ${message.current_players}/${message.total_players}
                    `;
                }
            } else if (message.action === 'game_start') {
                // Игра началась, переключаем на игровую панель
                showScreen(gamePanel);
                const gameInfoElement = document.getElementById('game-info'); // Предполагается, что на game-panel есть такой элемент
                if (gameInfoElement) {
                    gameInfoElement.textContent = `Игра началась в лобби ${message.lobby_owner_id} с игроками: ${message.players.join(', ')}`;
                }
                if (tg) tg.showAlert("Игра началась!");
            }
            // Здесь могут быть и другие обработчики сообщений от сервера (например, "card_dealt", "player_turn")
        };

        ws.onclose = function(event) {
            console.log("WebSocket connection closed. Code: " + event.code + ", Reason: " + event.reason + ". Reconnecting...");
            if (tg) tg.showAlert("Соединение с игровым сервером потеряно. Пожалуйста, перезагрузите страницу.");
            setTimeout(connect, 3000); 
        };

        ws.onerror = function(error) {
            console.error("WebSocket error: ", error);
            if (tg) tg.showAlert("Не удалось подключиться к игровому серверу. Пожалуйста, перезагрузите страницу.");
        };
    }

    if (tg) {
        connect(); 
    }

    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const lobbyListPanel = document.getElementById("lobby-list-panel"); 
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");
    const gamePanel = document.getElementById("game-panel"); // Добавлено
    const lobbiesContainer = document.getElementById("lobbies-container"); 
    const waitingInfoElement = document.getElementById('waiting-info'); // Получаем ссылку на этот элемент

    // --- Все кнопки ---
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const findLobbyButton = document.getElementById("find-lobby-btn"); 
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const backToMenuFromLobbyListBtn = document.getElementById("back-to-menu-from-lobby-list-btn"); 
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");
    
    // --- Логика переключения экранов ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, lobbyListPanel, paymentPanel, waitingPanel, gamePanel].forEach(p => { 
            if (p) p.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }
    
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => {
        // TODO: Отправить на сервер сообщение об отмене лобби
        if (tg) tg.showAlert("Лобби отменено."); // Временно, пока нет серверной логики отмены
        showScreen(mainMenuPanel);
    });
    if (backToMenuFromLobbyListBtn) backToMenuFromLobbyListBtn.addEventListener("click", () => showScreen(mainMenuPanel)); 

    // Обработчик для кнопки "Найти лобби"
    if (findLobbyButton) {
        findLobbyButton.addEventListener("click", function() {
            showScreen(lobbyListPanel);
            if (ws && ws.readyState === WebSocket.OPEN) {
                 ws.send(JSON.stringify({ action: 'request_lobbies' })); // Запрашиваем список лобби
            } else {
                 if (tg) tg.showAlert("Соединение с сервером не активно. Попробуйте перезагрузить страницу.");
            }
        });
    }

    // --- ГЛАВНАЯ ЛОГИКА: СОЗДАНИЕ ЛОББИ ЧЕРЕЗ WEBSOCKET ---
    if (createLobbyButton) {
        createLobbyButton.addEventListener("click", function() {
            console.log("Attempting to create lobby. WebSocket readyState:", ws ? ws.readyState : "not defined");
            const stakeInput = document.getElementById('stake-input');
            const activePlayerOption = document.querySelector(".player-option.active");
            
            const lobbyData = {
                action: "create_lobby", // Команда для сервера
                stake: stakeInput.value,
                players: activePlayerOption ? activePlayerOption.textContent.trim() : '2'
            };

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(lobbyData));
                showScreen(waitingPanel); // Переключаемся на экран ожидания
                if (waitingInfoElement) {
                    waitingInfoElement.innerHTML = `
                        Ожидание игроков...<br>
                        Игроков: 1/${lobbyData.players}
                    `;
                }
            } else {
                if (tg) tg.showAlert("Не удалось отправить данные. Проверьте соединение.");
                console.error("WebSocket not open for sending. Current state:", ws ? ws.readyState : "not defined");
            }
        });
    }

    // НОВАЯ ФУНКЦИЯ: Обновление списка лобби в UI
    function updateLobbiesList(lobbies) {
        lobbiesContainer.innerHTML = ''; // Очищаем текущий список
        if (lobbies.length === 0) {
            lobbiesContainer.innerHTML = '<p>Пока нет доступных лобби.</p>';
            return;
        }

        lobbies.forEach(lobby => {
            // Исключаем лобби, созданные текущим пользователем, или уже полные
            if (lobby.owner_id === userTelegramId || lobby.is_full) {
                return; // Пропускаем лобби, которые пользователь сам создал или которые полны
            }

            const lobbyCard = document.createElement('div');
            lobbyCard.className = 'lobby-card wood-button'; 
            lobbyCard.innerHTML = `
                <div class="wood-grain"></div>
                <div class="button-content" style="flex-direction: column; align-items: flex-start; padding: 10px;">
                    <p>Владелец: ${lobby.owner_id}</p>
                    <p>Ставка: ${lobby.stake} звёзд</p>
                    <p>Игроков: ${lobby.players_joined}/${lobby.players_needed}</p>
                    <button class="join-lobby-btn wood-button" data-owner-id="${lobby.owner_id}" 
                            style="width: auto; padding: 5px 15px; margin-top: 10px;">Присоединиться</button>
                </div>
            `;
            lobbiesContainer.appendChild(lobbyCard);
        });

        // Добавляем слушателей событий для новых кнопок "Присоединиться"
        document.querySelectorAll('.join-lobby-btn').forEach(button => {
            button.addEventListener('click', function() {
                const ownerId = this.dataset.ownerId;
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        action: 'join_lobby',
                        lobby_owner_id: ownerId,
                        user_id: userTelegramId // Отправляем свой ID, чтобы сервер знал, кто присоединяется
                    }));
                    showScreen(waitingPanel); // Переключаемся на экран ожидания после попытки присоединения
                    if (waitingInfoElement) {
                        // Можно добавить информацию о лобби, к которому присоединились
                        waitingInfoElement.innerHTML = `
                            Вы присоединились к лобби ${ownerId}.<br>
                            Ожидание игроков...
                        `;
                    }
                } else {
                    if (tg) tg.showAlert("Не удалось подключиться к серверу для присоединения к лобби.");
                }
            });
        });
    }

    // Остальная логика (выбор игроков, проверка ставки) остается без изменений
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error');
    const playerCountSelector = document.querySelector(".player-count-selector");

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
    if (stakeInput) {
        stakeInput.addEventListener('input', validateStake);
    }

    if (playerCountSelector) {
        playerCountSelector.addEventListener("click", function(event) {
            if (event.target.classList.contains('player-option')) {
                playerCountSelector.querySelectorAll('.player-option').forEach(button => {
                    button.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        });
    }
});