/* ========================================
   ZEN PRODUCTIVITY PRO - v2.0
   Logic, AI & Cloud Sync Engine
   ======================================== */

// ── STATE ──
const AppState = {
    settings: { theme: 'obsidian', lastSync: null },
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
        this.cleanOldRecords();
        updateDashboard();
    },

    loadLocal() {
        const data = localStorage.getItem('zen_state_v2');
        if (data) Object.assign(AppState, JSON.parse(data));
    },

    save() {
        localStorage.setItem('zen_state_v2', JSON.stringify(AppState));
        if (this.tg.initData) {
            const json = JSON.stringify(AppState);
            this.tg.CloudStorage.setItem('zen_data', json, (err) => {
                if (err) console.error('Sync Error:', err);
            });
        }
    },

    async loadCloud() {
        return new Promise((resolve) => {
            this.tg.CloudStorage.getItem('zen_data', (err, value) => {
                if (!err && value) {
                    try { Object.assign(AppState, JSON.parse(value)); } catch(e) {}
                }
                resolve();
            });
        });
    },

    cleanOldRecords() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const limit = thirtyDaysAgo.toISOString().split('T')[0];
        Object.keys(AppState.records).forEach(date => {
            if (date < limit) delete AppState.records[date];
        });
    }
};

// ── NAVIGATION ──
function showPage(pageId, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active-page');
    });
    
    const target = document.getElementById(`page-${pageId}`);
    target.style.display = 'block';
    setTimeout(() => target.classList.add('active-page'), 10);
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const indexMap = { dashboard: 0, habits: 1, tasks: 2, stats: 3 };
    document.querySelectorAll('.tab-item')[indexMap[pageId]]?.classList.add('active');
    
    document.getElementById('page-title').textContent = 
        pageId === 'dashboard' ? 'Сегодня' : 
        (pageId === 'habits' ? 'Привычки' : 
        (pageId === 'tasks' ? 'Задачи' : 'Тренды'));

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'habits') renderHabits();
    if (pageId === 'tasks') renderTasks();
    if (pageId === 'stats') renderStatsCharts();
}

// ── UI UPDATES ──
function updateDashboard() {
    const now = new Date();
    document.getElementById('header-time').textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits: {}, tasks: {} };

    // Habits Progress
    const hDone = Object.values(record.habits).filter(v => v).length;
    const hTotal = AppState.habits.length;
    document.getElementById('h-count').textContent = `${hDone}/${hTotal}`;

    // Tasks Progress
    const tDone = AppState.tasks.filter(t => t.completed && (!t.date || t.date === date)).length;
    const tTotal = AppState.tasks.filter(t => !t.date || t.date === date).length;
    document.getElementById('t-count').textContent = `${tDone}/${tTotal}`;

    // Pulse Score
    const totalDone = hDone + tDone;
    const totalAll = hTotal + tTotal;
    const percent = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;
    
    const scoreEl = document.getElementById('score-main');
    scoreEl.textContent = `${percent}%`;
    scoreEl.style.color = percent > 80 ? 'var(--accent-secondary)' : (percent > 40 ? 'var(--accent-primary)' : 'var(--accent-pink)');

    renderWeekStrip();
    generateSmartInsights();
}

function renderWeekStrip() {
    const strip = document.getElementById('week-strip');
    strip.innerHTML = '';
    const now = new Date();
    const start = new Date(now);
    const day = now.getDay();
    start.setDate(now.getDate() - (day === 0 ? 6 : day - 1));

    const NAMES = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    for(let i=0; i<7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const isToday = dStr === new Date().toISOString().split('T')[0];
        const isSel = dStr === AppState.selectedDate;

        const el = document.createElement('div');
        el.className = `week-day ${isSel ? 'selected' : ''} ${isToday ? 'today' : ''}`;
        el.innerHTML = `<span class="day-name">${NAMES[i]}</span><span class="day-num">${d.getDate()}</span>`;
        el.onclick = () => {
            AppState.selectedDate = dStr;
            updateDashboard();
        };
        strip.appendChild(el);
    }
}

// ── CRUD: HABITS & TASKS ──
function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';
    const record = AppState.records[AppState.selectedDate] || { habits: {} };

    AppState.habits.forEach(habit => {
        const done = !!record.habits[habit.id];
        const card = document.createElement('div');
        card.className = `zen-card ${done ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="zen-icon" style="color:var(--accent-primary)">${habit.icon}</div>
            <div style="flex:1;">
                <div style="font-weight:700; font-size:16px;">${habit.name}</div>
                <div style="font-size:11px; opacity:0.4; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">Привычка</div>
            </div>
            <div class="zen-check">${done ? '✓' : ''}</div>
            <button style="background:none; border:none; color:var(--accent-pink); padding:8px; font-size:18px;" onclick="deleteHabit('${habit.id}', event)">✕</button>
        `;
        card.onclick = () => toggleHabit(habit.id);
        list.appendChild(card);
    });
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    const date = AppState.selectedDate;

    AppState.tasks.filter(t => !t.date || t.date === date).forEach(task => {
        const card = document.createElement('div');
        card.className = `zen-card ${task.completed ? 'completed' : ''}`;
        const pColor = task.priority === 'high' ? 'var(--accent-pink)' : (task.priority === 'med' ? 'var(--accent-primary)' : 'var(--accent-cyan)');
        card.innerHTML = `
            <div style="width:4px; height:32px; border-radius:2px; background:${pColor};"></div>
            <div style="flex:1;">
                <div style="font-weight:700; font-size:16px; ${task.completed ? 'text-decoration:line-through; opacity:0.4' : ''}">${task.name}</div>
            </div>
            <div class="zen-check">${task.completed ? '✓' : ''}</div>
            <button style="background:none; border:none; color:var(--accent-pink); padding:8px; font-size:18px;" onclick="deleteTask('${task.id}', event)">✕</button>
        `;
        card.onclick = () => toggleTask(task.id);
        list.appendChild(card);
    });
}

