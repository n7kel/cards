document.addEventListener("DOMContentLoaded", function() {
    // --- Экраны и элементы ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error'); // Находим элемент для ошибки
    const createLobbyButton = document.getElementById("create-lobby-btn");

    // --- Кнопки ---
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    
    // --- НАША НОВАЯ ЛОГИКА ПРОВЕРКИ СТАВКИ ---
    function validateStake() {
        const value = parseInt(stakeInput.value);
        if (isNaN(value) || value < 20) {
            stakeError.textContent = "Минимальная ставка: 20 звёзд"; // Показываем ошибку
            return false; // Ставка неверная
        } else {
            stakeError.textContent = ""; // Прячем ошибку
            return true; // Ставка верная
        }
    }

    if (stakeInput) {
        stakeInput.addEventListener('input', validateStake); // Проверяем при каждом вводе
    }
    // ------------------------------------------

    // --- Функции для переключения экранов ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, paymentPanel].forEach(panel => {
            if (panel) panel.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }

    // --- Обработчики для переключения экранов ---
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));

    // --- Логика для остальных кнопок ---
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if (tg) {
        if (createLobbyButton) {
            createLobbyButton.addEventListener("click", function() {
                // Перед отправкой еще раз проверяем ставку
                if (validateStake()) {
                    const stakeAmount = stakeInput.value;
                    const activePlayerOption = document.querySelector(".player-option.active");
                    const playerCount = activePlayerOption ? activePlayerOption.textContent : '2';
                    const lobbyData = { stake: stakeAmount, players: playerCount };

                    tg.sendData(JSON.stringify(lobbyData));
                    tg.close();
                }
            });
        }
        // ... (остальные обработчики без изменений)
        const playButton = document.getElementById("play-btn");
        const friendsButton = document.getElementById("friends-btn");
        const buyStarsButton = document.getElementById("buy-stars-btn");

        if (playButton) playButton.addEventListener("click", () => tg.showAlert("Кнопка 'Играть' в разработке!"));
        if (friendsButton) friendsButton.addEventListener("click", () => tg.showAlert("Кнопка 'Друзья' в разработке!"));
        if (buyStarsButton) {
            buyStarsButton.addEventListener("click", () => {
                const amountInput = document.getElementById('amount-input');
                const amount = amountInput ? amountInput.value : '0';
                tg.showAlert(`Покупка ${amount} Stars! (Интеграция с Telegram Payments в разработке)`);
            });
        }
    }
});