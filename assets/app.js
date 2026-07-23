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
  
  const welcome = document.getElementById('welcomeMessage');
  if (welcome) {
    const name = (userData && userData.first_name) || 'Гость';
    welcome.textContent = `Привет, ${name}!`;
  }
}

// ===== ДАННЫЕ ДЛЯ ГРАФИКА =====
const chartData = {
  '1H': [89400,89600,89200,89800,90100,89900,90300,90500,90200,90800,91000,90700,91200,91400,91100,91600,91800,91500,92000,92200,91900,92400,90426],
  '1D': [87200,87800,88500,88100,88900,89500,89100,89800,90400,90000,90700,91200,90800,91500,92000,91600,92200,91800,92500,93000,92600,93200,90426],
  '1W': [82000,83500,84800,84200,85600,86900,86200,87500,88800,88100,89400,90700,90000,91300,92600,91900,93200,92500,93800,94500,93800,95100,90426],
  '1M': [68000,69500,71200,70800,72500,74200,73800,75500,77200,76800,78500,80200,79800,81500,83200,82800,84500,86200,85800,87500,89200,88800,90426],
  '1Y': [42000,43500,44800,46200,45500,47800,49200,48500,50800,52200,51500,53800,55200,54500,56800,58200,57500,59800,61200,60500,62800,64200,90426]
};

let currentPeriod = '1W';

function renderChart(period) {
  const data = chartData[period] || chartData['1W'];
  const width = 370, height = 180, padding = 10;
  const min = Math.min(...data) * 0.998;
  const max = Math.max(...data) * 1.002;
  const range = max - min;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return [x, y];
  });

  function catmullRom(p0, p1, p2, p3, t) {
    const v0x = (p2[0] - p0[0]) * 0.5;
    const v1x = (p3[0] - p1[0]) * 0.5;
    const v0y = (p2[1] - p0[1]) * 0.5;
    const v1y = (p3[1] - p1[1]) * 0.5;
    const t2 = t * t, t3 = t2 * t;
    return [
      (2*t3 - 3*t2 + 1)*p1[0] + (t3 - 2*t2 + t)*v0x + (-2*t3 + 3*t2)*p2[0] + (t3 - t2)*v1x,
      (2*t3 - 3*t2 + 1)*p1[1] + (t3 - 2*t2 + t)*v0y + (-2*t3 + 3*t2)*p2[1] + (t3 - t2)*v1y
    ];
  }

  let lineD = 'M' + points[0][0] + ',' + points[0][1];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let t = 0; t < 1; t += 0.1) {
      const pt = catmullRom(p0, p1, p2, p3, t);
      lineD += ' L' + pt[0].toFixed(1) + ',' + pt[1].toFixed(1);
    }
    lineD += ' L' + p2[0] + ',' + p2[1];
  }

  const areaD = lineD + ' L' + (width-padding) + ',' + height + ' L' + padding + ',' + height + ' Z';

  const lineEl = document.getElementById('chartLine');
  const areaEl = document.getElementById('chartArea');
  if (!lineEl || !areaEl) return;

  lineEl.setAttribute('d', lineD);
  areaEl.setAttribute('d', areaD);

  const len = lineEl.getTotalLength ? lineEl.getTotalLength() : 800;
  lineEl.style.strokeDasharray = len;
  lineEl.style.strokeDashoffset = len;
  lineEl.style.animation = 'none';
  void lineEl.offsetHeight;
  lineEl.style.animation = 'drawLine 1.2s cubic-bezier(0.4,0,0.2,1) forwards';
}

function setPeriod(btn, period) {
  document.querySelectorAll('.chart-period').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod = period;
  renderChart(period);
}

function animateBalance() {
  const el = document.getElementById('balanceValue');
  if (!el) return;
  const target = 24847.65;
  let current = 0;
  const step = target / 60;
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, 16);
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function initChartInteraction() {
  const container = document.getElementById('chartContainer');
  const tooltip = document.getElementById('chartTooltip');
  const dot = document.getElementById('chartDot');
  if (!container || !tooltip || !dot) return;

  function updateTooltip(clientX) {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const data = chartData[currentPeriod] || chartData['1W'];
    const idx = Math.min(Math.max(0, Math.round((x / rect.width) * (data.length - 1))), data.length - 1);
    const val = data[idx];

    tooltip.textContent = '$' + val.toLocaleString();
    tooltip.style.left = x + 'px';
    tooltip.style.top = '50px';
    tooltip.style.opacity = '1';

    const path = document.getElementById('chartLine');
    if (path && path.getPointAtLength) {
      try {
        const len = path.getTotalLength();
        const targetLen = (x / rect.width) * len;
        const p = path.getPointAtLength(Math.max(0, Math.min(len, targetLen)));
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.style.opacity = '1';
      } catch(e) {}
    }
  }

  container.addEventListener('mousemove', (e) => updateTooltip(e.clientX));
  container.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    dot.style.opacity = '0';
  });
  container.addEventListener('touchstart', (e) => { 
    if (e.touches.length > 0) updateTooltip(e.touches[0].clientX); 
  }, { passive: true });
  container.addEventListener('touchmove', (e) => { 
    if (e.touches.length > 0) updateTooltip(e.touches[0].clientX); 
  }, { passive: true });
  container.addEventListener('touchend', () => { 
    tooltip.style.opacity = '0'; 
    dot.style.opacity = '0'; 
  });
}

