// ===== TELEGRAM WEB APP INIT =====
let tg = null;
let userData = { first_name: 'Гость', last_name: '', username: '', id: null };

try {
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#F7F9F4');
    tg.setBackgroundColor('#F7F9F4');
    tg.enableClosingConfirmation();
    
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      userData = tg.initDataUnsafe.user;
      console.log('User data from Telegram:', userData);
    }
    console.log('Telegram WebApp initialized');
  }
} catch (e) {
  console.log('Not in Telegram WebApp context');
}

// ===== ОБНОВЛЕНИЕ ИМЕНИ И АВАТАРКИ =====
function updateUserUI() {
  // Обновляем аватар в шапке — логотип
  const avatar = document.querySelector('.header-avatar');
  if (avatar) {
    avatar.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#22C55E"/>
        <path d="M12 6L14.5 11.5L20 12L14.5 14.5L12 20L9.5 14.5L4 12L9.5 11.5L12 6Z" fill="white" opacity="0.9"/>
        <circle cx="12" cy="12" r="2" fill="#22C55E"/>
      </svg>
    `;
    avatar.style.background = 'transparent';
    avatar.style.boxShadow = 'none';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.textContent = '';
  }
  
  // Обновляем приветствие
  const welcome = document.getElementById('welcomeMessage');
  if (welcome) {
    const name = (userData && userData.first_name) || 'Гость';
    welcome.textContent = `Привет, ${name}!`;
  }
}

// ===== ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ =====
// ... (chartData, renderChart и т.д.)

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  updateUserUI();
  renderChart('1W');
  animateBalance();
  initScrollReveal();
  initChartInteraction();
  initTouchFeedback();
  initSheetSwipe();

  if (tg) {
    tg.BackButton.onClick(() => {
      window.history.back();
    });
  }
});
