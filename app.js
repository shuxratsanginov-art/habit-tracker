/* ZEN PRODUCTIVITY PRO v4.0 — Full Rewrite */

// ── UTILS ──
function formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getLocalDate() { return formatDate(new Date()); }

// ── SVG ICON DICTIONARY ──
const IC = {
    meditation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M4 18h16"/><path d="M8 18c0-3 1-6 4-8 3 2 4 5 4 8"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    workout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M6 12h12M4 7h4M16 7h4M4 17h4M16 17h4"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
};

// ── STATE ──
const AppState = {
    settings: { currency: 'сум' },
    habits: [], tasks: [], finances: [],
    records: {}, // records[date] = { habits:{}, tasks:{}, reflect:{} }
    selectedDate: getLocalDate()
};

// ── STORAGE ──
const Storage = {
    tg: window.Telegram?.WebApp,
    async init() {
        if (this.tg?.initData) { this.tg.ready(); this.tg.expand(); await this.loadCloud(); }
        else { this.loadLocal(); }
        if (!AppState.habits.length) {
            AppState.habits = [
                {id:'h1',name:'Медитация',icon:'meditation',repeat:{type:'daily',value:[]}},
                {id:'h2',name:'Чтение',icon:'book',repeat:{type:'daily',value:[]}},
                {id:'h3',name:'Тренировка',icon:'workout',repeat:{type:'daily',value:[]}},
                {id:'h4',name:'Саморефлексия (Утро)',icon:'sun',repeat:{type:'daily',value:[]}},
                {id:'h5',name:'Саморефлексия (Вечер)',icon:'moon',repeat:{type:'daily',value:[]}}
            ];
            this.save();
        }
        updateDashboard();
    },
    loadLocal() { const d=localStorage.getItem('zen_v4'); if(d) Object.assign(AppState,JSON.parse(d)); },
    save() {
        localStorage.setItem('zen_v4', JSON.stringify(AppState));
        if (this.tg?.initData) {
            const cloud = JSON.parse(JSON.stringify(AppState));
            Object.keys(cloud.records).forEach(k => { if(cloud.records[k].reflect) delete cloud.records[k].reflect; });
            this.tg.CloudStorage.setItem('zen_v4', JSON.stringify(cloud));
        }
    },
    async loadCloud() {
        return new Promise(r => {
            this.tg.CloudStorage.getItem('zen_v4', (e,v) => { if(!e&&v) try{Object.assign(AppState,JSON.parse(v))}catch(x){} r(); });
        });
    }
};

// ── RECURRENCE ──
function isScheduledFor(item, dateStr) {
    if (!item.repeat || item.repeat.type === 'none') return item.date === dateStr;
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay(), adjDay = day===0?7:day, date = d.getDate();
    switch(item.repeat.type) {
        case 'daily': return true;
        case 'weekdays': return item.repeat.value.includes(adjDay);
        case 'monthly': return item.repeat.value.includes(date);
        default: return false;
    }
}

// ── NAVIGATION ──
function showPage(id, e) {
    if(e) e.preventDefault();
    document.querySelectorAll('.page').forEach(p => p.style.display='none');
    document.getElementById('page-'+id).style.display='block';
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    const idx={dashboard:0,habits:1,tasks:2,finance:3,reflect:4}[id];
    document.querySelectorAll('.tab-item')[idx]?.classList.add('active');
    if(id==='dashboard') updateDashboard();
    if(id==='habits') renderHabits();
    if(id==='tasks') renderTasks();
    if(id==='finance') renderFinance();
    if(id==='reflect') loadReflection();
}

// ── DASHBOARD ──
function updateDashboard() {
    const date = AppState.selectedDate;
    const rec = AppState.records[date] || {habits:{},tasks:{}};
    const aH = AppState.habits.filter(h=>isScheduledFor(h,date));
    const aT = AppState.tasks.filter(t=>isScheduledFor(t,date));
    const hD = aH.filter(h=>rec.habits[h.id]).length;
    const tD = aT.filter(t=>rec.tasks[t.id]).length;
    document.getElementById('h-count').textContent = `${hD}/${aH.length}`;
    document.getElementById('t-count').textContent = `${tD}/${aT.length}`;
    const total = aH.length+aT.length;
    document.getElementById('score-main').textContent = `${total?Math.round((hD+tD)/total*100):0}%`;
    renderWeekStrip();
    document.getElementById('quote-text').textContent = 'Всё начинается с одного шага.';
    document.getElementById('quote-author').textContent = '— Лао-цзы';
}

