/**
 * i18n.js - Модуль для мультиязычной поддержки в приложении
 */

// Доступные языки
const AVAILABLE_LANGUAGES = ['en', 'ru'];

// Текущий язык приложения
let currentLanguage = localStorage.getItem('appLanguage') || 'en';

// Переводы
const translations = {
    en: {
        // Заголовки и метрики
        "header": "Destroy the grid, unleash the instinct.",
        "speed": "Speed:",
        "style": "Style:",
        "span": "Span:",
        "analyzing": "analyzing...",

        // Стили движения
        "chaotic": "chaotic",
        "explorative": "explorative",
        "balanced": "balanced",
        "structured": "structured",
        "methodical": "methodical",

        // Результирующая фраза
        "animals": "Animal's",
        "instinct": "instinct",
        "unleashed": "unleashed",

        // Кнопка и подсказка
        "prompt": "Let instinct speak through design",
        "button": "Leave a trace",

        // Алерт
        "alert-message": "Your design animal: ",
        "not-determined": "Not determined yet"
    },
    ru: {
        // Заголовки и метрики
        "header": "Разрушь сетку, пробуди инстинкт.",
        "speed": "Скорость:",
        "style": "Стиль:",
        "span": "Размах:",
        "analyzing": "анализ...",

        // Стили движения
        "chaotic": "хаотичный",
        "explorative": "исследовательский",
        "balanced": "сбалансированный",
        "structured": "структурированный",
        "methodical": "методичный",

        // Результирующая фраза
        "animals-ru": "животного",
        "instinct": "инстинкт",
        "manifested": "проявлен",

        // Кнопка и подсказка
        "prompt": "Позволь инстинкту говорить через дизайн",
        "button": "Оставить след",

        // Алерт
        "alert-message": "Ваше дизайн-животное: ",
        "not-determined": "Еще не определено"
    }
};

/**
 * Получение перевода по ключу
 * @param {string} key - Ключ перевода
 * @returns {string} - Переведенный текст
 */
function t(key) {
    const lang = translations[currentLanguage];
    return lang && lang[key] ? lang[key] : key;
}

/**
 * Установка языка приложения
 * @param {string} lang - Код языка (en, ru)
 */
function setLanguage(lang) {
    if (AVAILABLE_LANGUAGES.includes(lang)) {
        currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        updatePageTexts();
        updateStructure();

        // Обновляем активную кнопку языка
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Обновляем атрибут lang у HTML
        document.documentElement.lang = lang;

        // Добавляем вызов функции resetGame для сброса статистики
        if (window.resetGame) {
            window.resetGame();
        }

        // Вызываем событие изменения языка
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        document.dispatchEvent(event);
    }
}

/**
 * Обновление всех текстов на странице
 */
function updatePageTexts() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = t(key);
        }
    });
}

/**
 * Обновление структуры результата в зависимости от языка
 */
function updateStructure() {
    document.querySelector('.en-structure').style.display = currentLanguage === 'en' ? 'block' : 'none';
    document.querySelector('.ru-structure').style.display = currentLanguage === 'ru' ? 'block' : 'none';
}

/**
 * Получение текущего языка
 * @returns {string} - Код текущего языка
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Инициализация модуля локализации
 */
function initI18n() {
    setLanguage(currentLanguage);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
}

// Инициализируем модуль после загрузки DOM
document.addEventListener('DOMContentLoaded', initI18n);

// Экспортируем публичное API
window.i18n = {
    t,
    setLanguage,
    getCurrentLanguage
};