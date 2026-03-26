/* ========================================
   HABIT TRACKER APP
   Telegram Mini App + Standalone
   ======================================== */

// ── Storage Abstraction Layer ──
// Uses Telegram CloudStorage when inside Telegram, localStorage otherwise.
// CloudStorage syncs across all devices where user is logged into Telegram.
const Storage = {
    _cache: {},
    _isTelegram: false,
    _tg: null,

    async init() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
            this._tg = window.Telegram.WebApp;
            this._isTelegram = true;
            this._tg.ready();
            this._tg.expand();
            // Apply Telegram theme
            document.documentElement.style.setProperty('--tg-bg', this._tg.backgroundColor || '#0a0a0f');
            await this._loadFromCloud();
        } else {
            this._loadFromLocal();
        }
    },

    _loadFromLocal() {
        try {
            const data = localStorage.getItem('habitTracker');
            this._cache = data ? JSON.parse(data) : {};
        } catch { this._cache = {}; }
    },

    _loadFromCloud() {
        return new Promise((resolve) => {
            this._tg.CloudStorage.getItem('chunk_count', (err, countStr) => {
                if (err || !countStr) {
                    // Try loading from localStorage as fallback
                    this._loadFromLocal();
                    resolve();
                    return;
                }
                const count = parseInt(countStr);
                if (!count || isNaN(count)) {
                    this._loadFromLocal();
                    resolve();
                    return;
                }
                const keys = Array.from({ length: count }, (_, i) => `data_${i}`);
                this._tg.CloudStorage.getItems(keys, (err2, values) => {
                    if (err2 || !values) {
                        this._loadFromLocal();
                        resolve();
                        return;
                    }
                    const json = keys.map(k => values[k] || '').join('');
                    try {
                        this._cache = JSON.parse(json);
                    } catch {
                        this._loadFromLocal();
                    }
                    resolve();
                });
            });
        });
    },

    getData() {
        return this._cache;
    },

    saveData(data) {
        this._cache = data;
        // Always save to localStorage as backup
        try {
            localStorage.setItem('habitTracker', JSON.stringify(data));
        } catch { /* quota exceeded, ignore */ }
        // Sync to Telegram CloudStorage
        if (this._isTelegram) {
            this._saveToCloud(data);
        }
    },

    _saveToCloud(data) {
        const json = JSON.stringify(data);
        const chunkSize = 4000;
        const chunks = [];
        for (let i = 0; i < json.length; i += chunkSize) {
            chunks.push(json.slice(i, i + chunkSize));
        }
        this._tg.CloudStorage.setItem('chunk_count', String(chunks.length), () => {});
        chunks.forEach((chunk, i) => {
            this._tg.CloudStorage.setItem(`data_${i}`, chunk, () => {});
        });
    },

    isTelegram() {
        return this._isTelegram;
    }
};

// ── Habit Definitions ──
const HABITS = [
    {
        id: 'reflection',
        name: 'Саморефлексия',
        icon: '🧠',
        color: 'purple',
        schedule: 'daily',
        scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        subTasks: ['morning', 'evening'],
        subLabels: { morning: 'Утро', evening: 'Вечер' },
        hasJournal: true,
        description: 'Ежедневно утром и вечером',
    },
    {
        id: 'workout',
        name: 'Тренировка',
        icon: '💪',
        color: 'orange',
        schedule: 'specific',
        scheduleDays: [1, 3, 5], // Mon, Wed, Fri
        subTasks: null,
        hasJournal: false,
        description: 'Пн, Ср, Пт',
    },
    {
        id: 'meditation',
        name: 'Медитация',
        icon: '🧘',
        color: 'cyan',
        schedule: 'daily',
        scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        subTasks: null,
        hasJournal: false,
        description: 'Ежедневно',
    },
    {
        id: 'reading',
        name: 'Чтение',
        icon: '📖',
        color: 'blue',
        schedule: 'daily',
        scheduleDays: [0, 1, 2, 3, 4, 5, 6],
        subTasks: null,
        hasJournal: false,
        description: 'Ежедневно',
    },
];

// ── Morning/Evening Prompts ──
const MORNING_PROMPTS = [
    'За что вы благодарны сегодня?',
    'Какие 3 главные задачи на сегодня?',
    'Что сделает этот день отличным?',
];

const EVENING_PROMPTS = [
    'Что было лучшим моментом дня?',
    'Что вы узнали сегодня?',
    'Что можно улучшить завтра?',
];

