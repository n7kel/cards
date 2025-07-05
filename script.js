document.addEventListener("DOMContentLoaded", function() {
    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");

    // --- Кнопки для переключения экранов ---
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");

    // --- НАША НОВАЯ ЛОГИКА ДЛЯ ВЫБОРА ИГРОКОВ ---
    const playerCountSelector = document.querySelector(".player-count-selector");
    if (playerCountSelector) {
        playerCountSelector.addEventListener("click", function(event) {
            // Проверяем, что кликнули именно по кнопке
            if (event.target.classList.contains('player-option')) {
                // Сначала убираем класс 'active' у всех кнопок
                playerCountSelector.querySelectorAll('.player-option').forEach(button => {
                    button.classList.remove('active');
                });
                // Затем добавляем класс 'active' только той, по которой кликнули
                event.target.classList.add('active');
            }
        });
    }
    // ------------------------------------------

    // --- Функции и обработчики (остальной код без изменений) ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, paymentPanel].forEach(panel => {
            if (panel) panel.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }

    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));

    // Код для заглушек и отправки данных
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if (tg) {
        // ... (остальной код для кнопок "Играть", "Друзья" и т.д. остается без изменений)
        const playButton = document.getElementById("play-btn");
        const friendsButton = document.getElementById("friends-btn");
        const createLobbyButton = document.getElementById("create-lobby-btn");
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
        if (createLobbyButton) {
            createLobbyButton.addEventListener("click", function() {
                const stakeInput = document.getElementById('stake-input');
                const stakeAmount = stakeInput ? stakeInput.value : '0';
                const activePlayerOption = document.querySelector(".player-option.active");
                const playerCount = activePlayerOption ? activePlayerOption.textContent : '2';
                const lobbyData = { stake: stakeAmount, players: playerCount };
                tg.sendData(JSON.stringify(lobbyData));
            });
        }
    }
});