/* ========================================
   HABIT & TASK PRO (iOS 7-10 Edition)
   Logic, AI & Analytics Engine
   ======================================== */

// ── DATA STRUCTURE & STORAGE ──
const AppState = {
    settings: { theme: 'light', lastSync: null },
    habits: [], // {id, name, icon, color, schedule: [days], created: timestamp}
    tasks: [],  // {id, name, priority, completed: bool, date: timestamp, repeat: bool}
    records: {}, // { 'YYYY-MM-DD': { habits: {id: bool}, tasks: {id: bool}, mood: 1-5 } }
    aiInsights: []
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
        const data = localStorage.getItem('appState_v2');
        if (data) Object.assign(AppState, JSON.parse(data));
    },

    save() {
        localStorage.setItem('appState_v2', JSON.stringify(AppState));
        if (this.tg.initData) {
            // Save to cloud in chunks to stay under 4KB limit
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
        document.getElementById('theme-toggle').textContent = AppState.settings.theme === 'light' ? 'Dark' : 'Light';
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

// ── NAVIGATION & UI ──
function showPage(pageId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    // Select correct tab based on pageId
    const indexMap = { dashboard: 0, habits: 1, tasks: 2, stats: 3 };
    document.querySelectorAll('.tab-item')[indexMap[pageId]]?.classList.add('active');
    
    document.getElementById('page-title').textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    
    if (pageId === 'stats') renderCharts();
    if (pageId === 'habits') renderHabits();
    if (pageId === 'tasks') renderTasks();
    if (pageId === 'dashboard') updateDashboard();
}

// ── HABITS & TASKS LOGIC ──
function toggleHabit(habitId) {
    const today = new Date().toISOString().split('T')[0];
    if (!AppState.records[today]) AppState.records[today] = { habits: {}, tasks: {}, mood: 3 };
    
    const current = !!AppState.records[today].habits[habitId];
    AppState.records[today].habits[habitId] = !current;
    
    if (Storage.tg.initData) Storage.tg.HapticFeedback.impactOccurred('medium');
    Storage.save();
    updateDashboard();
    renderHabits();
}

function toggleTask(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (Storage.tg.initData) Storage.tg.HapticFeedback.notificationOccurred('success');
        Storage.save();
        updateDashboard();
        renderTasks();
    }
}

// ── SMART AI ENGINE ──
function generateSmartInsights() {
    const habits = AppState.habits;
    const records = AppState.records;
    const dates = Object.keys(records).sort().reverse();
    
    const insights = [];
    
    habits.forEach(habit => {
        let fails = 0;
        for (let i = 0; i < Math.min(dates.length, 5); i++) {
            if (!records[dates[i]].habits[habit.id]) fails++;
            else break; // Streak of success
        }
        
        if (fails >= 3) {
            insights.push(`Привычка "${habit.name}" провалена ${fails} раза подряд. Возможно, стоит перенести её на другое время? 🕒`);
        }
    });

    // Mood correlation insight
    const moodEffect = analyzeMoodCorrelation();
    if (moodEffect.impact > 20) {
        insights.push(`Твое настроение сильно влияет на продуктивность. Когда ты чувствуешь себя на 1-2 балла, активность падает на ${moodEffect.impact}%. 🧠`);
    }

    const box = document.getElementById('ai-insight-box');
    const text = document.getElementById('ai-insight-text');
    
    if (insights.length > 0) {
        box.style.display = 'block';
        text.innerHTML = insights[0]; // Show the most important one
    } else {
        box.style.display = 'none';
    }
}

function analyzeMoodCorrelation() {
    const records = Object.values(AppState.records);
    if (records.length < 5) return { impact: 0 };
    
    const goodMoodTasks = records.filter(r => r.mood >= 4);
    const badMoodTasks = records.filter(r => r.mood <= 2);
    
    const getAvg = (list) => {
        if (!list.length) return 0;
        let total = 0;
        list.forEach(r => {
            const hDone = Object.values(r.habits).filter(v => v).length;
            const tDone = Object.values(r.tasks).filter(v => v).length;
            total += (hDone + tDone);
        });
        return total / list.length;
    };
    
    const goodAvg = getAvg(goodMoodTasks);
    const badAvg = getAvg(badMoodTasks);
    
    if (goodAvg === 0) return { impact: 0 };
    const impact = Math.round(((goodAvg - badAvg) / goodAvg) * 100);
    return { impact: Math.max(0, impact) };
}

// ── CHARTS (SVG) ──
function renderCharts() {
    const weeklyBox = document.getElementById('chart-weekly');
    const dates = [];
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    
    let barsHTML = '';
    dates.forEach(date => {
        const record = AppState.records[date] || { habits: {}, tasks: {} };
        const hDone = Object.values(record.habits).filter(v => v).length;
        const tDone = AppState.tasks.filter(t => t.completed && t.date?.startsWith(date)).length;
        const total = Math.max(1, AppState.habits.length + AppState.tasks.filter(t => !t.completed || t.date?.startsWith(date)).length);
        const percent = Math.min(100, Math.round(((hDone + tDone) / total) * 100));
        
        barsHTML += `
            <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
                <div style="width:12px; height:${percent}%; background:var(--accent); border-radius:6px; transition:height 0.5s ease;"></div>
                <div style="font-size:8px; color:var(--text-tertiary); margin-top:8px;">${date.split('-')[2]}</div>
            </div>
        `;
    });
    weeklyBox.innerHTML = barsHTML;
}

// ── UTILS ──
function updateDashboard() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    
    const today = now.toISOString().split('T')[0];
    const record = AppState.records[today] || { habits: {}, tasks: {} };
    
    const hDone = Object.values(record.habits).filter(v => v).length;
    const hTotal = AppState.habits.length;
    const tDone = AppState.tasks.filter(t => t.completed).length;
    const tTotal = AppState.tasks.length;
    
    document.getElementById('score-habits').textContent = `${hDone}/${hTotal}`;
    document.getElementById('score-tasks').textContent = `${tDone}/${tTotal}`;
    const totalPercent = hTotal + tTotal > 0 ? Math.round(((hDone + tDone) / (hTotal + tTotal)) * 100) : 0;
    document.getElementById('score-total').textContent = `${totalPercent}%`;
    
    generateSmartInsights();
}