// ── Motivational Quotes ──
const QUOTES = [
    { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
    { text: 'Мы то, что мы делаем постоянно. Совершенство — это не действие, а привычка.', author: 'Аристотель' },
    { text: 'Маленькие ежедневные улучшения — ключ к ошеломляющим долгосрочным результатам.', author: 'Робин Шарма' },
    { text: 'Успех — это сумма маленьких усилий, повторяемых изо дня в день.', author: 'Роберт Кольер' },
    { text: 'Не бойтесь двигаться медленно, бойтесь стоять на месте.', author: 'Китайская пословица' },
    { text: 'Привычка — вторая натура. Сделай её своей первой.', author: 'Марк Аврелий' },
    { text: 'Легче предотвратить плохие привычки, чем от них избавиться.', author: 'Бенджамин Франклин' },
    { text: 'Каждое утро мы рождаемся заново. Что мы делаем сегодня — вот что важно.', author: 'Будда' },
    { text: 'Ваша жизнь через 5 лет будет определяться людьми, с которыми вы общаетесь, и книгами, которые вы читаете.', author: 'Чарли Джонс' },
    { text: 'Сила не в том, чтобы никогда не падать, а в том, чтобы подниматься каждый раз.', author: 'Конфуций' },
];

// ── Constants ──
const DAY_NAMES_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_NAMES_FULL = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTH_NAMES = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

// ── State ──
let selectedDate = new Date();
let currentReflectionType = 'morning';
let selectedMood = null;

// ── Data Helpers ──
function getDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getData() {
    return Storage.getData();
}

function saveData(data) {
    Storage.saveData(data);
}

function getHabitData(dateKey, habitId) {
    const data = getData();
    return data[dateKey]?.[habitId] || null;
}

function setHabitCompleted(dateKey, habitId, completed, subTask = null) {
    const data = getData();
    if (!data[dateKey]) data[dateKey] = {};
    if (!data[dateKey][habitId]) data[dateKey][habitId] = { completed: false };

    if (subTask) {
        if (!data[dateKey][habitId].subTasks) data[dateKey][habitId].subTasks = {};
        data[dateKey][habitId].subTasks[subTask] = completed;
        const habit = HABITS.find(h => h.id === habitId);
        if (habit && habit.subTasks) {
            const allDone = habit.subTasks.every(st => data[dateKey][habitId].subTasks[st]);
            data[dateKey][habitId].completed = allDone;
        }
    } else {
        data[dateKey][habitId].completed = completed;
    }

    saveData(data);
}

function saveReflection(dateKey, type, text, mood) {
    const data = getData();
    if (!data[dateKey]) data[dateKey] = {};
    if (!data[dateKey].reflections) data[dateKey].reflections = {};
    data[dateKey].reflections[type] = { text, mood, timestamp: Date.now() };
    saveData(data);
}

function getReflection(dateKey, type) {
    const data = getData();
    return data[dateKey]?.reflections?.[type] || null;
}

// ── Date Helpers ──
function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
}

function isFuture(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d > today;
}

function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(today.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
    }
    return dates;
}

function getHabitsForDate(date) {
    const dayOfWeek = date.getDay();
    return HABITS.filter(h => h.scheduleDays.includes(dayOfWeek));
}

// ── Streak Calculator ──
function calculateStreak(habitId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
        const habit = HABITS.find(h => h.id === habitId);
        const dayOfWeek = currentDate.getDay();

        if (!habit.scheduleDays.includes(dayOfWeek)) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }

        const dateKey = getDateKey(currentDate);
        const habitData = getHabitData(dateKey, habitId);

        if (habitData && habitData.completed) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (isToday(currentDate)) {
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }

        if (streak > 365) break;
    }

    return streak;
}

