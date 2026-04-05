/* ========================================
   ZEN PRODUCTIVITY PRO - v3.1 (Final Fix)
   Advanced Recurrence, Finance & Full CRUD
   ======================================== */

const AppState = {
    settings: { theme: 'obsidian', currency: 'сум' },
    habits: [],  
    tasks: [],   
    finances: [], 
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
        } else { this.loadLocal(); }
        
        // Restore Initial Habits if empty
        if (AppState.habits.length === 0) {
            AppState.habits = [
                { id: 'h1', name: 'Медитация', icon: '🧘', color: 'indigo', repeat: {type:'daily', value:[]} },
                { id: 'h2', name: 'Чтение', icon: '📖', color: 'indigo', repeat: {type:'daily', value:[]} },
                { id: 'h3', name: 'Тренировка', icon: '💪', color: 'orange', repeat: {type:'daily', value:[]} },
                { id: 'h4', name: 'Саморефлексия (Утро)', icon: '☀️', color: 'mint', repeat: {type:'daily', value:[]} },
                { id: 'h5', name: 'Саморефлексия (Вечер)', icon: '🌙', color: 'purple', repeat: {type:'daily', value:[]} }
            ];
            this.save();
        }
        
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
    if (!item.repeat || item.repeat.type === 'none') return item.date === dateStr;
    const d = new Date(dateStr);
    const day = d.getDay(); 
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
}

// ── CORE UPDATE ──
function updateDashboard() {
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits:{}, tasks:{} };
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

// ── RENDERING WITH ACTIONS ──
function getActionButtons(type, id) {
    return `<div style="display:flex; gap:8px;">
                <button class="action-btn edit" onclick="editItem('${type}', '${id}', event)">✎</button>
                <button class="action-btn" onclick="deleteItem('${type}', '${id}', event)">✕</button>
            </div>`;
}

function renderHabits() {
    const list = document.getElementById('habits-list');
    list.innerHTML = '';
    const date = AppState.selectedDate;
    const record = AppState.records[date] || { habits:{} };
    AppState.habits.filter(h => isScheduledFor(h, date)).forEach(h => {
        const done = !!record.habits[h.id];
        const card = document.createElement('div');
        card.className = `zen-card ${done ? 'completed' : ''}`;
        card.innerHTML = `<div class="zen-icon">${h.icon}</div>
                         <div style="flex:1;"><div style="font-weight:700;">${h.name}</div></div>
                         ${getActionButtons('habit', h.id)}
                         <div class="zen-check" onclick="toggleHabit('${h.id}', event)">${done?'✓':''}</div>`;
        card.onclick = () => editItem('habit', h.id);
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
        card.innerHTML = `<div style="width:4px; height:24px; background:var(--accent-${t.priority === 'high'?'pink':'primary'})"></div>
                         <div style="flex:1;"><div style="font-weight:700;">${t.name}</div></div>
                         ${getActionButtons('task', t.id)}
                         <div class="zen-check" onclick="toggleTask('${t.id}', event)">${done?'✓':''}</div>`;
        card.onclick = () => editItem('task', t.id);
        list.appendChild(card);
    });
}

function renderFinance() {
    const list = document.getElementById('finance-list');
    list.innerHTML = '';
    const date = AppState.selectedDate;
    let inc = 0, exp = 0;
    AppState.finances.filter(f => isScheduledFor(f, date)).forEach(f => {
        if(f.type === 'in') inc += Number(f.amount); else exp += Number(f.amount);
        const card = document.createElement('div');
        card.className = 'zen-card';
        card.innerHTML = `<div style="font-size:20px;">${f.type==='in'?'💰':'💸'}</div>
                         <div style="flex:1;"><b>${f.name}</b></div>
                         <div style="color:${f.type==='in'?'var(--accent-secondary)':'var(--accent-pink)'}; font-weight:800; margin-right:12px;">${f.type==='in'?'+':'-'}${Number(f.amount).toLocaleString()}</div>
                         ${getActionButtons('finance', f.id)}`;
        list.appendChild(card);
    });
    document.getElementById('balance-income').textContent = `${inc.toLocaleString()}`;
    document.getElementById('balance-expense').textContent = `${exp.toLocaleString()}`;
    document.getElementById('balance-total').textContent = `${(inc - exp).toLocaleString()}`;
}

