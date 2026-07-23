# Verde Wallet — Telegram Mini App

Криптокошелёк в стиле Telegram Mini App. Белый + зелёный дизайн, полностью рабочие страницы и интерактив.

## Структура проекта

```
verde-wallet/
├── index.html              # Главная (кошелёк)
├── vercel.json             # Конфиг Vercel
├── assets/
│   ├── styles.css          # Все стили
│   └── app.js              # JS главной страницы
└── pages/
    ├── market.html         # Рынок (топ монет)
    ├── swap.html           # Обмен токенов
    ├── profile.html        # Профиль пользователя
    ├── discover.html       # Обзор (NFT + новости)
    ├── staking.html        # Стейкинг
    ├── history.html        # Полная история транзакций
    ├── buy.html            # Покупка крипты
    ├── bridge.html         # Мост между сетями
    ├── nft.html            # NFT маркетплейс
    └── asset.html          # Детальная страница актива
```

## Деплой на Vercel

1. Установите Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Залогиньтесь:
   ```bash
   vercel login
   ```

3. Запустите деплой из папки проекта:
   ```bash
   cd verde-wallet
   vercel --prod
   ```

4. Получите URL (например `https://verde-wallet.vercel.app`)

## Подключение к Telegram Bot

1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте бота: `/newbot`
3. Настройте Mini App:
   ```
   /mybots → Ваш бот → Bot Settings → Menu Button → Configure menu button
   ```
4. Введите URL вашего деплоя на Vercel
5. Готово! Теперь при нажатии на кнопку меню откроется Verde Wallet

## Функционал

- **Главная**: баланс, активы, график, история
- **Рынок**: топ криптовалют с фильтрами
- **Обмен**: swap с расчётом курса
- **Профиль**: настройки, безопасность, выход
- **Обзор**: NFT, новости, тренды
- **Стейкинг**: пулы с APY
- **История**: полный список транзакций с фильтрами
- **Покупка**: покупка крипты за фиат
- **Мост**: перевод между сетями
- **NFT**: маркетплейс коллекций
- **Актив**: детальная страница монеты

## Технологии

- Vanilla HTML/CSS/JS (без фреймворков)
- SVG графики с Catmull-Rom spline
- CSS анимации и glassmorphism
- Telegram WebApp API (haptic feedback)
- Intersection Observer для scroll-анимаций
