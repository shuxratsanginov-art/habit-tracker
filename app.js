/* ========================================
   ZEN PRODUCTIVITY PRO - v3.0 (Enterprise)
   Advanced Recurrence & Finance (UZS)
   ======================================== */

const AppState = {
    settings: { theme: 'obsidian', currency: 'сум' },
    habits: [],  // {id, name, icon, color, repeat: {type, value}}
    tasks: [],   // {id, name, priority, repeat: {type, value}, date}
    finances: [], // {id, name, amount, type: 'in/out', repeat: {type, value}, date}
    records: {}, // { 'YYYY-MM-DD': { habits: {id: bool}, tasks: {id: bool}, finances: {id: bool} } }
    selectedDate: new Date().toISOString().split('T')[0]
};

const Storage = {
    tg: window.Telegram.WebApp,
    async init() {
        if (this.tg.initData) {
            this.tg.ready();
            this.tg.expand();
            await this.loadCloud();
        } else { this.loadLocal(); }
        updateDashboard();
    },
    loadLocal() {
        const data = localStorage.getItem('zen_pro_v3');
        if (data) Object.assign(AppState, JSON.parse(data));
    },
    save() {
        localStorage.setItem('zen_pro_v3', JSON.stringify(AppState));
        if (this.tg.initData) {
            this.tg.CloudStorage.setItem('zen_data_v3', JSON.stringify(AppState));
        }
    },
    async loadCloud() {
        return new Promise(res => {
            this.tg.CloudStorage.getItem('zen_data_v3', (err, val) => {
                if (!err && val) try { Object.assign(AppState, JSON.parse(val)); } catch(e){}
                res();
            });
        });
    }
};

// ── RECURRENCE ENGINE ──
function isScheduledFor(item, dateStr) {
    if (!item.repeat || item.repeat.type === 'none') {
        return item.date === dateStr;
    }
    const d = new Date(dateStr);
    const day = d.getDay(); // 0-Sun, 1-Mon
    const adjDay = day === 0 ? 7 : day;
    const date = d.getDate();

    switch (item.repeat.type) {
        case 'daily': return true;
        case 'weekly': return item.repeat.value.includes(adjDay);
        case 'monthly': return item.repeat.value.includes(date);
        default: return false;
    }
}

// ── UI: NAVIGATION ──
function showPage(pageId, e) {
    if (e) e.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';
    
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const idx = { dashboard:0, habits:1, tasks:2, finance:3, stats:4 }[pageId];
    document.querySelectorAll('.tab-item')[idx]?.classList.add('active');
    
    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'habits') renderHabits();
    if (pageId === 'tasks') renderTasks();
    if (pageId === 'finance') renderFinance();
    if (pageId === 'stats') renderStats();
}

// ── CORE UPDATE ──
function updateDashboard() {
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits:{}, tasks:{}, finances:{} };

    // Filter Active Items for Today
    const activeHabits = AppState.habits.filter(h => isScheduledFor(h, date));
    const activeTasks = AppState.tasks.filter(t => isScheduledFor(t, date));
    
    const hDone = activeHabits.filter(h => record.habits[h.id]).length;
    const tDone = activeTasks.filter(t => record.tasks[t.id]).length;

    document.getElementById('h-count').textContent = `${hDone}/${activeHabits.length}`;
    document.getElementById('t-count').textContent = `${tDone}/${activeTasks.length}`;

    const total = activeHabits.length + activeTasks.length;
    const percent = total > 0 ? Math.round(((hDone + tDone) / total) * 100) : 0;
    document.getElementById('score-main').textContent = `${percent}%`;

    renderWeekStrip();
}

function renderWeekStrip() {
    const strip = document.getElementById('week-strip');
    strip.innerHTML = '';
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));

    const DAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
    for(let i=0; i<7; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const isSel = dStr === AppState.selectedDate;
        const el = document.createElement('div');
        el.className = `week-day ${isSel ? 'selected' : ''}`;
        el.innerHTML = `<span class="day-name">${DAYS[i]}</span><span class="day-num">${d.getDate()}</span>`;
        el.onclick = () => { AppState.selectedDate = dStr; updateDashboard(); };
        strip.appendChild(el);
    }
}