function calculateBestStreak(habitId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let bestStreak = 0;
    let currentStreak = 0;
    const habit = HABITS.find(h => h.id === habitId);

    for (let i = 0; i < 90; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayOfWeek = d.getDay();

        if (!habit.scheduleDays.includes(dayOfWeek)) continue;

        const dateKey = getDateKey(d);
        const habitData = getHabitData(dateKey, habitId);

        if (habitData && habitData.completed) {
            currentStreak++;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return bestStreak;
}

function calculateCompletionRate(habitId, days = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const habit = HABITS.find(h => h.id === habitId);
    let applicable = 0;
    let completed = 0;

    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayOfWeek = d.getDay();

        if (!habit.scheduleDays.includes(dayOfWeek)) continue;
        applicable++;

        const dateKey = getDateKey(d);
        const habitData = getHabitData(dateKey, habitId);
        if (habitData && habitData.completed) completed++;
    }

    return applicable > 0 ? Math.round((completed / applicable) * 100) : 0;
}

// ── Rendering ──
function renderGreeting() {
    const hours = new Date().getHours();
    let greeting;
    if (hours < 6) greeting = 'Доброй ночи';
    else if (hours < 12) greeting = 'Доброе утро';
    else if (hours < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';

    // Use Telegram user's first name if available
    if (Storage.isTelegram() && Storage._tg.initDataUnsafe?.user?.first_name) {
        greeting += ', ' + Storage._tg.initDataUnsafe.user.first_name;
    }

    document.getElementById('greeting-text').textContent = greeting;

    const today = new Date();
    const dayName = DAY_NAMES_FULL[today.getDay()];
    const dateStr = `${today.getDate()} ${MONTH_NAMES[today.getMonth()]}`;
    document.getElementById('date-text').textContent = `${dayName}, ${dateStr}`;
}

function renderWeekStrip() {
    const weekDates = getWeekDates();
    const container = document.getElementById('week-strip');
    container.innerHTML = '';

    weekDates.forEach(date => {
        const dayEl = document.createElement('div');
        dayEl.className = 'week-day';

        if (isToday(date)) dayEl.classList.add('today');
        if (isFuture(date)) dayEl.classList.add('future');
        if (getDateKey(date) === getDateKey(selectedDate)) dayEl.classList.add('selected');

        const dateKey = getDateKey(date);
        const habitsForDay = getHabitsForDate(date);
        const completedCount = habitsForDay.filter(h => {
            const hd = getHabitData(dateKey, h.id);
            return hd && hd.completed;
        }).length;

        if (habitsForDay.length > 0 && completedCount === habitsForDay.length && !isFuture(date)) {
            dayEl.classList.add('has-all-complete');
        }

        const dayName = DAY_NAMES_SHORT[date.getDay()];
        const dayNum = date.getDate();

        let dotsHTML = '';
        if (!isFuture(date)) {
            habitsForDay.forEach(h => {
                const hd = getHabitData(dateKey, h.id);
                const cls = hd && hd.completed ? 'completed' : (hd ? 'partial' : '');
                dotsHTML += `<div class="day-dot ${cls}"></div>`;
            });
        }

        dayEl.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="day-num">${dayNum}</span>
            <div class="day-dots">${dotsHTML}</div>
        `;

        dayEl.addEventListener('click', () => {
            if (!isFuture(date)) {
                selectedDate = new Date(date);
                renderAll();
            }
        });

        container.appendChild(dayEl);
    });
}

function renderHabits() {
    const container = document.getElementById('habits-list');
    container.innerHTML = '';

    const dateKey = getDateKey(selectedDate);
    const habitsForDay = getHabitsForDate(selectedDate);
    const future = isFuture(selectedDate);

    const dayLabel = document.getElementById('today-day-label');
    if (isToday(selectedDate)) {
        dayLabel.textContent = 'сегодня';
    } else {
        dayLabel.textContent = `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`;
    }

    if (habitsForDay.length === 0) {
        container.innerHTML = `
            <div class="motivation-card" style="text-align:center;">
                <p class="quote-text">Нет запланированных привычек на этот день 🎉</p>
                <span class="quote-author">Отдыхайте!</span>
            </div>
        `;
        return;
    }

    habitsForDay.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.id = `habit-${habit.id}`;

        const habitData = getHabitData(dateKey, habit.id);
        const isCompleted = habitData && habitData.completed;
        const streak = calculateStreak(habit.id);

        if (isCompleted) card.classList.add('completed');
        if (habit.subTasks) card.classList.add('has-sub');

        const colorBg = `var(--accent-${habit.color}-dim)`;
        const streakHTML = streak > 0 ? `
            <span class="habit-streak">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.866 0-7-3.134-7-7 0-3.253 2.308-6.948 5.25-9.922.42-.425 1.08-.425 1.5 0C14.692 9.052 17 12.747 17 16c0 3.866-3.134 7-7 7z"/></svg>
                ${streak}
            </span>
        ` : '';

        let checkHTML;
        if (habit.subTasks) {
            const subChecksMarkup = habit.subTasks.map(st => {
                const isChecked = habitData?.subTasks?.[st];
                return `
                    <div class="sub-check">
                        <span class="sub-check-label">${habit.subLabels[st]}</span>
                        <button class="sub-check-btn ${isChecked ? 'checked' : ''}" 
                                data-habit="${habit.id}" 
                                data-subtask="${st}"
                                aria-label="${habit.subLabels[st]}"
                                ${future ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                    </div>
                `;
            }).join('');
            checkHTML = `<div class="sub-checks">${subChecksMarkup}</div>`;
        } else {
            checkHTML = `
                <div class="habit-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="habit-icon" style="background: ${colorBg}">
                ${habit.icon}
            </div>
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-meta">
                    <span class="habit-schedule">${habit.description}</span>
                    ${streakHTML}
                </div>
            </div>
            ${checkHTML}
        `;

        // Event listeners
        if (!future) {
            if (habit.subTasks) {
                card.querySelectorAll('.sub-check-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const subTask = btn.dataset.subtask;
                        const habitId = btn.dataset.habit;
                        const currentlyChecked = btn.classList.contains('checked');

                        setHabitCompleted(dateKey, habitId, !currentlyChecked, subTask);

                        if (!currentlyChecked) {
                            btn.classList.add('checked');
                            triggerCompletionEffect(card);
                            // Haptic feedback in Telegram
                            if (Storage.isTelegram()) {
                                Storage._tg.HapticFeedback.impactOccurred('light');
                            }
                        } else {
                            btn.classList.remove('checked');
                        }

                        if (habit.hasJournal && !currentlyChecked) {
                            currentReflectionType = subTask;
                            openReflectionModal(dateKey, subTask);
                        }

                        setTimeout(() => renderAll(), 300);
                    });
                });
            } else {
                card.addEventListener('click', () => {
                    const currentlyCompleted = card.classList.contains('completed');
                    setHabitCompleted(dateKey, habit.id, !currentlyCompleted);

                    if (!currentlyCompleted) {
                        card.classList.add('completed', 'just-completed');
                        triggerCompletionEffect(card);
                        if (Storage.isTelegram()) {
                            Storage._tg.HapticFeedback.impactOccurred('medium');
                        }
                        setTimeout(() => card.classList.remove('just-completed'), 600);
                    } else {
                        card.classList.remove('completed');
                    }

                    setTimeout(() => renderAll(), 300);
                });
            }
        }

        container.appendChild(card);
    });

    // All done celebration
    const allDone = habitsForDay.every(h => {
        const hd = getHabitData(dateKey, h.id);
        return hd && hd.completed;
    });

    if (allDone && isToday(selectedDate)) {
        if (Storage.isTelegram()) {
            Storage._tg.HapticFeedback.notificationOccurred('success');
        }
        const banner = document.createElement('div');
        banner.className = 'all-done-banner';
        banner.innerHTML = `
            <div class="all-done-emoji">🏆</div>
            <div class="all-done-text">Все привычки выполнены!</div>
            <div class="all-done-sub">Отличная работа. Так держать!</div>
        `;
        container.appendChild(banner);
    }
}

function renderProgress() {
    const dateKey = getDateKey(selectedDate);
    const habitsForDay = getHabitsForDate(selectedDate);
    const total = habitsForDay.length;

    let completed = 0;
    habitsForDay.forEach(h => {
        const hd = getHabitData(dateKey, h.id);
        if (hd && hd.completed) completed++;
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const ring = document.getElementById('progress-ring-fill');
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;

    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('remaining-count').textContent = total - completed;

    let bestStreak = 0;
    HABITS.forEach(h => {
        const bs = calculateBestStreak(h.id);
        if (bs > bestStreak) bestStreak = bs;
    });
    document.getElementById('best-streak').textContent = bestStreak;

    // SVG gradient
    if (!document.getElementById('progress-gradient')) {
        const svg = document.querySelector('.progress-ring');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#8b5cf6"/>
                <stop offset="100%" stop-color="#06b6d4"/>
            </linearGradient>
        `;
        svg.prepend(defs);
    }
}

function renderQuote() {
    const today = new Date();
    const dayIndex = today.getDate() % QUOTES.length;
    const quote = QUOTES[dayIndex];
    document.getElementById('quote-text').textContent = quote.text;
    document.getElementById('quote-author').textContent = `— ${quote.author}`;
}

function triggerCompletionEffect(card) {
    const burst = document.createElement('div');
    burst.className = 'confetti-burst';
    card.appendChild(burst);
    setTimeout(() => burst.remove(), 500);
    if (navigator.vibrate) navigator.vibrate(30);
}

// ── Stats Modal ──
function renderStats() {
    const container = document.getElementById('stats-content');
    container.innerHTML = '';

    HABITS.forEach(habit => {
        const streak = calculateStreak(habit.id);
        const bestStreak = calculateBestStreak(habit.id);
        const rate30 = calculateCompletionRate(habit.id, 30);
        const rate7 = calculateCompletionRate(habit.id, 7);

        const card = document.createElement('div');
        card.className = 'stats-habit-card';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayLabels = DAY_NAMES_SHORT.map(d => `<div class="heatmap-label">${d}</div>`).join('');

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 27);
        while (startDate.getDay() !== 1) {
            startDate.setDate(startDate.getDate() - 1);
        }

        let cellsHTML = '';
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + (6 - today.getDay()));

        const d = new Date(startDate);
        while (d <= endDate) {
            const dateKey = getDateKey(d);
            const hd = getHabitData(dateKey, habit.id);
            const isScheduled = habit.scheduleDays.includes(d.getDay());

            let level = '';
            if (isFuture(d)) {
                level = '';
            } else if (!isScheduled) {
                level = '';
            } else if (hd && hd.completed) {
                level = 'level-4';
            } else if (hd && hd.subTasks) {
                const subDone = Object.values(hd.subTasks).filter(Boolean).length;
                const subTotal = habit.subTasks ? habit.subTasks.length : 1;
                if (subDone > 0) level = subDone >= subTotal ? 'level-4' : 'level-2';
            }

            cellsHTML += `<div class="heatmap-cell ${level}" title="${dateKey}"></div>`;
            d.setDate(d.getDate() + 1);
        }

        card.innerHTML = `
            <div class="stats-habit-header">
                <span class="stats-habit-icon">${habit.icon}</span>
                <span class="stats-habit-name">${habit.name}</span>
            </div>
            <div class="stats-row">
                <div class="stats-item">
                    <span class="stats-item-value">${streak}</span>
                    <span class="stats-item-label">Стрик</span>
                </div>
                <div class="stats-item">
                    <span class="stats-item-value">${bestStreak}</span>
                    <span class="stats-item-label">Лучший</span>
                </div>
                <div class="stats-item">
                    <span class="stats-item-value">${rate7}%</span>
                    <span class="stats-item-label">7 дней</span>
                </div>
                <div class="stats-item">
                    <span class="stats-item-value">${rate30}%</span>
                    <span class="stats-item-label">30 дней</span>
                </div>
            </div>
            <div class="heatmap-header">
                <span class="heatmap-title">Последние 4 недели</span>
                <div class="heatmap-legend">
                    <span>мало</span>
                    <div class="heatmap-legend-cell" style="background: var(--bg-elevated)"></div>
                    <div class="heatmap-legend-cell" style="background: rgba(16,185,129,0.2)"></div>
                    <div class="heatmap-legend-cell" style="background: rgba(16,185,129,0.45)"></div>
                    <div class="heatmap-legend-cell" style="background: var(--accent-green)"></div>
                    <span>все</span>
                </div>
            </div>
            <div class="heatmap">${cellsHTML}</div>
            <div class="heatmap" style="margin-top:0">${dayLabels}</div>
        `;

        container.appendChild(card);
    });

    // Mood stats
    const moodCard = document.createElement('div');
    moodCard.className = 'stats-habit-card';

    const moodEmojis = { 1: '😫', 2: '😔', 3: '😐', 4: '🙂', 5: '😊' };
    const data = getData();
    let moodEntries = [];

    Object.keys(data).sort().reverse().slice(0, 14).forEach(dateKey => {
        if (data[dateKey].reflections) {
            ['morning', 'evening'].forEach(type => {
                const ref = data[dateKey].reflections[type];
                if (ref && ref.mood) {
                    moodEntries.push({ date: dateKey, type, mood: ref.mood });
                }
            });
        }
    });

    let avgMood = 0;
    if (moodEntries.length > 0) {
        avgMood = (moodEntries.reduce((sum, e) => sum + e.mood, 0) / moodEntries.length).toFixed(1);
    }

    const moodBarsHTML = moodEntries.slice(0, 14).map(e => {
        const height = (e.mood / 5) * 100;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
            <span style="font-size:0.6rem">${moodEmojis[e.mood]}</span>
            <div style="width:100%;height:40px;background:var(--bg-elevated);border-radius:3px;position:relative;overflow:hidden;">
                <div style="position:absolute;bottom:0;width:100%;height:${height}%;background:var(--gradient-purple);border-radius:3px;"></div>
            </div>
        </div>`;
    }).join('');

    moodCard.innerHTML = `
        <div class="stats-habit-header">
            <span class="stats-habit-icon">😊</span>
            <span class="stats-habit-name">Настроение</span>
        </div>
        <div class="stats-row">
            <div class="stats-item">
                <span class="stats-item-value">${avgMood || '—'}</span>
                <span class="stats-item-label">Среднее</span>
            </div>
            <div class="stats-item">
                <span class="stats-item-value">${moodEntries.length}</span>
                <span class="stats-item-label">Записей</span>
            </div>
        </div>
        ${moodEntries.length > 0 ? `
            <div class="heatmap-header">
                <span class="heatmap-title">Динамика настроения</span>
            </div>
            <div style="display:flex;gap:3px;align-items:flex-end;">${moodBarsHTML}</div>
        ` : '<p style="color:var(--text-tertiary);font-size:0.82rem;text-align:center;padding:var(--space-md);">Начните вести дневник, чтобы увидеть статистику настроения</p>'}
    `;

    container.appendChild(moodCard);
}

// ── Reflection Modal ──
function openReflectionModal(dateKey, type) {
    const modal = document.getElementById('reflection-modal');
    const title = document.getElementById('reflection-title');
    const prompts = document.getElementById('reflection-prompts');
    const textarea = document.getElementById('reflection-text');

    currentReflectionType = type;
    title.textContent = type === 'morning' ? '🌅 Утренняя рефлексия' : '🌙 Вечерняя рефлексия';

    const promptList = type === 'morning' ? MORNING_PROMPTS : EVENING_PROMPTS;
    prompts.innerHTML = promptList.map(p => `<div class="reflection-prompt">${p}</div>`).join('');

    const existing = getReflection(dateKey, type);
    if (existing) {
        textarea.value = existing.text || '';
        selectedMood = existing.mood || null;
    } else {
        textarea.value = '';
        selectedMood = null;
    }

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.mood) === selectedMood);
    });

    modal.classList.add('active');
    setTimeout(() => textarea.focus(), 400);
}

function closeReflectionModal() {
    document.getElementById('reflection-modal').classList.remove('active');
}

function setupReflectionModal() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedMood = parseInt(btn.dataset.mood);
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if (Storage.isTelegram()) {
                Storage._tg.HapticFeedback.selectionChanged();
            }
        });
    });

    document.getElementById('save-reflection').addEventListener('click', () => {
        const dateKey = getDateKey(selectedDate);
        const text = document.getElementById('reflection-text').value.trim();

        saveReflection(dateKey, currentReflectionType, text, selectedMood);
        setHabitCompleted(dateKey, 'reflection', true, currentReflectionType);

        closeReflectionModal();
        renderAll();
    });

    document.getElementById('close-reflection').addEventListener('click', closeReflectionModal);
    document.querySelector('#reflection-modal .modal-backdrop').addEventListener('click', closeReflectionModal);
}

// ── Stats Modal Toggle ──
function setupStatsModal() {
    const modal = document.getElementById('stats-modal');

    document.getElementById('stats-btn').addEventListener('click', () => {
        renderStats();
        modal.classList.add('active');
    });

    document.getElementById('close-stats').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.querySelector('.modal-backdrop').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// ── Render All ──
function renderAll() {
    renderGreeting();
    renderWeekStrip();
    renderProgress();
    renderHabits();
}

// ── Init ──
async function init() {
    // Initialize storage (loads from CloudStorage or localStorage)
    await Storage.init();

    renderAll();
    renderQuote();
    setupStatsModal();
    setupReflectionModal();

    // Show sync indicator if running in Telegram
    if (Storage.isTelegram()) {
        console.log('🔄 Telegram CloudStorage syncing enabled');
    }

    // Auto refresh at midnight
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
        selectedDate = new Date();
        renderAll();
        renderQuote();
        setInterval(() => {
            selectedDate = new Date();
            renderAll();
            renderQuote();
        }, 86400000);
    }, msUntilMidnight);
}

document.addEventListener('DOMContentLoaded', init);
