// i18n - Internationalization module
let currentLanguage = localStorage.getItem('language') || 'en';
let translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`./i18n/${lang}.json`);
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateUILanguage();
    } catch (error) {
        console.error('Failed to load translations:', error);
    }
}

function t(key, placeholders = {}) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    if (!value) {
        console.warn(`Translation key not found: ${key}`);
        return key;
    }
    
    if (typeof value !== 'string') return value;
    
    // Replace placeholders like {seconds} or {player}
    for (const [placeholder, replacement] of Object.entries(placeholders)) {
        value = value.replace(`{${placeholder}}`, replacement);
    }
    
    return value;
}

function updateUILanguage() {
    // Update page title
    document.title = t('app_title');
    
    // Update UI game logos (titles)
    document.querySelectorAll('.game-logo').forEach(logo => {
        logo.textContent = t('app_title');
    });
    
    // Update button texts and content
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.textContent = currentLanguage === 'en' ? 'HR' : 'EN';
        langBtn.title = currentLanguage === 'en' ? 'Prebaci na Hrvatski' : 'Switch to English';
    }
    
    // Update menu buttons
    document.getElementById('new-game-btn').textContent = t('menu.new_game');
    document.getElementById('online-game-btn').textContent = t('menu.online_game');
    document.getElementById('leaderboard-btn').textContent = t('menu.leaderboard');
    
    // Auth screen
    document.getElementById('auth-status').textContent = t('auth.message');
    document.getElementById('sign-in-btn').textContent = t('auth.sign_in_google');
    document.getElementById('auth-cancel-btn').textContent = t('auth.cancel');
    
    // Lobby
    document.getElementById('sign-out-btn').textContent = t('lobby.sign_out');
    document.getElementById('create-casual-btn').textContent = t('lobby.create_casual');
    document.getElementById('create-ranked-btn').textContent = t('lobby.create_ranked');
    document.getElementById('join-game-btn').textContent = t('lobby.join_game');
    document.getElementById('online-leaderboard-btn').textContent = t('lobby.online_leaderboard');
    document.getElementById('online-back-btn').textContent = t('lobby.back');
    document.getElementById('confirm-create-btn').textContent = t('lobby.create_button');
    document.getElementById('cancel-create-btn').textContent = t('lobby.cancel_button');
    document.getElementById('cancel-wait-btn').textContent = t('lobby.cancel_button');
    document.getElementById('confirm-join-btn').textContent = t('lobby.join_button');
    document.getElementById('cancel-join-btn').textContent = t('lobby.cancel_button');
    
    // Game dialog
    document.querySelector('#name-dialog .dialog-content h2').textContent = t('game.new_game_dialog');
    document.querySelector('label[for="player1-name"]').textContent = t('game.player1_name');
    document.querySelector('label[for="player2-name"]').textContent = t('game.player2_name');
    document.querySelector('label[for="grid-size-select"]').textContent = t('game.grid_size_label');
    document.getElementById('player1-name').placeholder = t('game.player1_placeholder');
    document.getElementById('player2-name').placeholder = t('game.player2_placeholder');
    document.getElementById('start-btn').textContent = t('game.start_button');
    document.getElementById('cancel-btn').textContent = t('game.cancel_button');
    
    // Game over dialog
    document.getElementById('game-over-title').textContent = t('game.game_over_title');
    document.getElementById('new-game-after-btn').textContent = t('game.new_game_button');
    document.getElementById('menu-btn').textContent = t('game.main_menu_button');
    
    // Leaderboard
    document.querySelector('#leaderboard-dialog .dialog-content h2').textContent = t('leaderboard.title');
    document.getElementById('close-leaderboard-btn').textContent = t('leaderboard.close_button');
    
    // Reset dialog
    document.querySelector('#confirm-reset-dialog .dialog-content h2').textContent = t('game.confirm_reset_title');
    document.querySelector('#confirm-reset-dialog .dialog-content p').textContent = t('game.confirm_reset_message');
    document.getElementById('confirm-reset-btn').textContent = t('game.yes_button');
    document.getElementById('cancel-reset-btn').textContent = t('game.no_button');
    
    // Rules dialog
    document.querySelector('#rules-dialog .dialog-content h2').textContent = t('rules.title');
    document.querySelector('#rules-dialog .dialog-content p').textContent = t('rules.description');
    document.getElementById('close-rules-btn').textContent = t('rules.close_button');
    
    // Info dialog
    document.getElementById('close-info-btn').textContent = t('notifications.ok_button') || 'OK';
    
    // Game controls
    document.getElementById('reset-btn').textContent = t('game.reset_button');
    document.getElementById('back-to-menu-btn').textContent = t('game.back_to_menu_button');
    
    // Lobby labels
    const createModeLabel = document.getElementById('create-mode-label');
    if (createModeLabel) {
        createModeLabel.textContent = t('lobby.game_options');
    }
    
    const gridSizeLabel = document.querySelector('label[for="lobby-grid-size"]');
    if (gridSizeLabel) {
        gridSizeLabel.textContent = t('lobby.grid_size');
    }
    
    const timerLabel = document.getElementById('online-timer-label-text');
    if (timerLabel) {
        timerLabel.textContent = t('lobby.timer_label');
    }
    
    const localTimerLabel = document.getElementById('local-timer-label-text');
    if (localTimerLabel) {
        localTimerLabel.textContent = t('game.timer_label');
    }
    
    const roomCodeLabel = document.querySelector('label[for="room-code-input"]');
    if (roomCodeLabel) {
        roomCodeLabel.textContent = t('lobby.room_code');
    }
    
    const roomCodeInput = document.getElementById('room-code-input');
    if (roomCodeInput) {
        roomCodeInput.placeholder = t('lobby.room_code_input_placeholder');
    }

    // Re-render game status if a game is active so that "Player 1 - Place a dot" immediately translates
    if (typeof window.updateStatus === 'function' && document.getElementById('game-area')?.style.display === 'block') {
        window.updateStatus();
    }

    // Update native Electron menu bar
    if (typeof require !== 'undefined') {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('update-menu', translations.menu_bar || {});
    }
}

// Theme toggle
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (!themeToggleBtn) return;
    
    const savedTheme = localStorage.getItem('sakupljac_theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('sakupljac_theme', isDarkMode ? 'dark' : 'light');
        themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
    });
}

// Language toggle
function initLanguageToggle() {
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    langToggleBtn.addEventListener('click', async () => {
        const newLang = currentLanguage === 'en' ? 'hr' : 'en';
        await loadTranslations(newLang);
    });
}

// Initialize i18n on page load
window.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations(currentLanguage);
    initThemeToggle();
    initLanguageToggle();
});

// Export for use in other scripts
window.i18n = { t, currentLanguage, updateUILanguage };
