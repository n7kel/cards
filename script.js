document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    
    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;

    function connect() {
    // ВАЖНО: Этот адрес нужно будет заменить на публичный адрес от Cloudflare
    const websocketUrl = "wss://402e-83-172-150-93.ngrok-free.app"; 
    
    ws = new WebSocket(websocketUrl);

        ws.onopen = function() {
            console.log("WebSocket connection established");
            // Отправляем ID пользователя для инициализации, если мы в Telegram
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                ws.send(JSON.stringify({
                    action: 'init',
                    user_id: tg.initDataUnsafe.user.id
                }));
            }
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            // Здесь будем обрабатывать ответы от сервера
        };

        ws.onclose = function() {
            console.log("WebSocket connection closed. Reconnecting...");
            setTimeout(connect, 3000); 
        };

        ws.onerror = function(error) {
            console.error("WebSocket error: ", error);
            if (tg) tg.showAlert("Не удалось подключиться к игровому серверу. Пожалуйста, перезагрузите страницу.");
        };
    }

    // Запускаем соединение только если мы в Telegram
    if (tg) {
        connect(); 
    }

    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");

    // --- Все кнопки ---
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");
    
    // --- Логика переключения экранов ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, paymentPanel, waitingPanel].forEach(p => {
            if (p) p.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }
    
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => showScreen(mainMenuPanel));

    // --- ГЛАВНАЯ ЛОГИКА: СОЗДАНИЕ ЛОББИ ЧЕРЕЗ WEBSOCKET ---
    if (createLobbyButton) {
        createLobbyButton.addEventListener("click", function() {
            const stakeInput = document.getElementById('stake-input');
            const activePlayerOption = document.querySelector(".player-option.active");
            
            const lobbyData = {
                action: "create_lobby", // Команда для сервера
                stake: stakeInput.value,
                players: activePlayerOption ? activePlayerOption.textContent.trim() : '2'
            };

            // Отправляем данные по нашей "телефонной линии"
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(lobbyData));
                showScreen(waitingPanel); // Переключаемся на экран ожидания
            } else {
                if (tg) tg.showAlert("Не удалось отправить данные. Проверьте соединение.");
            }
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