function initTouchFeedback() {
  document.querySelectorAll('.asset-item, .tx-item, .balance-card, .quick-action, .nav-item, .asset-item').forEach(el => {
    el.addEventListener('touchstart', () => {
      try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
      } catch(e) {}
    }, { passive: true });
  });
}

function openSheet(type) {
  const overlay = document.getElementById('actionSheet');
  const titleEl = document.getElementById('sheetTitle');
  const contentEl = document.getElementById('sheetContent');
  if (!overlay || !titleEl || !contentEl) return;

  const configs = {
    send: { title: 'Отправить', inputs: ['Адрес получателя', 'Сумма'] },
    receive: { title: 'Получить', inputs: ['Ваш адрес кошелька', 'Сумма (опционально)'] },
    swap: { title: 'Обмен', inputs: ['Отдаёте (USDT)', 'Получаете (SOL)'] }
  };

  const config = configs[type] || configs.send;
  titleEl.textContent = config.title;

  let inputsHtml = '';
  config.inputs.forEach((ph, i) => {
    inputsHtml += '<input type="text" class="sheet-input" placeholder="' + ph + '" id="sheetInput' + i + '">';
  });
  contentEl.innerHTML = inputsHtml + '<button class="sheet-btn" onclick="confirmAction()">Подтвердить</button>';

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  const overlay = document.getElementById('actionSheet');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function confirmAction() {
  const btn = document.querySelector('.sheet-btn');
  if (!btn) return;
  btn.textContent = '✓ Успешно';
  btn.classList.add('success');
  setTimeout(() => closeSheet(), 800);
}

function initSheetSwipe() {
  const sheetPanel = document.getElementById('sheetPanel');
  if (!sheetPanel) return;
  let startY = 0, currentY = 0;
  sheetPanel.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    sheetPanel.style.transition = 'none';
  }, { passive: true });
  sheetPanel.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) sheetPanel.style.transform = 'translateY(' + diff + 'px)';
  }, { passive: true });
  sheetPanel.addEventListener('touchend', () => {
    const diff = currentY - startY;
    sheetPanel.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
    if (diff > 80) {
      closeSheet();
    } else {
      sheetPanel.style.transform = 'translateY(0)';
    }
    setTimeout(() => { sheetPanel.style.transform = ''; }, 300);
  });
}

// ===== НАВИГАЦИЯ =====
function goToPage(page) {
  if (page === 'profile') {
    window.location.href = 'pages/profile.html';
  } else if (page === 'staking') {
    window.location.href = 'pages/staking.html';
  } else if (page === 'buy') {
    window.location.href = 'pages/buy.html';
  } else if (page === 'bridge') {
    window.location.href = 'pages/bridge.html';
  } else if (page === 'market') {
    window.location.href = 'pages/market.html';
  } else if (page === 'swap') {
    window.location.href = 'pages/swap.html';
  } else if (page === 'discover') {
    window.location.href = 'pages/discover.html';
  } else if (page === 'history') {
    window.location.href = 'pages/history.html';
  } else if (page === 'nft') {
    window.location.href = 'pages/nft.html';
  } else {
    window.location.href = 'pages/' + page + '.html';
  }
}

function goToAsset(asset) {
  window.location.href = 'pages/asset.html?coin=' + asset;
}

function copyAddress() {
  const address = '0x7a3B...f2E1';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(address).then(() => {
      showToast('Адрес скопирован!');
    });
  } else {
    showToast('Адрес: ' + address);
  }
}

function showNotifications() {
  showToast('Уведомлений нет');
}

function showTxDetail(txId) {
  showToast('Транзакция: ' + txId);
}

function showToast(message) {
  const container = document.createElement('div');
  container.className = 'toast-custom';
  container.textContent = message;
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 2200);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  updateUserUI();
  renderChart('1W');
  animateBalance();
  initScrollReveal();
  initChartInteraction();
  initTouchFeedback();
  initSheetSwipe();

  try {
    if (tg && tg.BackButton) {
      tg.BackButton.onClick(() => {
        window.history.back();
      });
    }
  } catch(e) {}
});