// ── TASK/HABIT RENDERING ──
function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits:{} };

    AppState.habits.filter(h => isScheduledFor(h, date)).forEach(h => {
        const done = !!record.habits[h.id];
        const card = document.createElement('div');
        card.className = `zen-card ${done ? 'completed' : ''}`;
        card.innerHTML = `<div class="zen-icon">${h.icon}</div><div style="flex:1;"><div style="font-weight:700;">${h.name}</div></div><div class="zen-check">${done?'✓':''}</div>`;
        card.onclick = () => {
            if(!AppState.records[date]) AppState.records[date] = { habits:{}, tasks:{}, finances:{} };
            AppState.records[date].habits[h.id] = !done;
            Storage.save(); renderHabits(); updateDashboard();
        };
        list.appendChild(card);
    });
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { tasks:{} };

    AppState.tasks.filter(t => isScheduledFor(t, date)).forEach(t => {
        const done = !!record.tasks[t.id];
        const card = document.createElement('div');
        card.className = `zen-card ${done ? 'completed' : ''}`;
        card.innerHTML = `<div style="width:4px; height:24px; background:var(--accent-${t.priority === 'high'?'pink':'primary'})"></div><div style="flex:1;"><div style="font-weight:700;">${t.name}</div></div><div class="zen-check">${done?'✓':''}</div>`;
        card.onclick = () => {
            if(!AppState.records[date]) AppState.records[date] = { habits:{}, tasks:{}, finances:{} };
            AppState.records[date].tasks[t.id] = !done;
            Storage.save(); renderTasks(); updateDashboard();
        };
        list.appendChild(card);
    });
}

// ── FINANCE MODULE ──
function renderFinance() {
    const date = AppState.selectedDate;
    const activeFin = AppState.finances.filter(f => isScheduledFor(f, date));
    
    let inc = 0, exp = 0;
    const list = document.getElementById('finance-list');
    list.innerHTML = '';

    activeFin.forEach(f => {
        if(f.type === 'in') inc += Number(f.amount); else exp += Number(f.amount);
        const card = document.createElement('div');
        card.className = 'zen-card';
        card.innerHTML = `<div style="font-size:20px;">${f.type==='in'?'💰':'💸'}</div><div style="flex:1;"><b>${f.name}</b></div><div style="color:${f.type==='in'?'var(--accent-secondary)':'var(--accent-pink)'}; font-weight:800;">${f.type==='in'?'+':'-'}${Number(f.amount).toLocaleString()} ${AppState.settings.currency}</div>`;
        list.appendChild(card);
    });

    document.getElementById('balance-income').textContent = `${inc.toLocaleString()}`;
    document.getElementById('balance-expense').textContent = `${exp.toLocaleString()}`;
    document.getElementById('balance-total').textContent = `${(inc - exp).toLocaleString()}`;
}

// ── MODALS ──
function openModal(type) {
    const content = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    document.getElementById('modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('modal-sheet').style.transform = 'translateY(0)', 10);

    let html = `<input type="text" id="m-name" placeholder="Название">`;
    if(type === 'finance') {
        html += `<input type="number" id="m-amount" placeholder="Сумма (сум)">
                 <select id="m-type"><option value="out">Расход</option><option value="in">Доход</option></select>`;
    }
    html += `<select id="m-repeat">
                <option value="none">Без повтора</option>
                <option value="daily">Каждый день</option>
                <option value="weekly">Раз в неделю (ПН)</option>
                <option value="monthly">Раз в месяц (сегодня)</option>
             </select>`;
    
    content.innerHTML = html;
    document.getElementById('modal-save-btn').onclick = () => saveItem(type);
}

function saveItem(type) {
    const name = document.getElementById('m-name').value;
    const repeatType = document.getElementById('m-repeat').value;
    const date = AppState.selectedDate;
    
    let repeat = { type: repeatType, value: [] };
    if(repeatType === 'weekly') repeat.value = [new Date(date).getDay() || 7];
    if(repeatType === 'monthly') repeat.value = [new Date(date).getDate()];

    const newItem = { id: Date.now().toString(), name, repeat, date };

    if(type === 'habit') { newItem.icon = '⚡'; AppState.habits.push(newItem); }
    else if(type === 'task') { newItem.priority = 'med'; AppState.tasks.push(newItem); }
    else if(type === 'finance') {
        newItem.amount = document.getElementById('m-amount').value;
        newItem.type = document.getElementById('m-type').value;
        AppState.finances.push(newItem);
    }

    Storage.save(); closeModal(); showPage(type === 'finance' ? 'finance' : type + 's');
}

function closeModal() {
    document.getElementById('modal-sheet').style.transform = 'translateY(100%)';
    setTimeout(() => document.getElementById('modal-overlay').style.display = 'none', 400);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
    await Storage.init();
    document.getElementById('btn-add-habit').onclick = () => openModal('habit');
    document.getElementById('btn-add-task').onclick = () => openModal('task');
    document.getElementById('btn-add-finance').onclick = () => openModal('finance');
    document.getElementById('modal-overlay').onclick = closeModal;
    updateDashboard();
});