// ── APP INITIALIZATION ──
document.addEventListener('DOMContentLoaded', async () => {
    await Storage.init();
    updateDashboard();
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        AppState.settings.theme = AppState.settings.theme === 'light' ? 'dark' : 'light';
        Storage.applyTheme();
        Storage.save();
    });

    // Intervals
    setInterval(updateDashboard, 60000); // UI Refresh every min
    
    // Default Habits if empty (First run)
    if (AppState.habits.length === 0) {
        AppState.habits = [
            { id: '1', name: 'Медитация', icon: '🧘', color: 'purple', schedule: [0,1,2,3,4,5,6] },
            { id: '2', name: 'Чтение', icon: '📖', color: 'blue', schedule: [0,1,2,3,4,5,6] }
        ];
        Storage.save();
    }
});

// Mock Quotes (Fuller list)
const QUOTES = [
    { text: "Дисциплина — это мост между целью и достижением.", author: "Джим Рон" },
    { text: "Ваше время ограничено, не тратьте его на чужую жизнь.", author: "Стив Джобс" },
    { text: "Если хочешь идти быстро — иди один. Если хочешь далеко — идите вместе.", author: "Пословица" }
];

function updateQuote() {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    document.getElementById('quote-text').textContent = q.text;
    document.getElementById('quote-author').textContent = `— ${q.author}`;
}

// ── UI RENDERING: HABITS ──
function renderHabits() {
    const list = document.getElementById('habits-list');
    if (!list) return;
    list.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const record = AppState.records[today] || { habits: {} };

    AppState.habits.forEach(habit => {
        const done = !!record.habits[habit.id];
        const item = document.createElement('div');
        item.className = `card-item ${done ? 'completed' : ''}`;
        item.style.background = "transparent";
        item.innerHTML = `
            <div class="habit-icon" style="background:var(--accent-${habit.color});">
                ${habit.icon}
            </div>
            <div style="flex:1;">
                <div style="font-weight:500;">${habit.name}</div>
                <div style="font-size:12px; color:var(--text-secondary);">Ежедневно</div>
            </div>
            <div class="habit-check" style="width:28px; height:28px; border-radius:50%; border:1.5px solid ${done ? 'var(--accent)' : 'var(--border)'}; background:${done ? 'var(--accent)' : 'transparent'}; display:flex; align-items:center; justify-content:center; color:white;">
                ${done ? '✓' : ''}
            </div>
            <button class="btn-text" style="font-size:12px; color:var(--accent-red); margin-left:8px;" onclick="deleteHabit('${habit.id}', event)">✕</button>
        `;
        item.onclick = () => toggleHabit(habit.id);
        list.appendChild(item);
    });
}

// ── UI RENDERING: TASKS ──
function renderTasks() {
    const list = document.getElementById('tasks-list');
    if (!list) return;
    list.innerHTML = '';

    AppState.tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `card-item ${task.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <div class="priority-dot priority-${task.priority}"></div>
            <div style="flex:1; ${task.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">
                <div style="font-weight:500;">${task.name}</div>
            </div>
            <div class="task-check" style="width:24px; height:24px; border-radius:6px; border:1.5px solid var(--border); display:flex; align-items:center; justify-content:center; background:${task.completed ? 'var(--accent)' : 'transparent'}; color:white;">
                ${task.completed ? '✓' : ''}
            </div>
            <button class="btn-text" style="font-size:12px; color:var(--accent-red); margin-left:8px;" onclick="deleteTask('${task.id}', event)">✕</button>
        `;
        item.onclick = () => toggleTask(task.id);
        list.appendChild(item);
    });
}

