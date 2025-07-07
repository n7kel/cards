document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    let userTelegramId = null; 

    // --- Элементы ---
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
    const waitingInfoElement = document.getElementById('waiting-info');
    const findLobbyButton = document.getElementById("find-lobby-btn");
    const createLobbyButton = document.getElementById("create-lobby-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const balanceButton = document.getElementById("balance-btn");
    const backToMenuFromLobbyBtn = document.getElementById("back-to-menu-from-lobby-btn");
    const backToMenuFromListBtn = document.getElementById("back-to-menu-from-list-btn");
    const backToMenuFromPaymentBtn = document.getElementById("back-to-menu-from-payment-btn");
    const cancelLobbyButton = document.getElementById("cancel-lobby-btn");

    // --- WebSocket ---
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
            const message = JSON.parse(event.data);
            if (message.action === 'update_lobbies') {
                updateLobbiesList(message.lobbies);
            } else if (message.action === 'lobby_update') {
                if (waitingInfoElement) {
                    waitingInfoElement.innerHTML = `Ожидание игроков...<br>Игроков: ${message.current_players}/${message.total_players}`;
                }
            } else if (message.action === 'game_start') {
                showScreen(allPanels.game);
                const gameInfoElement = document.getElementById('game-info');
                if (gameInfoElement) {
                    gameInfoElement.textContent = `Игра началась в лобби ${message.lobby_owner_id} с игроками: ${message.players.join(', ')}`;
                }
                if (tg) tg.showAlert("Игра началась!");
            }
        };
        ws.onclose = () => setTimeout(connect, 3000);
        ws.onerror = (error) => console.error("WebSocket error:", error);
    }
    if (tg) { connect(); }

    // --- UI Logic ---
    function showScreen(panelToShow) {
        Object.values(allPanels).forEach(p => { if (p) p.style.display = "none"; });
        if (panelToShow) panelToShow.style.display = "block";
    }

    function updateLobbiesList(lobbies) {
        if (!lobbiesContainer) return;
        lobbiesContainer.innerHTML = '';
        if (!lobbies || lobbies.length === 0) {
            lobbiesContainer.innerHTML = '<p class="no-lobbies-message">Активных лобби нет. Создайте своё!</p>';
            return;
        }
        lobbies.forEach(lobby => {
            if (lobby.owner_id === userTelegramId) return;
            const lobbyCard = document.createElement('div');
            lobbyCard.className = 'lobby-card wood-button';
            const isFull = lobby.players_joined >= lobby.players_needed;
            lobbyCard.innerHTML = `
                <div class="wood-grain"></div>
                <div class="button-content" style="flex-direction: column; align-items: flex-start; padding: 10px; width: 100%;">
                    <p>Владелец: ${lobby.owner_id}</p>
                    <p>Ставка: ${lobby.stake} звёзд</p>
                    <p>Игроков: ${lobby.players_joined}/${lobby.players_needed}</p>
                    <button class="join-lobby-btn" data-owner-id="${lobby.owner_id}" ${isFull ? 'disabled' : ''} style="width: auto; padding: 5px 15px; margin-top: 10px; background: #10b981; border-radius: 5px;">Присоединиться</button>
                </div>
            `;
            lobbiesContainer.appendChild(lobbyCard);
        });
    }

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

    // --- Event Listeners ---
    lobbyButton?.addEventListener("click", () => showScreen(allPanels.create));
    balanceButton?.addEventListener("click", () => showScreen(allPanels.payment));
    findLobbyButton?.addEventListener("click", () => {
        showScreen(allPanels.list);
        if (ws && ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ action: 'request_lobbies' }));
        }
    });
    backToMenuFromLobbyBtn?.addEventListener("click", () => showScreen(allPanels.main));
    backToMenuFromPaymentBtn?.addEventListener("click", () => showScreen(allPanels.main));
    backToMenuFromListBtn?.addEventListener("click", () => showScreen(allPanels.main));
    cancelLobbyButton?.addEventListener("click", () => {
        // TODO: Отправить на сервер сообщение об отмене лобби
        showScreen(allPanels.main);
    });

    createLobbyButton?.addEventListener("click", () => {
        if (validateStake()) {
            const activePlayerOption = playerCountSelector.querySelector(".player-option.active");
            const lobbyData = {
                action: "create_lobby",
                stake: stakeInput.value,
                players: activePlayerOption ? activePlayerOption.textContent.trim() : '2'
            };
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(lobbyData));
                showScreen(allPanels.waiting);
                if (waitingInfoElement) {
                    waitingInfoElement.innerHTML = `Ожидание игроков...<br>Игроков: 1/${lobbyData.players}`;
                }
            }
        }
    });

    lobbiesContainer?.addEventListener('click', (event) => {
        if (event.target.classList.contains('join-lobby-btn')) {
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
    
    playerCountSelector?.addEventListener("click", (event) => {
        if (event.target.classList.contains('player-option')) {
            playerCountSelector.querySelectorAll('.player-option').forEach(button => button.classList.remove('active'));
            event.target.classList.add('active');
        }
    });

    stakeInput?.addEventListener('input', validateStake);
});