// ── CRUD LOGIC ──
function toggleHabit(id, e) {
    if(e) e.stopPropagation();
    const date = AppState.selectedDate;
    if(!AppState.records[date]) AppState.records[date] = { habits:{}, tasks:{}, finances:{} };
    AppState.records[date].habits[id] = !AppState.records[date].habits[id];
    Storage.save(); renderHabits(); updateDashboard();
}

function toggleTask(id, e) {
    if(e) e.stopPropagation();
    const date = AppState.selectedDate;
    if(!AppState.records[date]) AppState.records[date] = { habits:{}, tasks:{}, finances:{} };
    AppState.records[date].tasks[id] = !AppState.records[date].tasks[id];
    Storage.save(); renderTasks(); updateDashboard();
}

function deleteItem(type, id, e) {
    if(e) e.stopPropagation();
    if(!confirm('Удалить?')) return;
    const key = type === 'finance' ? 'finances' : type + 's';
    AppState[key] = AppState[key].filter(x => x.id !== id);
    Storage.save(); 
    if(type === 'habit') renderHabits(); else if(type === 'task') renderTasks(); else renderFinance();
    updateDashboard();
}

function editItem(type, id, e) {
    if(e) e.stopPropagation();
    const key = type === 'finance' ? 'finances' : type + 's';
    const item = AppState[key].find(x => x.id === id);
    openModal(type, item);
}

// ── MODAL SYSTEM ──
function openModal(type, existingItem = null) {
    const list = document.getElementById('modal-content');
    const title = document.getElementById('modal-title');
    document.getElementById('modal-overlay').style.display = 'block';
    setTimeout(() => document.getElementById('modal-sheet').style.transform = 'translateY(0)', 10);

    title.textContent = existingItem ? 'Редактировать' : (type === 'finance' ? 'Новый расход/доход' : 'Новое дело/цель');
    
    let html = `<input type="text" id="m-name" placeholder="Название" value="${existingItem ? existingItem.name : ''}">`;
    if(type === 'finance') {
        html += `<input type="number" id="m-amount" placeholder="Сумма (сум)" value="${existingItem ? existingItem.amount : ''}">
                 <select id="m-type"><option value="out" ${existingItem?.type==='out'?'selected':''}>Расход</option><option value="in" ${existingItem?.type==='in'?'selected':''}>Доход</option></select>`;
    }
    html += `<select id="m-repeat">
                <option value="none" ${existingItem?.repeat?.type==='none'?'selected':''}>Без повтора</option>
                <option value="daily" ${existingItem?.repeat?.type==='daily'?'selected':''}>Каждый день</option>
                <option value="weekly" ${existingItem?.repeat?.type==='weekly'?'selected':''}>Раз в неделю</option>
                <option value="monthly" ${existingItem?.repeat?.type==='monthly'?'selected':''}>Раз в месяц</option>
             </select>`;
    
    list.innerHTML = html;
    document.getElementById('modal-save-btn').onclick = () => saveItem(type, existingItem?.id);
}

function saveItem(type, existingId) {
    const name = document.getElementById('m-name').value;
    if(!name) return;
    const repeatType = document.getElementById('m-repeat').value;
    const date = AppState.selectedDate;
    
    let repeat = { type: repeatType, value: [] };
    if(repeatType === 'weekly') repeat.value = [new Date(date).getDay() || 7];
    if(repeatType === 'monthly') repeat.value = [new Date(date).getDate()];

    const itemData = { id: existingId || Date.now().toString(), name, repeat, date };
    if(type === 'habit') { itemData.icon = '⚡'; itemData.color = 'indigo'; }
    else if(type === 'task') { itemData.priority = 'med'; }
    else if(type === 'finance') {
        itemData.amount = document.getElementById('m-amount').value;
        itemData.type = document.getElementById('m-type').value;
    }

    const key = type === 'finance' ? 'finances' : type + 's';
    if(existingId) {
        const idx = AppState[key].findIndex(x => x.id === existingId);
        AppState[key][idx] = Object.assign(AppState[key][idx], itemData);
    } else {
        AppState[key].push(itemData);
    }

    Storage.save(); closeModal(); 
    if(type === 'finance') renderFinance(); else if(type === 'habit') renderHabits(); else renderTasks();
    updateDashboard();
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
    showPage('dashboard');
});
