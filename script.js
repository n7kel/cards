// Ждем, когда вся страница полностью загрузится
document.addEventListener("DOMContentLoaded", function() {

    // --- НАШ НОВЫЙ БЛОК ДЛЯ ВИДЕО ---
    const video = document.getElementById("background-video");
    if (video) {
        // Пытаемся запустить видео. 
        // .play() возвращает "обещание" (Promise), которое может не выполниться
        const promise = video.play();
        if (promise !== undefined) {
            promise.catch(error => {
                // Если автозапуск не сработал (часто на iOS), 
                // мы можем показать статичную картинку или кнопку "Play"
                console.error("Autoplay was prevented:", error);
            });
        }
    }
    // ------------------------------------

    // Находим наши кнопки по их ID
    const playButton = document.getElementById("play-btn");
    const lobbyButton = document.getElementById("lobby-btn");
    const friendsButton = document.getElementById("friends-btn");

    // Используем объект Telegram для показа уведомлений
    const tg = window.Telegram.WebApp;

    // Добавляем "прослушку" клика на кнопку "Играть"
    if (playButton) {
        playButton.addEventListener("click", function() {
            tg.showAlert("Нажата кнопка 'Играть'!");
        });
    }

    // Добавляем "прослушку" клика на кнопку "Создать лобби"
    if (lobbyButton) {
        lobbyButton.addEventListener("click", function() {
            tg.showAlert("Нажата кнопка 'Создать лобби'!");
        });
    }

    // Добавляем "прослушку" клика на кнопку "Друзья"
    if (friendsButton) {
        friendsButton.addEventListener("click", function() {
            tg.showAlert("Нажата кнопка 'Друзья'!");
        });
    }
});// Ждем, когда вся страница полностью загрузится
document.addEventListener("DOMContentLoaded", function() {

    // Проверяем, существует ли объект Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Находим наши кнопки по их ID
        const playButton = document.getElementById("play-btn");
        const lobbyButton = document.getElementById("lobby-btn");
        const friendsButton = document.getElementById("friends-btn");

        // Добавляем "прослушку" клика на кнопку "Играть"
        if (playButton) {
            playButton.addEventListener("click", function() {
                tg.showAlert("Нажата кнопка 'Играть'!");
            });
        }

        // Добавляем "прослушку" клика на кнопку "Создать лобби"
        if (lobbyButton) {
            lobbyButton.addEventListener("click", function() {
                tg.showAlert("Нажата кнопка 'Создать лобби'!");
            });
        }

        // Добавляем "прослушку" клика на кнопку "Друзья"
        if (friendsButton) {
            friendsButton.addEventListener("click", function() {
                tg.showAlert("Нажата кнопка 'Друзья'!");
            });
        }
    } else {
        // Этот блок сработает, если открыть страницу в обычном браузере
        console.log("Telegram WebApp not found. Running in browser mode.");
    }
});