function renderWeekStrip() {
    const strip = document.getElementById('week-strip'); strip.innerHTML='';
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate()-(now.getDay()===0?6:now.getDay()-1));
    const DAYS=['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
    const today = getLocalDate();
    for(let i=0;i<7;i++){
        const d = new Date(start); d.setDate(start.getDate()+i);
        const dStr = formatDate(d);
        const el = document.createElement('div');
        el.className = `week-day ${dStr===AppState.selectedDate?'selected':''} ${dStr===today?'today':''}`;
        el.innerHTML = `<span class="day-name">${DAYS[i]}</span><span class="day-num">${d.getDate()}</span>`;
        el.onclick = () => { AppState.selectedDate=dStr; updateDashboard(); };
        strip.appendChild(el);
    }
}

// ── RENDERERS ──
function actionBtns(type, id) {
    return `<div style="display:flex;gap:4px"><button class="action-btn" onclick="editItem('${type}','${id}',event)">${IC.edit}</button><button class="action-btn" onclick="deleteItem('${type}','${id}',event)">${IC.trash}</button></div>`;
}

function renderHabits() {
    const list=document.getElementById('habits-list'); list.innerHTML='';
    const date=AppState.selectedDate, rec=AppState.records[date]||{habits:{}};
    AppState.habits.filter(h=>isScheduledFor(h,date)).forEach(h => {
        const done=!!rec.habits[h.id], el=document.createElement('div');
        el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML = `<div class="zen-icon">${IC[h.icon]||IC.bolt}</div><div style="flex:1"><div style="font-weight:700">${h.name}</div></div>${actionBtns('habit',h.id)}<div class="zen-check" onclick="toggleHabit('${h.id}',event)">${done?IC.check:''}</div>`;
        list.appendChild(el);
    });
}

function renderTasks() {
    const list=document.getElementById('tasks-list'); list.innerHTML='';
    const date=AppState.selectedDate, rec=AppState.records[date]||{tasks:{}};
    AppState.tasks.filter(t=>isScheduledFor(t,date)).forEach(t => {
        const done=!!rec.tasks[t.id], el=document.createElement('div');
        el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML = `<div style="width:4px;height:24px;border-radius:2px;background:var(--accent-${t.priority==='high'?'pink':'primary'})"></div><div style="flex:1"><div style="font-weight:700">${t.name}</div></div>${actionBtns('task',t.id)}<div class="zen-check" onclick="toggleTask('${t.id}',event)">${done?IC.check:''}</div>`;
        list.appendChild(el);
    });
}

function renderFinance() {
    const list=document.getElementById('finance-list'); list.innerHTML='';
    const date=AppState.selectedDate; let inc=0,exp=0;
    AppState.finances.filter(f=>isScheduledFor(f,date)).forEach(f => {
        if(f.type==='in') inc+=Number(f.amount); else exp+=Number(f.amount);
        const el=document.createElement('div'); el.className='zen-card';
        el.innerHTML = `<div class="zen-icon" style="color:${f.type==='in'?'var(--accent-secondary)':'var(--accent-pink)'}">${f.type==='in'?IC.up:IC.down}</div><div style="flex:1"><div style="font-weight:700">${f.name}</div></div><div style="font-weight:800;margin-right:8px;color:${f.type==='in'?'var(--accent-secondary)':'var(--accent-pink)'}">${f.type==='in'?'+':'-'}${Number(f.amount).toLocaleString()}</div>${actionBtns('finance',f.id)}`;
        list.appendChild(el);
    });
    document.getElementById('balance-income').textContent=inc.toLocaleString();
    document.getElementById('balance-expense').textContent=exp.toLocaleString();
    document.getElementById('balance-total').textContent=(inc-exp).toLocaleString();
}

// ── CRUD ──
function toggleHabit(id,e){if(e)e.stopPropagation();const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].habits[id]=!AppState.records[d].habits[id];Storage.save();renderHabits();updateDashboard();}
function toggleTask(id,e){if(e)e.stopPropagation();const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].tasks[id]=!AppState.records[d].tasks[id];Storage.save();renderTasks();updateDashboard();}
function deleteItem(type,id,e){if(e)e.stopPropagation();if(!confirm('Удалить?'))return;const k=type==='finance'?'finances':type+'s';AppState[k]=AppState[k].filter(x=>x.id!==id);Storage.save();showPage(type==='finance'?'finance':type+'s');}
function editItem(type,id,e){if(e)e.stopPropagation();const k=type==='finance'?'finances':type+'s';openModal(type,AppState[k].find(x=>x.id===id));}

// ── MODAL ──
let modalType='', modalId=null, selectedDays=new Set();

