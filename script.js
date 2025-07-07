document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    let userTelegramId = null; 

    // --- Экраны и элементы ---
    const allPanels = {
        main: document.getElementById("main-menu-panel"),
        list: document.getElementById("lobby-list-panel"),
        create: document.getElementById("lobby-creation-panel"),
        payment: document.getElementById("payment-panel"),
        waiting: document.getElementById("waiting-panel"),
        game: document.getElementById("game-panel")
    };
    const lobbiesContainer = document.getElementById("lobbies-container");
    const stakeInput = document.getElementById('stake-input');
    const stakeError = document.getElementById('stake-error');
    const playerCountSelector = document.querySelector(".player-count-selector");
    const waitingInfo = document.getElementById('waiting-info');

    // --- Кнопки ---
    const buttons = {
        play: document.getElementById("play-btn"),
        lobby: document.getElementById("lobby-btn"),
        findLobby: document.getElementById("find-lobby-btn"), // Находим кнопку "Найти лобби"
        createLobby: document.getElementById("create-lobby-btn"),
        balance: document.getElementById("balance-btn"),
        backFromLobby: document.getElementById("back-to-menu-from-lobby-btn"),
        backFromPayment: document.getElementById("back-to-menu-from-payment-btn"),
        backFromList: document.getElementById("back-to-menu-from-lobby-list-btn"),
        cancelLobby: document.getElementById("cancel-lobby-btn"),
        friends: document.getElementById("friends-btn"),
        buyStars: document.getElementById("buy-stars-btn")
    };
    
    // --- НАСТРОЙКА WEBSOCKET ---
    let ws;
    function connect() {
        // ВАЖНО: Убедитесь, что здесь ваш АКТУАЛЬНЫЙ адрес ngrok!
        const websocketUrl = "wss://f842e332b342.ngrok-free.app"; 
        ws = new WebSocket(websocketUrl);

        ws.onopen = function() {
            console.log("WebSocket connected.");
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                userTelegramId = tg.initDataUnsafe.user.id;
                ws.send(JSON.stringify({ action: 'init', user_id: userTelegramId }));
            }
        };

        ws.onmessage = function(event) {
            console.log("Message from server: ", event.data);
            const data = JSON.parse(event.data);
            
            if (data.action === 'update_lobbies') {
                updateLobbyList(data.lobbies);
            } else if (data.action === 'lobby_update' && waitingInfo) {
                waitingInfo.innerHTML = `Ожидание игроков...<br>${data.current_players}/${data.total_players}`;
            } else if (data.action === 'game_start') {
                if(tg) tg.showAlert("Игра начинается!");
                showScreen(allPanels.game);
                document.getElementById('game-info').textContent = `Игра в лобби ${data.lobby_owner_id} началась!`;
            }
        };
        ws.onclose = () => {
            console.log("WebSocket connection closed. Reconnecting...");
            setTimeout(connect, 3000);
        };
        ws.onerror = (error) => console.error("WebSocket error: ", error);
    }
    if (tg) { connect(); }

    // --- ФУНКЦИЯ: ОБНОВЛЕНИЕ СПИСКА ЛОББИ ---
    function updateLobbyList(lobbies) {
        if (!lobbiesContainer) return;
        lobbiesContainer.innerHTML = ''; 

        if (!lobbies || lobbies.length === 0) {
            lobbiesContainer.innerHTML = '<p class="no-lobbies-message">Активных лобби нет. Создайте своё!</p>';
            return;
        }

        lobbies.forEach(lobby => {
            if (lobby.owner_id === userTelegramId) return; // Не показываем свои же лобби

            const lobbyElement = document.createElement('div');
            lobbyElement.className = 'lobby-card wood-button';
            const isFull = lobby.players_joined >= lobby.players_needed;
            
            lobbyElement.innerHTML = `
                <div class="wood-grain"></div>
                <div class="button-content" style="width: 100%; justify-content: space-between;">
                    <div style="text-align: left;">
                        <p>Ставка: ${lobby.stake} ★</p>
                        <p>Игроков: ${lobby.players_joined}/${lobby.players_needed}</p>
                    </div>
                    <button class="join-lobby-btn" data-owner-id="${lobby.owner_id}" ${isFull ? 'disabled' : ''}>${isFull ? 'Полное' : 'Войти'}</button>
                </div>
            `;
            lobbiesContainer.appendChild(lobbyElement);
        });
    }
    
    // --- Обработчик для кнопок "Войти" ---
    if(lobbiesContainer){
        lobbiesContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('join-lobby-btn') && !event.target.disabled) {
                const ownerId = event.target.dataset.ownerId;
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        action: 'join_lobby',
                        lobby_owner_id: ownerId,
                        user_id: userTelegramId
                    }));
                    showScreen(allPanels.waiting);
                }
            }
        });
    }
    
    // --- Логика переключения экранов ---
    function showScreen(panelToShow) {
        Object.values(allPanels).forEach(p => { if (p) p.style.display = "none"; });
        if (panelToShow) panelToShow.style.display = "block";
    }
    
    buttons.lobby?.addEventListener("click", () => showScreen(allPanels.create));
    buttons.balance?.addEventListener("click", () => showScreen(allPanels.payment));
    buttons.findLobby?.addEventListener("click", () => {
        showScreen(allPanels.list);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'request_lobbies' }));
        }
    });
    buttons.backFromLobby?.addEventListener("click", () => showScreen(allPanels.main));
    buttons.backFromList?.addEventListener("click", () => showScreen(allPanels.main));
    buttons.backFromPayment?.addEventListener("click", () => showScreen(allPanels.main));
    buttons.cancelLobby?.addEventListener("click", () => {
        // TODO: Отправить на сервер сообщение об отмене лобби
        showScreen(allPanels.main);
    });
    
    // --- Остальная логика ---
    // ... (весь остальной код из вашего предыдущего script.js остается здесь)
});
