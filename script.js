// Ждем, когда вся страница полностью загрузится
document.addEventListener("DOMContentLoaded", function() {

    // --- НАХОДИМ ВСЕ НАШИ ЭКРАНЫ ---
    const mainMenuPanel = document.getElementById("main-menu-panel");
    const lobbyCreationPanel = document.getElementById("lobby-creation-panel");
    const paymentPanel = document.getElementById("payment-panel");

    // --- НАХОДИМ ВСЕ НУЖНЫЕ КНОПКИ ---
    const balanceButton = document.getElementById("balance-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const playButton = document.getElementById("play-btn");
    const friendsButton = document.getElementById("friends-btn");

    // Кнопки "Назад"
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    
    // Кнопки на новых экранах
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const buyStarsButton = document.getElementById("buy-stars-btn");


    // --- ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ ---
    function showScreen(panelToShow) {
        // Сначала скроем все панели
        [mainMenuPanel, lobbyCreationPanel, paymentPanel].forEach(panel => {
            if (panel) panel.style.display = "none";
        });
        // Потом покажем нужную
        if (panelToShow) panelToShow.style.display = "block";
    }

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
    if (lobbyButton) lobbyButton.addEventListener("click", () => showScreen(lobbyCreationPanel));
    if (balanceButton) balanceButton.addEventListener("click", () => showScreen(paymentPanel));
    if (backToMenuFromLobbyBtn) backToMenuFromLobbyBtn.addEventListener("click", () => showScreen(mainMenuPanel));
    if (backToMenuFromPaymentBtn) backToMenuFromPaymentBtn.addEventListener("click", () => showScreen(mainMenuPanel));


    // --- ОБРАБОТЧИКИ ДЛЯ ОСТАЛЬНЫХ КНОПОК (пока заглушки) ---
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        if (playButton) playButton.addEventListener("click", () => tg.showAlert("Кнопка 'Играть' в разработке!"));
        if (friendsButton) friendsButton.addEventListener("click", () => tg.showAlert("Кнопка 'Друзья' в разработке!"));
        if (createLobbyButton) createLobbyButton.addEventListener("click", () => tg.showAlert("Лобби создано! (заглушка)"));
        
        if (buyStarsButton) {
            buyStarsButton.addEventListener("click", () => {
                const amountInput = document.getElementById('amount-input');
                const amount = amountInput ? amountInput.value : '0';
                tg.showAlert(`Покупка ${amount} Stars! (Интеграция с Telegram Payments в разработке)`);
            });
        }
    } else {
        console.log("Running in browser mode. Some features are disabled.");
    }
});