// ── MODAL MANAGEMENT ──
let currentModalType = ''; 

function openModal(type) {
    currentModalType = type;
    const overlay = document.getElementById('modal-overlay');
    const sheet = document.getElementById('modal-sheet');
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    
    overlay.style.display = 'block';
    setTimeout(() => sheet.style.transform = 'translateY(0)', 10);
    
    if (type === 'habit') {
        title.textContent = 'Новая привычка';
        content.innerHTML = `
            <input type="text" id="inp-name" placeholder="Название" style="width:100%; padding:14px; border-radius:12px; border:1px solid var(--border); margin-bottom:16px; background:var(--system-card-elevated); color:var(--text-primary); font-size:16px;">
            <div style="display:flex; gap:12px; margin-bottom:16px;">
                <input type="text" id="inp-icon" value="✨" style="width:60px; text-align:center; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--system-card-elevated); font-size:24px;">
                <select id="inp-color" style="flex:1; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--system-card-elevated); color:var(--text-primary); font-size:16px;">
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="green">Green</option>
                    <option value="orange">Orange</option>
                    <option value="red">Red</option>
                </select>
            </div>
        `;
    } else {
        title.textContent = 'Новая задача';
        content.innerHTML = `
            <input type="text" id="inp-name" placeholder="Что нужно сделать?" style="width:100%; padding:14px; border-radius:12px; border:1px solid var(--border); margin-bottom:16px; background:var(--system-card-elevated); color:var(--text-primary); font-size:16px;">
            <div style="font-size:13px; color:var(--text-secondary); margin-bottom:12px; font-weight:600;">ПРИОРИТЕТ</div>
            <div style="display:flex; gap:8px;">
                <button class="btn-priority priority-ui-btn" data-p="low" style="flex:1; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--system-card-elevated); color:var(--text-primary);">Низкий</button>
                <button class="btn-priority priority-ui-btn" data-p="med" style="flex:1; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--system-card-elevated); color:var(--text-primary);">Средний</button>
                <button class="btn-priority priority-ui-btn" data-p="high" style="flex:1; padding:12px; border-radius:12px; border:1px solid var(--border); background:var(--system-card-elevated); color:var(--text-primary);">Высокий</button>
            </div>
        `;
        
        setTimeout(() => {
            document.querySelectorAll('.btn-priority').forEach(b => {
                b.onclick = () => {
                    document.querySelectorAll('.btn-priority').forEach(x => {
                        x.style.borderColor = 'var(--border)';
                        x.classList.remove('selected-priority');
                    });
                    b.style.borderColor = 'var(--accent)';
                    b.classList.add('selected-priority');
                };
            });
        }, 100);
    }
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    const sheet = document.getElementById('modal-sheet');
    sheet.style.transform = 'translateY(100%)';
    setTimeout(() => overlay.style.display = 'none', 300);
}

function saveFromModal() {
    const name = document.getElementById('inp-name').value;
    if (!name) return;

    if (currentModalType === 'habit') {
        const icon = document.getElementById('inp-icon').value;
        const color = document.getElementById('inp-color').value;
        AppState.habits.push({ id: Date.now().toString(), name, icon, color, schedule: [0,1,2,3,4,5,6] });
    } else {
        const pBtn = document.querySelector('.selected-priority');
        const priority = pBtn ? pBtn.dataset.p : 'low';
        AppState.tasks.push({ id: Date.now().toString(), name, priority, completed: false, date: new Date().toISOString().split('T')[0] });
    }

    Storage.save();
    updateDashboard();
    renderHabits();
    renderTasks();
    closeModal();
}

function deleteHabit(id, event) {
    event.stopPropagation();
    AppState.habits = AppState.habits.filter(h => h.id !== id);
    Storage.save();
    renderHabits();
    updateDashboard();
}

function deleteTask(id, event) {
    event.stopPropagation();
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    Storage.save();
    renderTasks();
    updateDashboard();
}

// ── CONNECTING EVENTS ──
document.getElementById('btn-add-habit').onclick = () => openModal('habit');
document.getElementById('btn-add-task').onclick = () => openModal('task');
document.getElementById('modal-save-btn').onclick = saveFromModal;
document.getElementById('modal-overlay').onclick = (e) => { if(e.target.id === 'modal-overlay') closeModal(); };

// Extra Dashboard Refresh
window.addEventListener('focus', updateDashboard);
setTimeout(() => {
    updateQuote();
    renderHabits();
    renderTasks();
}, 200);
