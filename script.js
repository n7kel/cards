document.addEventListener("DOMContentLoaded", function() {
    // --- Экраны и панели ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");

    // --- Все кнопки ---
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const createLobbyButton = document.getElementById("create-lobby-btn");

    // --- Поле для ввода ставки ---
    const stakeInput = document.getElementById('stake-input');

    // --- НАША НОВАЯ ЛОГИКА ДЛЯ МИНИМАЛЬНОЙ СТАВКИ ---
    if (stakeInput) {
        stakeInput.addEventListener('change', function() {
            // Проверяем, если введенное значение меньше 20
            if (parseInt(stakeInput.value) < 20) {
                stakeInput.value = '20'; // Автоматически исправляем на 20
            }
        });
    }
    // ----------------------------------------------------

    // --- Логика переключения кнопок кол-ва игроков ---
    const playerCountSelector = document.querySelector(".player-count-selector");
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
        
        if (createLobbyButton) {
            createLobbyButton.addEventListener("click", function() {
                let stakeAmount = stakeInput ? parseInt(stakeInput.value) : 20;
                // Дополнительная проверка на случай, если пользователь ввел некорректное значение
                if (stakeAmount < 20) {
                    stakeAmount = 20;
                }
                
                const activePlayerOption = document.querySelector(".player-option.active");
                const playerCount = activePlayerOption ? activePlayerOption.textContent : '2';
                const lobbyData = { stake: stakeAmount.toString(), players: playerCount };

                tg.sendData(JSON.stringify(lobbyData));
                tg.close();
            });
        }
    }
});