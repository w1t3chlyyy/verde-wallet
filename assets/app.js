// ===== TELEGRAM WEB APP INIT =====
let tg = null;
try {
  if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#F7F9F4');
    tg.setBackgroundColor('#F7F9F4');
    tg.enableClosingConfirmation();
    console.log('Telegram WebApp initialized');
  }
} catch (e) {
  console.log('Not in Telegram WebApp context');
}

// ===== CHART DATA =====
const chartData = {
  '1H': [89400,89600,89200,89800,90100,89900,90300,90500,90200,90800,91000,90700,91200,91400,91100,91600,91800,91500,92000,92200,91900,92400,90426],
  '1D': [87200,87800,88500,88100,88900,89500,89100,89800,90400,90000,90700,91200,90800,91500,92000,91600,92200,91800,92500,93000,92600,93200,90426],
  '1W': [82000,83500,84800,84200,85600,86900,86200,87500,88800,88100,89400,90700,90000,91300,92600,91900,93200,92500,93800,94500,93800,95100,90426],
  '1M': [68000,69500,71200,70800,72500,74200,73800,75500,77200,76800,78500,80200,79800,81500,83200,82800,84500,86200,85800,87500,89200,88800,90426],
  '1Y': [42000,43500,44800,46200,45500,47800,49200,48500,50800,52200,51500,53800,55200,54500,56800,58200,57500,59800,61200,60500,62800,64200,90426]
};

let currentPeriod = '1W';

// ===== CHART RENDERING =====
function renderChart(period) {
  const data = chartData[period];
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

  // Animate line
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

// ===== CHART INTERACTION =====
function initChartInteraction() {
  const container = document.getElementById('chartContainer');
  const tooltip = document.getElementById('chartTooltip');
  const dot = document.getElementById('chartDot');
  if (!container || !tooltip || !dot) return;

  function updateTooltip(clientX) {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const data = chartData[currentPeriod];
    const idx = Math.min(Math.max(0, Math.round((x / rect.width) * (data.length - 1))), data.length - 1);
    const val = data[idx];

    tooltip.textContent = '$' + val.toLocaleString();
    tooltip.style.left = x + 'px';
    tooltip.style.top = '50px';
    tooltip.style.opacity = '1';

    const path = document.getElementById('chartLine');
    if (path && path.getPointAtLength) {
      const len = path.getTotalLength();
      const targetLen = (x / rect.width) * len;
      const p = path.getPointAtLength(Math.max(0, Math.min(len, targetLen)));
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      dot.style.opacity = '1';
    }
  }

  container.addEventListener('mousemove', (e) => updateTooltip(e.clientX));
  container.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    dot.style.opacity = '0';
  });

  // Touch support
  container.addEventListener('touchstart', (e) => {
    updateTooltip(e.touches[0].clientX);
  }, { passive: true });
  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateTooltip(e.touches[0].clientX);
  }, { passive: false });
  container.addEventListener('touchend', () => {
    tooltip.style.opacity = '0';
    dot.style.opacity = '0';
  });
}

// ===== BALANCE ANIMATION =====
function animateBalance() {
  const el = document.getElementById('balanceValue');
  if (!el) return;
  const target = 24847.65;
  const duration = 1500;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== SHEET MODAL =====
const sheetConfigs = {
  send: { title: 'Отправить', inputs: ['Адрес получателя', 'Сумма'] },
  receive: { 
    title: 'Получить', 
    inputs: ['Адрес для получения'],
    isReceive: true 
  },
  swap: { title: 'Обмен', inputs: ['Отдаёте', 'Получаете'] }
};

function openSheet(type) {
  const overlay = document.getElementById('actionSheet');
  const titleEl = document.getElementById('sheetTitle');
  const contentEl = document.getElementById('sheetContent');
  if (!overlay || !titleEl || !contentEl) return;

  const config = sheetConfigs[type] || sheetConfigs.send;
  titleEl.textContent = config.title;

  // Генерируем случайный адрес
  const randomAddress = '0x' + Array.from({length: 40}, () => 
    '0123456789abcdef'[Math.floor(Math.random() * 16)]
  ).join('');

  if (config.isReceive) {
    // Специальный интерфейс для получения
    contentEl.innerHTML = `
      <div style="background:var(--bg);border-radius:16px;padding:16px;margin-bottom:16px;word-break:break-all;font-size:14px;color:var(--text-secondary);font-family:monospace;">
        ${randomAddress}
      </div>
      <button class="sheet-btn" onclick="copyReceiveAddress('${randomAddress}')" style="background:var(--green-600);color:#fff;">
        📋 Скопировать адрес
      </button>
      <button class="sheet-btn" onclick="closeSheet()" style="background:transparent;color:var(--text-secondary);margin-top:8px;border:1px solid var(--border);">
        Закрыть
      </button>
    `;
  } else {
    let inputsHtml = '';
    config.inputs.forEach((ph, i) => {
      inputsHtml += '<input type="text" class="sheet-input" placeholder="' + ph + '" id="sheetInput' + i + '">';
    });
    contentEl.innerHTML = inputsHtml + '<button class="sheet-btn" onclick="confirmAction()">Подтвердить</button>';
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Новая функция для копирования адреса
function copyReceiveAddress(address) {
  navigator.clipboard.writeText(address).then(() => {
    showToast('Адрес скопирован!');
    if (tg) tg.HapticFeedback.notificationOccurred('success');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = address;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast('Адрес скопирован!');
  });
}

// ===== NAVIGATION =====
function goToPage(page) {
  const pages = {
    profile: 'pages/profile.html',
    staking: 'pages/staking.html',
    buy: 'pages/buy.html',
    nft: 'pages/nft.html',
    bridge: 'pages/bridge.html'
  };
  if (pages[page]) {
    window.location.href = pages[page];
  }
}

function goToAsset(asset) {
  window.location.href = 'pages/asset.html?coin=' + asset;
}

// ===== TOAST =====
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function copyAddress() {
  showToast('Адрес скопирован!');
  if (tg) tg.HapticFeedback.impactOccurred('medium');
}

function showNotifications() {
  showToast('3 новых уведомления');
  if (tg) tg.HapticFeedback.impactOccurred('light');
}

function showTxDetail(txId) {
  showToast('Транзакция: ' + txId);
}

// ===== TOUCH FEEDBACK =====
function initTouchFeedback() {
  document.querySelectorAll('button, .asset-item, .tx-item, .quick-action, .market-item, .staking-item-btn, .profile-menu-item, .nft-card').forEach(el => {
    el.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.97)';
    }, { passive: true });
    el.addEventListener('touchend', function() {
      const self = this;
      setTimeout(() => { self.style.transform = ''; }, 100);
    }, { passive: true });
  });
}

// ===== SWIPE TO CLOSE SHEET =====
function initSheetSwipe() {
  const sheetPanel = document.getElementById('sheetPanel');
  if (!sheetPanel) return;

  let startY = 0;
  let currentY = 0;

  sheetPanel.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    sheetPanel.style.transition = 'none';
  }, { passive: true });

  sheetPanel.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0) {
      sheetPanel.style.transform = 'translateY(' + diff + 'px)';
    }
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  renderChart('1W');
  animateBalance();
  initScrollReveal();
  initChartInteraction();
  initTouchFeedback();
  initSheetSwipe();

  // Back button in Telegram
  if (tg) {
    tg.BackButton.onClick(() => {
      window.history.back();
    });
  }
});
