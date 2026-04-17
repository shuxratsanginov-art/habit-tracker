/* TASKIFY STYLE - ZEN PRODUCTIVITY v6.0 */
function formatDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function getLocalDate(){return formatDate(new Date())}
function dateLabel(s){return new Date(s+'T12:00:00').toLocaleDateString('en-US',{day:'numeric',month:'short'})}

const AppState={settings:{currency:'сум',theme:'dark',budgetLimits:{}},habits:[],tasks:[],finances:[],records:{},selectedDate:getLocalDate()};
let currentPage='dashboard';

// HAPTIC
function haptic(type){try{Telegram.WebApp.HapticFeedback[type.includes('.')?'notificationOccurred':'impactOccurred'](type.replace('.',''))}catch(e){}}

const Storage={
    tg:window.Telegram?.WebApp,
    async init(){
        if(this.tg?.initData){
            this.tg.ready();this.tg.expand();
            document.getElementById('user-name').textContent = this.tg.initDataUnsafe?.user?.first_name || 'User!';
            await this.loadCloud();
        } else {
            this.loadLocal();
        }
        this.migrate();
        if(!AppState.habits.length){
            // Default setup if totally empty
            AppState.habits=[
                {id:'h1',name:'Morning Meditation',icon:'bolt',repeat:{type:'daily',value:[]},date:getLocalDate()},
                {id:'h2',name:'Read 10 Pages',icon:'bolt',repeat:{type:'daily',value:[]},date:getLocalDate()}
            ];
            this.save();
        }
        
        // Setup dates in UI
        const now = new Date();
        document.getElementById('rc-date-text').textContent = dateLabel(getLocalDate());
        
        showPage('dashboard');
    },
    migrate(){
        const v4=localStorage.getItem('zen_v4'), v3=localStorage.getItem('zen_pro_v3');
        if(!localStorage.getItem('zen_v5') || AppState.habits.length <= 5){
            if(v3)try{Object.assign(AppState,JSON.parse(v3))}catch(e){}
            if(v4)try{Object.assign(AppState,JSON.parse(v4))}catch(e){}
        }
    },
    loadLocal(){const d=localStorage.getItem('zen_v5');if(d)try{Object.assign(AppState,JSON.parse(d))}catch(e){}},
    save(){
        localStorage.setItem('zen_v5',JSON.stringify(AppState));
        if(!this.tg?.initData)return;
        const core={settings:AppState.settings,habits:AppState.habits,tasks:AppState.tasks,finances:AppState.finances};
        try{this.tg.CloudStorage.setItem('zc5',JSON.stringify(core))}catch(e){}
        const months={};
        Object.keys(AppState.records).forEach(k=>{const m=k.slice(0,7);if(!months[m])months[m]={};months[m][k]=AppState.records[k]});
        Object.entries(months).forEach(([m,recs])=>{
            const trimmed={};Object.entries(recs).forEach(([k,v])=>{trimmed[k]={habits:v.habits||{},tasks:v.tasks||{}};if(v.reflect){const r={...v.reflect};Object.keys(r).forEach(f=>{if(typeof r[f]==='string')r[f]=r[f].slice(0,60)});trimmed[k].reflect=r}});
            try{this.tg.CloudStorage.setItem('zr_'+m,JSON.stringify(trimmed))}catch(e){}
        });
    },
    async loadCloud(){
        return new Promise(res=>{
            this.tg.CloudStorage.getItem('zc5',(e,v)=>{
                let c; try{ c = v ? JSON.parse(v) : null; }catch(x){}
                if(c && c.habits && c.habits.length > 5){
                    AppState.habits=c.habits;AppState.tasks=c.tasks||[];AppState.finances=c.finances||[];AppState.settings={...AppState.settings,...(c.settings||{})};
                    const now=new Date(),cm=formatDate(now).slice(0,7),pm=new Date(now.getFullYear(),now.getMonth()-1,1),pmk=formatDate(pm).slice(0,7);
                    let loaded=0;const done=()=>{loaded++;if(loaded>=2)res()};
                    [cm,pmk].forEach(m=>{this.tg.CloudStorage.getItem('zr_'+m,(e2,v2)=>{if(!e2&&v2)try{Object.assign(AppState.records,JSON.parse(v2))}catch(x){} done()})});
                } else {
                    this.tg.CloudStorage.getItem('zc',(e1,v1)=>{
                        if(!e1&&v1){
                            try{const c2=JSON.parse(v1);AppState.habits=c2.habits||[];AppState.tasks=c2.tasks||[];AppState.finances=c2.finances||[];AppState.settings={...AppState.settings,...(c2.settings||{})}}catch(x){}
                            this.tg.CloudStorage.getItem('zr',(e2,v2)=>{if(!e2&&v2)try{Object.assign(AppState.records,JSON.parse(v2))}catch(x){} res()});
                        } else {
                            this.tg.CloudStorage.getItem('zen_v4',(e3,v3)=>{
                                if(!e3&&v3){try{Object.assign(AppState,JSON.parse(v3))}catch(x){} res()}
                                else this.tg.CloudStorage.getItem('zen_data_v3',(e4,v4)=>{if(!e4&&v4)try{Object.assign(AppState,JSON.parse(v4))}catch(x){} res()});
                            });
                        }
                    });
                }
            });
        });
    }
};

