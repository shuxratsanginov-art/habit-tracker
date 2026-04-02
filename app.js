/* ========================================
   HABIT & TASK PRO (v1.5 Glow Dark)
   Logic, Restore Ring & Weekly Strip
   ======================================== */

const AppState = {
    settings: { theme: 'dark', lastSync: null },
    habits: [], 
    tasks: [],  
    records: {}, 
    selectedDate: new Date().toISOString().split('T')[0]
};

const Storage = {
    tg: window.Telegram.WebApp,
    
    async init() {
        if (this.tg.initData) {
            this.tg.ready();
            this.tg.expand();
            await this.loadCloud();
        } else {
            this.loadLocal();
        }
        this.applyTheme();
        this.cleanOldRecords();
    },

    loadLocal() {
        const data = localStorage.getItem('appState_v1.5');
        if (data) Object.assign(AppState, JSON.parse(data));
    },

    save() {
        localStorage.setItem('appState_v1.5', JSON.stringify(AppState));
        if (this.tg.initData) {
            const json = JSON.stringify(AppState);
            this.tg.CloudStorage.setItem('state_data', json, (err) => {
                if (err) console.error('Cloud Save Error:', err);
            });
        }
    },

    async loadCloud() {
        return new Promise((resolve) => {
            this.tg.CloudStorage.getItem('state_data', (err, value) => {
                if (!err && value) {
                    try { Object.assign(AppState, JSON.parse(value)); } catch(e) {}
                }
                resolve();
            });
        });
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', AppState.settings.theme);
        const toggler = document.getElementById('theme-toggle');
        if (toggler) toggler.textContent = AppState.settings.theme === 'dark' ? '🌙' : '☀️';
    },

    cleanOldRecords() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const limitStr = thirtyDaysAgo.toISOString().split('T')[0];
        Object.keys(AppState.records).forEach(date => {
            if (date < limitStr) delete AppState.records[date];
        });
    }
};

// ── NAVIGATION & PAGES ──
function showPage(pageId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const indexMap = { dashboard: 0, habits: 1, tasks: 2, stats: 3 };
    document.querySelectorAll('.tab-item')[indexMap[pageId]]?.classList.add('active');
    
    document.getElementById('page-title').textContent = pageId === 'dashboard' ? 'Сегодня' : 
                                                        pageId.charAt(0).toUpperCase() + pageId.slice(1);
    
    if (pageId === 'stats') renderWeeklyChart();
    if (pageId === 'habits') renderHabits();
    if (pageId === 'tasks') renderTasks();
    if (pageId === 'dashboard') updateUI();
}

// ── CALENDAR STRIP ──
function renderWeekStrip() {
    const strip = document.getElementById('week-strip');
    if (!strip) return;
    strip.innerHTML = '';
    
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun
    const startOfWeek = new Date(now);
    const diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    startOfWeek.setDate(now.getDate() - diff);

    const DAY_NAMES = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isSelected = dateStr === AppState.selectedDate;

        const dayEl = document.createElement('div');
        dayEl.className = `week-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`;
        dayEl.innerHTML = `
            <span class="day-name">${DAY_NAMES[i]}</span>
            <span class="day-num">${d.getDate()}</span>
        `;
        dayEl.onclick = () => {
            AppState.selectedDate = dateStr;
            renderWeekStrip();
            updateUI();
        };
        strip.appendChild(dayEl);
    }
}

// ── PROGRESS RING ──
function updateProgressRing(percent) {
    const circle = document.getElementById('progress-ring-fill');
    if (!circle) return;
    const circumference = 565; // 2 * PI * 90 (approx)
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    document.getElementById('progress-percent').textContent = `${percent}%`;
}

// ── HABITS & TASKS LOGIC ──
function toggleHabit(habitId) {
    const date = AppState.selectedDate;
    if (!AppState.records[date]) AppState.records[date] = { habits: {}, tasks: {}, mood: 3 };
    
    const current = !!AppState.records[date].habits[habitId];
    AppState.records[date].habits[habitId] = !current;
    
    if (Storage.tg.initData) Storage.tg.HapticFeedback.impactOccurred('medium');
    Storage.save();
    updateUI();
    renderHabits();
}

function toggleTask(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (Storage.tg.initData) Storage.tg.HapticFeedback.notificationOccurred('success');
        Storage.save();
        updateUI();
        renderTasks();
    }
}

// ── AI INSIGHTS (RESTORED) ──
function generateSmartInsights() {
    const habits = AppState.habits;
    const records = AppState.records;
    const dates = Object.keys(records).sort().reverse();
    const insights = [];
    
    habits.forEach(habit => {
        let fails = 0;
        for (let i = 0; i < Math.min(dates.length, 5); i++) {
            if (!records[dates[i]]?.habits[habit.id]) fails++;
            else break;
        }
        if (fails >= 3) insights.push(`Привычка "${habit.name}" пропущена ${fails} раз. Попробуй сменить время? 🕒`);
    });

    const box = document.getElementById('ai-insight-box');
    const text = document.getElementById('ai-insight-text');
    if (insights.length > 0) {
        box.style.display = 'block';
        text.textContent = insights[0];
    } else {
        box.style.display = 'none';
    }
}

