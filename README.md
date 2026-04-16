# HabitFlow — Щоденний трекер звичок
[![CI/CD Pipeline](https://github.com/zalishchukolia/habitflow/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/zalishchukolia/habitflow/actions/workflows/ci-cd.yml)

[Сайт](https://habitflow-theta-nine.vercel.app)
## Опис проєкту

HabitFlow — це веб-застосунок для відстеження щоденних звичок. Додаток включає:

- Додавання, редагування та видалення звичок
- Щоденне відмічання виконання звичок
- Тижневий календар прогресу на кожній картці
- Статистику та графік активності за місяць
- Налаштування денної цілі та нагадувань

## Стек технологій

- React 18 — бібліотека для побудови інтерфейсу
- Vite — інструмент для збірки та запуску
- Lucide React — бібліотека іконок
- LocalStorage — збереження даних у браузері

## Встановлення

### Передумови

- Node.js версії 18 або вище
- npm версії 9 або вище

## Інструкція з запуску

### Клонування репозиторію
```bash
git clone https://github.com/zalishchukolia/habitflow.git
cd habitflow
```

### Встановлення залежностей
```bash
npm install
```

### Запуск проєкту
```bash
npm run dev
```

Застосунок буде доступний на http://localhost:5173

## Структура проєкту
```
habitflow/
├── public/          # Статичні файли
├── src/
│   ├── App.jsx      # Головний компонент
│   ├── main.jsx     # Точка входу
│   └── index.css    # Глобальні стилі
├── .gitignore       
├── index.html       
├── package.json     
└── vite.config.js   
```