function isScheduledFor(i,d){
    if(!i.repeat||i.repeat.type==='none')return i.date===d;
    if(i.date && d < i.date) return false; 
    const dt=new Date(d+'T12:00:00'),day=dt.getDay(),adj=day===0?7:day,dn=dt.getDate();
    switch(i.repeat.type){
        case'daily':return true;
        case'weekdays':case'weekly':return i.repeat.value.includes(adj);
        case'monthly':return i.repeat.value.includes(dn);
        default:return false
    }
}

// NAV
function showPage(id,e){
    if(e)e.preventDefault();
    currentPage=id;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+id).classList.add('active');
    document.querySelectorAll('.n-item').forEach(t=>t.classList.remove('active'));
    const btn = document.querySelector(`.n-item[data-target="${id}"]`);
    if(btn) btn.classList.add('active');
    refreshCurrentPage()
}
function refreshCurrentPage(){
    updateDashboard();
    renderTasks();
    renderStats();
    loadReflection();
}

function getDayStats(date){
    const rec=AppState.records[date]||{habits:{},tasks:{}};
    const aH=AppState.habits.filter(h=>!h.archived&&isScheduledFor(h,date));
    const aT=AppState.tasks.filter(t=>!t.archived&&isScheduledFor(t,date));
    const doneH=aH.filter(h=>rec.habits[h.id]).length;
    const doneT=aT.filter(t=>rec.tasks[t.id]).length;
    const tot = aH.length + aT.length;
    const done = doneH + doneT;
    return { aH, aT, doneH, doneT, tot, done, pct: tot ? Math.round(done/tot*100) : 0, rec };
}

// DASHBOARD LOGIC
function updateDashboard(){
    const date = AppState.selectedDate;
    const s = getDayStats(date);
    document.getElementById('rc-tasks-count').textContent = s.tot;
    document.getElementById('g-score').textContent = s.pct + '%';
    document.getElementById('g-done-txt').innerHTML = `Completed<br>${s.done}/${s.tot} task`;
    document.getElementById('g-prog-txt').textContent = `${s.tot - s.done} task`;

    // Render Habits in the "Priority Task" Green box
    const ph = document.getElementById('priority-task-list');
    ph.innerHTML = '';
    s.aH.forEach(h => {
        const isDone = s.rec.habits[h.id];
        const el = document.createElement('div');
        el.className = 'pt-item'; el.onclick = (e) => toggleH(h.id, e);
        el.innerHTML = `<div class="pt-check ${isDone?'done':''}">${isDone?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>':''}</div> <span style="${isDone?'text-decoration:line-through;opacity:0.5':''}">${h.name}</span>`;
        ph.appendChild(el);
    });

    // Render Tasks in "All Tasks"
    const tl = document.getElementById('home-task-list');
    tl.innerHTML = '';
    s.aT.slice(0, 3).forEach(t => tl.appendChild(createTaskCard(t, s.rec.tasks[t.id])));

    // Update the mini-bars randomly for activity feel based on pct
    const bars = document.getElementById('g-bars').children;
    for(let i=0; i<bars.length; i++){
        bars[i].style.height = Math.max(10, Math.random() * s.pct) + '%';
    }
}