// ── UI RENDERING: LISTS ──
function renderHabits() {
    const list = document.getElementById('habits-list');
    if (!list) return;
    list.innerHTML = '';
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits: {} };

    AppState.habits.forEach(habit => {
        const done = !!record.habits[habit.id];
        const item = document.createElement('div');
        item.className = `card-item ${done ? 'completed' : ''}`;
        item.innerHTML = `
            <div class="habit-icon-box" style="background:var(--accent-${habit.color});">
                ${habit.icon}
            </div>
            <div style="flex:1;">
                <div style="font-weight:700;">${habit.name}</div>
                <div style="font-size:12px; opacity:0.5;">Ежедневно</div>
            </div>
            <button class="btn-add" style="background:${done ? 'var(--accent)' : '#2c2c2e'}; box-shadow:none;">
                ${done ? '✓' : ''}
            </button>
            <button class="btn-text" style="color:var(--accent-red); padding:10px;" onclick="deleteHabit('${habit.id}', event)">✕</button>
        `;
        item.onclick = () => toggleHabit(habit.id);
        list.appendChild(item);
    });
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';

    AppState.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `card-item ${task.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <div style="width:6px; height:24px; border-radius:3px; background:var(--accent-${task.priority === 'high' ? 'red' : (task.priority === 'med' ? 'orange' : 'cyan')})"></div>
            <div style="flex:1;">
                <div style="font-weight:700; ${task.completed ? 'text-decoration:line-through; opacity:0.5;' : ''}">${task.name}</div>
            </div>
            <button class="btn-add" style="background:${task.completed ? 'var(--accent)' : '#2c2c2e'}; box-shadow:none;">
                ${task.completed ? '✓' : ''}
            </button>
            <button class="btn-text" style="color:var(--accent-red); padding:10px;" onclick="deleteTask('${task.id}', event)">✕</button>
        `;
        item.onclick = () => toggleTask(task.id);
        list.appendChild(item);
    });
}

// ── DASHBOARD UPDATE ──
function updateUI() {
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits: {}, tasks: {} };
    
    // Habits Score
    const hDone = Object.values(record.habits).filter(v => v).length;
    const hTotal = AppState.habits.length;
    document.getElementById('count-habits').textContent = `${hDone}/${hTotal}`;
    
    // Tasks Score (all tasks for simplicity in count)
    const tDone = AppState.tasks.filter(t => t.completed).length;
    const tTotal = AppState.tasks.length;
    document.getElementById('count-tasks').textContent = `${tDone}/${tTotal}`;
    
    // Ring Progress
    const totalDone = hDone + tDone;
    const totalAll = hTotal + tTotal;
    const percent = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
    updateProgressRing(percent);
    
    generateSmartInsights();
    renderWeekStrip();
}

// ── MODAL SYSTEM ──
let currentModalType = '';
function openModal(type) {
    currentModalType = type;
    document.getElementById('modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('modal-sheet').style.transform = 'translateY(0)', 10);
    const content = document.getElementById('modal-content');
    
    if (type === 'habit') {
        content.innerHTML = `
            <input type="text" id="inp-name" placeholder="Название привычки">
            <div style="display:flex; gap:12px;">
                <input type="text" id="inp-icon" value="🔥" style="width:70px; text-align:center;">
                <select id="inp-color">
                    <option value="purple">Фиолетовый</option>
                    <option value="orange">Оранжевый</option>
                    <option value="green">Зеленый</option>
                    <option value="cyan">Голубой</option>
                </select>
            </div>
        `;
    } else {
        content.innerHTML = `
            <input type="text" id="inp-name" placeholder="Что нужно сделать?">
            <select id="inp-priority">
                <option value="low">Низкий приоритет</option>
                <option value="med">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
            </select>
        `;
    }
}

function closeModal() {
    document.getElementById('modal-sheet').style.transform = 'translateY(100%)';
    setTimeout(() => document.getElementById('modal-overlay').style.display = 'none', 300);
}

function saveModal() {
    const name = document.getElementById('inp-name').value;
    if (!name) return;
    
    if (currentModalType === 'habit') {
        const icon = document.getElementById('inp-icon').value;
        const color = document.getElementById('inp-color').value;
        AppState.habits.push({ id: Date.now().toString(), name, icon, color });
    } else {
        const priority = document.getElementById('inp-priority').value;
        AppState.tasks.push({ id: Date.now().toString(), name, priority, completed: false });
    }
    
    Storage.save();
    closeModal();
    updateUI();
    renderHabits();
    renderTasks();
}

function deleteHabit(id, e) {
    e.stopPropagation();
    AppState.habits = AppState.habits.filter(h => h.id !== id);
    Storage.save();
    renderHabits();
    updateUI();
}

function deleteTask(id, e) {
    e.stopPropagation();
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    Storage.save();
    renderTasks();
    updateUI();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
    await Storage.init();
    
    // First run defaults
    if (AppState.habits.length === 0) {
        AppState.habits = [
            { id: '1', name: 'Медитация', icon: '🧘', color: 'purple' },
            { id: '2', name: 'Тренировка', icon: '💪', color: 'orange' }
        ];
        Storage.save();
    }
    
    // Button setup
    document.getElementById('theme-toggle').onclick = () => {
        AppState.settings.theme = AppState.settings.theme === 'dark' ? 'light' : 'dark';
        Storage.applyTheme();
        Storage.save();
    };
    
    document.getElementById('btn-add-habit').onclick = () => openModal('habit');
    document.getElementById('btn-add-task').onclick = () => openModal('task');
    document.getElementById('modal-save-btn').onclick = saveModal;
    
    document.getElementById('quote-text').textContent = "Дисциплина — это свобода.";
    document.getElementById('quote-author').textContent = "— Джоко Виллинк";

    updateUI();
});