function toggleHabit(id) {
    const d = AppState.selectedDate;
    if(!AppState.records[d]) AppState.records[d] = { habits: {}, tasks: {}, mood: 3 };
    const cur = !!AppState.records[d].habits[id];
    AppState.records[d].habits[id] = !cur;
    
    if(Storage.tg.initData) Storage.tg.HapticFeedback.impactOccurred('light');
    Storage.save();
    updateDashboard();
    renderHabits();
}

function toggleTask(id) {
    const t = AppState.tasks.find(x => x.id === id);
    if(t) {
        t.completed = !t.completed;
        if(Storage.tg.initData) Storage.tg.HapticFeedback.notificationOccurred('success');
        Storage.save();
        updateDashboard();
        renderTasks();
    }
}

// ── SMART ENGINE ──
function generateSmartInsights() {
    const habits = AppState.habits;
    const records = AppState.records;
    const dates = Object.keys(records).sort().reverse();
    const insights = [];

    habits.forEach(h => {
        let fails = 0;
        for(let i=0; i<Math.min(dates.length, 5); i++) {
            if(!records[dates[i]].habits[h.id]) fails++;
            else break;
        }
        if(fails >= 3) insights.push(`Твой ритм сбит: "${h.name}" пропущена ${fails} раз. Давай попробуем зайти с другой стороны? ⚡`);
    });

    const box = document.getElementById('ai-insight-box');
    const text = document.getElementById('ai-insight-text');
    if(insights.length > 0) {
        box.style.display = 'flex';
        text.textContent = insights[0];
    } else {
        box.style.display = 'none';
    }
}

function renderStatsCharts() {
    const chart = document.getElementById('chart-weekly');
    chart.innerHTML = '';
    const dates = [];
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }

    dates.forEach(date => {
        const r = AppState.records[date] || { habits: {}, tasks: {} };
        const hDone = Object.values(r.habits).filter(v => v).length;
        const tDone = AppState.tasks.filter(t => t.completed && t.date === date).length;
        const total = AppState.habits.length + AppState.tasks.filter(t => !t.date || t.date === date).length || 1;
        const h = Math.max(10, Math.round(((hDone + tDone) / total) * 100));
        
        const bar = document.createElement('div');
        bar.style.cssText = `width:12px; height:${h}%; background:var(--accent-primary); border-radius:10px; box-shadow:var(--glow-primary); transition: height 0.8s ease;`;
        chart.appendChild(bar);
    });
}

// ── MODALS ──
let modalType = '';
function openModal(type) {
    modalType = type;
    document.getElementById('modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('modal-sheet').style.transform = 'translateY(0)', 10);
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    
    if(type === 'habit') {
        title.textContent = 'Новая Привычка';
        content.innerHTML = `
            <input type="text" id="m-name" placeholder="Чего достигнем?">
            <div style="display:flex; gap:12px;">
                <input type="text" id="m-icon" value="⚡" style="width:70px; text-align:center;">
                <select id="m-meta"><option value="indigo">Electric Indigo</option><option value="mint">Cyber Mint</option></select>
            </div>
        `;
    } else {
        title.textContent = 'Новая Задача';
        content.innerHTML = `
            <input type="text" id="m-name" placeholder="Что нужно сделать?">
            <select id="m-meta"><option value="low">Низкий приоритет</option><option value="med">Средний приоритет</option><option value="high">Высокий приоритет</option></select>
        `;
    }
}

function closeModal() {
    document.getElementById('modal-sheet').style.transform = 'translateY(100%)';
    setTimeout(() => document.getElementById('modal-overlay').style.display = 'none', 400);
}

function saveModal() {
    const name = document.getElementById('m-name').value;
    if(!name) return;
    const meta = document.getElementById('m-meta').value;

    if(modalType === 'habit') {
        AppState.habits.push({ id: Date.now().toString(), name, icon: document.getElementById('m-icon').value, color: meta });
    } else {
        AppState.tasks.push({ id: Date.now().toString(), name, priority: meta, completed: false, date: AppState.selectedDate });
    }

    Storage.save();
    closeModal();
    updateDashboard();
    renderHabits();
    renderTasks();
}

function deleteHabit(id, e) {
    e.stopPropagation();
    AppState.habits = AppState.habits.filter(h => h.id !== id);
    Storage.save();
    renderHabits();
    updateDashboard();
}

function deleteTask(id, e) {
    e.stopPropagation();
    AppState.tasks = AppState.tasks.filter(t => t.id !== id);
    Storage.save();
    renderTasks();
    updateDashboard();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
    await Storage.init();
    
    // First Run
    if(AppState.habits.length === 0) {
        AppState.habits = [{ id: '1', name: 'Медитация', icon: '🧘', color: 'indigo' }];
        Storage.save();
    }

    document.getElementById('btn-add-habit').onclick = () => openModal('habit');
    document.getElementById('btn-add-task').onclick = () => openModal('task');
    document.getElementById('modal-save-btn').onclick = saveModal;
    document.getElementById('modal-overlay').onclick = (e) => { if(e.target.id === 'modal-overlay') closeModal(); };

    document.getElementById('quote-text').textContent = "Всё начинается с одного шага.";
    document.getElementById('quote-author').textContent = "— Лао-цзы";

    setInterval(() => {
        document.getElementById('header-time').textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }, 60000);
});