function createTaskCard(t, isDone){
    const el = document.createElement('div');
    el.className = 't-card'; el.onclick = (e)=>{toggleT(t.id, e);};
    const ctg = t.priority === 'high' ? 'High' : 'Low';
    const ccol = t.priority === 'high' ? 'var(--high-bg)' : 'var(--low-bg)';
    
    el.innerHTML = `
        <div class="t-top">
            <div class="t-badge ${t.priority==='high'?'high':'low'}">${ctg}</div>
            <div class="t-tag"><div class="t-tag-dot" style="background:${ccol}"></div> ${isDone ? 'Completed' : 'Planned'}</div>
        </div>
        <div class="t-mid" style="${isDone?'text-decoration:line-through;opacity:0.5':''}">${t.name}</div>
        <div class="t-time"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${dateLabel(t.date)}</div>
        <div class="t-bot">
            <div>Due Date: ${dateLabel(t.date)}</div>
            <div style="display:flex;gap:4px">
                <button style="background:none;border:none;color:var(--text2);cursor:pointer" onclick="editItem('task','${t.id}',event)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button style="background:none;border:none;color:#ff2a85;cursor:pointer" onclick="deleteItem('task','${t.id}',event)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
            </div>
        </div>
    `;
    return el;
}

// TASKS PAGE LOGIC
function renderTasks(){
    const L = document.getElementById('tasks-list');
    L.innerHTML = '';
    const date = AppState.selectedDate;
    const s = getDayStats(date);
    document.getElementById('tasks-count-lbl').innerHTML = `${s.aT.length} Task <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
    
    // Sort tasks: high priority first
    const sorted=s.aT.sort((a,b)=>{const o={high:0,med:1,low:2};return(o[a.priority]||1)-(o[b.priority]||1)});
    sorted.forEach(t => L.appendChild(createTaskCard(t, s.rec.tasks[t.id])));
}

// STATS / ANALYTICS PAGE (Finance morphed into colors)
function renderStats(){
    const d=AppState.selectedDate;
    const s = getDayStats(d);
    
    // Gauge updating
    // Total circumference = 251.2
    // If we want it to look like the image:
    // Done is blue, Prog is cyan, Todo is pink. Stacked.
    // stroke-dasharray="length gap length gap"
    // To simplfy: offset them visually.
    const C = 251.2;
    const pct = s.tot === 0 ? 0 : s.done / s.tot;
    document.getElementById('g-big-pct').textContent = Math.round(pct*100) + '%';
    
    // Very crude visual arc logic. Full arc is C. offset is C - (pct * C).
    const fillAmt = pct * C;
    document.getElementById('g-arc-done').setAttribute('stroke-dashoffset', C - fillAmt);
    document.getElementById('g-arc-prog').setAttribute('stroke-dashoffset', C - (s.tot>0?0.8*C:0)); // Fake visual for "in progress"
    // "todo" is background, it spans 100% C.

    // Color cards from finances
    const FL = document.getElementById('finance-list');
    FL.innerHTML = '';
    let inc=0,exp=0;
    AppState.finances.filter(f=>isScheduledFor(f,d)).forEach(f=>{
        if(f.type==='in') inc+=Number(f.amount); else exp+=Number(f.amount);
    });
    
    // Generate some colorful summary cards from our finance limits/categories
    if(AppState.finances.length===0){
        FL.innerHTML = `<div class="c-card cg1" style="grid-column: 1 / span 2;text-align:center;justify-content:center">No expense tracked yet. Use + to track budget.</div>`;
    } else {
        const lims = AppState.settings.budgetLimits||{};
        let i=0;
        Object.entries(lims).forEach(([cat,max])=>{
            if(!max)return;
            const cg = i%2===0?'cg1':'cg2'; i++;
            const spent = AppState.finances.filter(f=>f.type==='out'&&f.category===cat&&f.date.slice(0,7)===d.slice(0,7)).reduce((sum,f)=>sum+Number(f.amount),0);
            const pct = Math.min(Math.round((spent/max)*100), 100);
            FL.innerHTML += `
                <div class="c-card ${cg}">
                    <div>
                        <div class="c-title">${cat} Expense</div>
                    </div>
                    <div>
                        <div class="c-date">Monthly cap: ${max}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800;margin-bottom:4px"><span>${spent}</span><span>${pct}%</span></div>
                        <div class="c-bar-bg"><div class="c-bar-fill" style="width:${pct}%"></div></div>
                    </div>
                </div>
            `;
        });
    }
}


function toggleFabMenu(){
    const ov = document.getElementById('fab-overlay');
    ov.classList.toggle('active');
    const fab = document.getElementById('main-fab');
    if(ov.classList.contains('active')){
        fab.style.transform = 'scale(0.9) rotate(45deg)';
        fab.style.background = '#ff2a85';
    } else {
        fab.style.transform = 'scale(1) rotate(0deg)';
        fab.style.background = 'var(--primary)';
    }
}
document.getElementById('fab-overlay').addEventListener('click', function(e){
    if(e.target===this) toggleFabMenu();
});

// CRUD ACTIONS
function toggleH(id,e){if(e)e.stopPropagation();haptic('light');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].habits[id]=!AppState.records[d].habits[id];Storage.save();refreshCurrentPage()}
function toggleT(id,e){if(e)e.stopPropagation();haptic('light');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].tasks[id]=!AppState.records[d].tasks[id];Storage.save();refreshCurrentPage()}
function deleteItem(t,id,e){if(e)e.stopPropagation();if(!confirm('Удалить?'))return;haptic('medium');const k=t==='finance'?'finances':t+'s';AppState[k]=AppState[k].filter(x=>x.id!==id);Storage.save();refreshCurrentPage()}
function editItem(t,id,e){if(e)e.stopPropagation();const k=t==='finance'?'finances':t+'s';openModal(t,AppState[k].find(x=>x.id===id))}

// MODAL LOGIC Re-used from v5
let modalType='',modalId=null,selDays=new Set();
function openModal(type,item=null){
    document.getElementById('fab-overlay').classList.remove('active');
    document.getElementById('main-fab').style.transform = 'scale(1) rotate(0deg)';
    document.getElementById('main-fab').style.background = 'var(--primary)';
    
    modalType=type;modalId=item?.id||null;document.getElementById('m-name').value=item?item.name:'';document.getElementById('m-repeat').value=item?.repeat?.type||'none';
    document.getElementById('m-finance-fields').style.display=type==='finance'?'block':'none';
    document.getElementById('m-priority-field').style.display=type==='task'?'block':'none';
    if(type==='task')document.getElementById('m-priority').value=item?.priority||'med';
    if(type==='finance'){document.getElementById('m-amount').value=item?item.amount:'';document.getElementById('m-type').value=item?item.type:'out';document.getElementById('m-category').value=item?.category||'Еда';toggleCatVis()}
    selDays.clear();document.querySelectorAll('.wd-btn').forEach(b=>b.classList.remove('active'));
    if(item?.repeat?.type==='weekdays')item.repeat.value.forEach(v=>{selDays.add(v);document.querySelector(`.wd-btn[data-day="${v}"]`)?.classList.add('active')});
    toggleWD();document.getElementById('modal-title').textContent=item?'Edit':(type==='finance'?'Budget Tracker':type==='habit'?'Daily Goal':'ToDo Task');
    document.getElementById('modal-overlay').classList.add('active');requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('modal-sheet').classList.add('active')));
    setTimeout(()=>document.getElementById('m-name').focus(),400)
}
function closeModal(){document.getElementById('modal-sheet').classList.remove('active');setTimeout(()=>document.getElementById('modal-overlay').classList.remove('active'),350)}
function toggleWD(){document.getElementById('m-weekdays').style.display=document.getElementById('m-repeat').value==='weekdays'?'flex':'none'}
function toggleCatVis(){document.getElementById('m-category').style.display=document.getElementById('m-type').value==='in'?'none':'block'}
function saveModal(){
    const name=document.getElementById('m-name').value;if(!name)return;haptic('light');
    const rT=document.getElementById('m-repeat').value,date=AppState.selectedDate;let rp={type:rT,value:[]};
    if(rT==='weekdays')rp.value=[...selDays];if(rT==='monthly')rp.value=[new Date(date+'T12:00:00').getDate()];
    const data={id:modalId||Date.now().toString(),name,repeat:rp,date};
    if(modalType==='habit')data.icon=data.icon||'bolt';
    else if(modalType==='task'){data.priority=document.getElementById('m-priority').value}
    else if(modalType==='finance'){data.amount=document.getElementById('m-amount').value;data.type=document.getElementById('m-type').value;if(data.type==='out')data.category=document.getElementById('m-category').value}
    const k=modalType==='finance'?'finances':modalType+'s';
    if(modalId){const i=AppState[k].findIndex(x=>x.id===modalId);if(i>=0)Object.assign(AppState[k][i],data)}else AppState[k].push(data);
    Storage.save();closeModal();refreshCurrentPage()
}

// REFLECTION (Calendar)
function loadReflection(){
    const r=AppState.records[AppState.selectedDate]?.reflect||{};
    document.getElementById('ref-am-grateful').value=r.am_grateful||'';
    document.getElementById('ref-pm-good').value=r.pm_good||'';
    document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.remove('active');if(parseInt(b.dataset.val)===r.am_mood)b.classList.add('active')});
    
    // Mini cal grid for reflection
    const g=document.getElementById('cal-grid');g.innerHTML='';const sel=AppState.selectedDate,y=parseInt(sel.slice(0,4)),m=parseInt(sel.slice(5,7));
    const first=new Date(y,m-1,1),days=new Date(y,m,0).getDate();let startDay=first.getDay();startDay=startDay===0?7:startDay;
    for(let i=1;i<startDay;i++){const e=document.createElement('div');e.style.opacity=0;g.appendChild(e)}
    const td=getLocalDate();
    for(let d=1;d<=days;d++){const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const el=document.createElement('div');
        el.style=`aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;border:1px solid transparent`;
        if(ds===td)el.style.borderColor='var(--card-blue)';
        if(ds===sel){el.style.background='var(--primary)';el.style.color='#fff';}
        el.textContent=d;el.onclick=()=>{AppState.selectedDate=ds;refreshCurrentPage()};g.appendChild(el)}
}
document.getElementById('btn-save-reflect').onclick=()=>{haptic('notification.success');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};
    AppState.records[d].reflect={am_mood:parseInt(document.querySelector('.mood-btn.active')?.dataset.val)||0,am_grateful:document.getElementById('ref-am-grateful').value.slice(0,300),pm_good:document.getElementById('ref-pm-good').value.slice(0,300)};
    Storage.save();alert('Saved!')}

// POMODORO & SETTINGS
let pomoInterval=null,pomoSec=25*60,pomoRunning=false,pomoMode='focus';
function openPomodoro(){document.getElementById('pomo-overlay').classList.add('active');requestAnimationFrame(()=>document.getElementById('pomo-sheet').classList.add('active'));updatePomoDisplay()}
function closePomodoro(){document.getElementById('pomo-sheet').classList.remove('active');setTimeout(()=>document.getElementById('pomo-overlay').classList.remove('active'),350)}
function updatePomoDisplay(){const m=Math.floor(pomoSec/60),s=pomoSec%60;document.getElementById('pomo-time').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const total=pomoMode==='focus'?25*60:5*60;const pct=(1-pomoSec/total)*327;document.getElementById('pomo-progress').setAttribute('stroke-dashoffset',String(327-pct));
    document.getElementById('pomo-label').textContent=pomoMode==='focus'?'Фокус':'Отдых'}
function startPomo(){if(pomoRunning){clearInterval(pomoInterval);pomoRunning=false;document.getElementById('pomo-start').textContent='Старт';return}
    pomoRunning=true;document.getElementById('pomo-start').textContent='Пауза';
    pomoInterval=setInterval(()=>{pomoSec--;if(pomoSec<=0){clearInterval(pomoInterval);pomoRunning=false;haptic('notification.success');
        if(pomoMode==='focus'){pomoMode='break';pomoSec=5*60}else{pomoMode='focus';pomoSec=25*60}document.getElementById('pomo-start').textContent='Старт'}updatePomoDisplay()},1000)}
function resetPomo(){clearInterval(pomoInterval);pomoRunning=false;pomoMode='focus';pomoSec=25*60;document.getElementById('pomo-start').textContent='Старт';updatePomoDisplay()}
function openSettings(){document.getElementById('settings-overlay').classList.add('active');requestAnimationFrame(()=>document.getElementById('settings-sheet').classList.add('active'))}
function closeSettings(){document.getElementById('settings-sheet').classList.remove('active');setTimeout(()=>document.getElementById('settings-overlay').classList.remove('active'),350)}
function exportData(){navigator.clipboard?.writeText(JSON.stringify(AppState,null,2)).then(()=>alert('Скопировано!'))}

document.addEventListener('DOMContentLoaded',async()=>{
    await Storage.init();
    document.getElementById('modal-save-btn').onclick=saveModal;
    document.getElementById('pomo-start').onclick=startPomo; document.getElementById('pomo-reset').onclick=resetPomo;
    document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target===this)closeModal()});
    document.getElementById('pomo-overlay').addEventListener('click',function(e){if(e.target===this)closePomodoro()});
    document.getElementById('settings-overlay').addEventListener('click',function(e){if(e.target===this)closeSettings()});
    [document.getElementById('modal-sheet'),document.getElementById('pomo-sheet'),document.getElementById('settings-sheet')].forEach(s=>{s.addEventListener('click',e=>e.stopPropagation());s.addEventListener('touchstart',e=>e.stopPropagation())});
    document.getElementById('m-repeat').addEventListener('change',toggleWD); document.getElementById('m-type').addEventListener('change',toggleCatVis);
    document.querySelectorAll('.wd-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const day=parseInt(b.dataset.day);if(selDays.has(day)){selDays.delete(day);b.classList.remove('active')}else{selDays.add(day);b.classList.add('active')}}));
    document.querySelectorAll('.mood-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();document.querySelectorAll('.mood-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
});
