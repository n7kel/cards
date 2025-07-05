// Ждем, когда вся страница полностью загрузится
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

    // --- Поле для ввода ставки и сообщение об ошибке ---
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error');

    // --- ЛОГИКА ДЛЯ ВЫБОРА КОЛИЧЕСТВА ИГРОКОВ ---
    const playerCountSelector = document.querySelector(".player-count-selector");
    if (playerCountSelector) {
        playerCountSelector.addEventListener("click", function(event) {
            // Проверяем, что кликнули именно по кнопке с классом 'player-option'
            if (event.target.classList.contains('player-option')) {
                // Сначала убираем класс 'active' у всех кнопок в этой группе
                playerCountSelector.querySelectorAll('.player-option').forEach(button => {
                    button.classList.remove('active');
                });
                // Затем добавляем класс 'active' только той, по которой кликнули
                event.target.classList.add('active');
            }
        });
    }

    // --- Логика для проверки минимальной ставки ---
    function validateStake() {
        if (!stakeInput) return true; // Если поля нет, то и ошибки нет
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
                if (validateStake()) {
                    const activePlayerOption = document.querySelector(".player-option.active");
                    const playerCount = activePlayerOption ? activePlayerOption.textContent : '2';
                    const lobbyData = { stake: stakeInput.value, players: playerCount };

                    tg.sendData(JSON.stringify(lobbyData));
                    tg.close();
                }
            });
        }
    }
});