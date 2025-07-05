document.addEventListener("DOMContentLoaded", function() {
    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;

    function connect() {
        // Указываем адрес нашего WebSocket-сервера на локальном компьютере
        ws = new WebSocket("ws://localhost:8765");

        ws.onopen = function() {
            console.log("WebSocket connection established");
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            // В будущем здесь будем обрабатывать ответы от сервера
        };

        ws.onclose = function() {
            console.log("WebSocket connection closed. Reconnecting...");
            // Пытаемся переподключиться через 3 секунды
            setTimeout(connect, 3000); 
        };

        ws.onerror = function(error) {
            console.error("WebSocket error: ", error);
        };
    }

    connect(); // Запускаем соединение при загрузке страницы

    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");

    // --- Все кнопки ---
    const createLobbyButton = document.getElementById("create-lobby-btn");
    // ... (остальные переменные для кнопок)
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");

    // --- Логика переключения экранов (без изменений) ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, paymentPanel, waitingPanel].forEach(p => {
            if (p) p.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }
    
    // --- Обработчики кликов ---
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => showScreen(mainMenuPanel));

    // --- ГЛАВНАЯ ЛОГИКА: СОЗДАНИЕ ЛОББИ ЧЕРЕЗ WEBSOCKET ---
    if (createLobbyButton) {
        createLobbyButton.addEventListener("click", function() {
            // ... (проверка ставки, сбор данных)
            const stakeInput = document.getElementById('stake-input');
            const activePlayerOption = document.querySelector(".player-option.active");
            const lobbyData = {
                action: "create_lobby", // Добавляем команду для сервера
                stake: stakeInput.value,
                players: activePlayerOption ? activePlayerOption.textContent : '2'
            };

            // Отправляем данные по нашей "телефонной линии"
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(lobbyData));
                showScreen(waitingPanel); // Переключаемся на экран ожидания
            } else {
                alert("Не удалось подключиться к серверу. Попробуйте перезагрузить.");
            }
        });
    }
});