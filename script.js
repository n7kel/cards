// Ждем, когда вся страница полностью загрузится
document.addEventListener("DOMContentLoaded", function() {

    // --- ЭКРАНЫ И ПАНЕЛИ ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");
    const waitingPanel = document.getElementById("waiting-panel");

    // --- ВСЕ КНОПКИ ---
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    
    // --- ЭЛЕМЕНТЫ ФОРМ ---
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error');
    const playerCountSelector = document.querySelector(".player-count-selector");

    // --- ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ ---
    function showScreen(panelToShow) {
        [mainMenuPanel, lobbyCreationPanel, paymentPanel, waitingPanel].forEach(panel => {
            if (panel) panel.style.display = "none";
        });
        if (panelToShow) panelToShow.style.display = "block";
    }

    // --- ЛОГИКА ПРОВЕРКИ СТАВКИ ---
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

    // --- ЛОГИКА ВЫБОРА КОЛИЧЕСТВА ИГРОКОВ ---
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

    // --- ОБРАБОТЧИКИ КЛИКОВ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ ---
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (cancelLobbyButton) cancelLobbyButton.addEventListener("click", () => showScreen(mainMenuPanel));

    // --- ЛОГИКА ДЛЯ ОСТАЛЬНЫХ КНОПОК ---
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
        
        // ГЛАВНАЯ ЛОГИКА: СОЗДАНИЕ ЛОББИ
        if (createLobbyButton) {
            createLobbyButton.addEventListener("click", function() {
                if (validateStake()) {
                    const activePlayerOption = document.querySelector(".player-option.active");
                    const playerCount = activePlayerOption ? activePlayerOption.textContent : '2';
                    const lobbyData = { stake: stakeInput.value, players: playerCount };

                    // Отправляем данные боту
                    tg.sendData(JSON.stringify(lobbyData));
                    
                    // Вместо закрытия показываем экран ожидания
                    showScreen(waitingPanel);
                }
            });
        }
    }
});