function openModal(type, item=null) {
    modalType=type; modalId=item?.id||null;
    document.getElementById('m-name').value = item?item.name:'';
    document.getElementById('m-repeat').value = item?.repeat?.type||'none';
    document.getElementById('m-finance-fields').style.display = type==='finance'?'block':'none';
    if(type==='finance'){
        document.getElementById('m-amount').value=item?item.amount:'';
        document.getElementById('m-type').value=item?item.type:'out';
    }
    // Weekdays
    selectedDays.clear();
    document.querySelectorAll('.wd-btn').forEach(b=>b.classList.remove('active'));
    if(item?.repeat?.type==='weekdays'){
        item.repeat.value.forEach(v=>{selectedDays.add(v);document.querySelector(`.wd-btn[data-day="${v}"]`)?.classList.add('active');});
    }
    toggleWeekdayPicker();
    document.getElementById('modal-title').textContent = item?'Изменить':(type==='finance'?'Бюджет':type==='habit'?'Привычка':'Задача');
    document.getElementById('modal-overlay').classList.add('active');
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('modal-sheet').classList.add('active')));
    setTimeout(()=>document.getElementById('m-name').focus(),400);
}

function closeModal() {
    document.getElementById('modal-sheet').classList.remove('active');
    setTimeout(()=>document.getElementById('modal-overlay').classList.remove('active'),350);
}

function toggleWeekdayPicker() {
    document.getElementById('m-weekdays').style.display = document.getElementById('m-repeat').value==='weekdays'?'flex':'none';
}

function saveFromModal() {
    const name=document.getElementById('m-name').value;
    if(!name) return;
    const rType=document.getElementById('m-repeat').value, date=AppState.selectedDate;
    let repeat={type:rType,value:[]};
    if(rType==='weekdays') repeat.value=[...selectedDays];
    if(rType==='monthly') repeat.value=[new Date(date+'T12:00:00').getDate()];
    const data={id:modalId||Date.now().toString(),name,repeat,date};
    if(modalType==='habit'){data.icon=data.icon||'bolt';}
    else if(modalType==='task'){data.priority='med';}
    else if(modalType==='finance'){data.amount=document.getElementById('m-amount').value;data.type=document.getElementById('m-type').value;}
    const k=modalType==='finance'?'finances':modalType+'s';
    if(modalId){const i=AppState[k].findIndex(x=>x.id===modalId);if(i>=0)AppState[k][i]=Object.assign(AppState[k][i],data);}
    else AppState[k].push(data);
    Storage.save(); closeModal();
    showPage(modalType==='finance'?'finance':modalType+'s');
}

// ── REFLECTION ──
function loadReflection() {
    const d=AppState.selectedDate, rec=AppState.records[d]||{}, r=rec.reflect||{};
    document.getElementById('ref-am-main').value = r.am_main||'';
    document.getElementById('ref-am-grateful').value = r.am_grateful||'';
    document.getElementById('ref-pm-good').value = r.pm_good||'';
    document.getElementById('ref-pm-improve').value = r.pm_improve||'';
    document.getElementById('ref-pm-learned').value = r.pm_learned||'';
    document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.remove('active');if(parseInt(b.dataset.val)===r.am_mood)b.classList.add('active');});
}

function saveReflection() {
    const d=AppState.selectedDate;
    if(!AppState.records[d]) AppState.records[d]={habits:{},tasks:{}};
    const mood = document.querySelector('.mood-btn.active');
    AppState.records[d].reflect = {
        am_main: document.getElementById('ref-am-main').value.slice(0,200),
        am_mood: mood?parseInt(mood.dataset.val):0,
        am_grateful: document.getElementById('ref-am-grateful').value.slice(0,200),
        pm_good: document.getElementById('ref-pm-good').value.slice(0,200),
        pm_improve: document.getElementById('ref-pm-improve').value.slice(0,200),
        pm_learned: document.getElementById('ref-pm-learned').value.slice(0,200)
    };
    Storage.save();
    alert('Записи сохранены!');
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
    await Storage.init();
    document.getElementById('btn-add-habit').onclick = () => openModal('habit');
    document.getElementById('btn-add-task').onclick = () => openModal('task');
    document.getElementById('btn-add-finance').onclick = () => openModal('finance');
    document.getElementById('modal-save-btn').onclick = saveFromModal;
    document.getElementById('btn-save-reflect').onclick = saveReflection;

    // Modal: clicking overlay closes, clicking sheet does NOT
    document.getElementById('modal-overlay').addEventListener('click', function(e){ if(e.target===this) closeModal(); });
    document.getElementById('modal-sheet').addEventListener('click', e => e.stopPropagation());
    document.getElementById('modal-sheet').addEventListener('touchstart', e => e.stopPropagation());

    // Weekday picker toggle
    document.getElementById('m-repeat').addEventListener('change', toggleWeekdayPicker);
    document.querySelectorAll('.wd-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            const day=parseInt(btn.dataset.day);
            if(selectedDays.has(day)){selectedDays.delete(day);btn.classList.remove('active');}
            else{selectedDays.add(day);btn.classList.add('active');}
        });
    });

    // Mood picker
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Live clock
    setInterval(()=>{document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});},1000);
    document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});

    showPage('dashboard');
});
