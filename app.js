/* ZEN PRODUCTIVITY v4.2 */

function formatDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function getLocalDate(){return formatDate(new Date())}
function dateLabel(s){const d=new Date(s+'T12:00:00');return d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',weekday:'short'})}
const MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const IC={
    meditation:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M4 18h16"/><path d="M8 18c0-3 1-6 4-8 3 2 4 5 4 8"/></svg>',
    book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    workout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M6 12h12M4 7h4M16 7h4M4 17h4M16 17h4"/></svg>',
    sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
};
const CAT_COL={'Еда':'#f43f5e','Транспорт':'#6366f1','Жильё':'#f59e0b','Развлечения':'#8b5cf6','Связь':'#06b6d4','Здоровье':'#10b981','Одежда':'#ec4899','Образование':'#3b82f6','Подписки':'#a855f7','Другое':'#64748b'};

const AppState={settings:{currency:'сум'},habits:[],tasks:[],finances:[],records:{},selectedDate:getLocalDate()};
let currentPage='dashboard';
let pieMonth=null; // YYYY-MM for pie chart

// STORAGE — uses 2 cloud keys for more capacity
const Storage={
    tg:window.Telegram?.WebApp,
    async init(){
        if(this.tg?.initData){this.tg.ready();this.tg.expand();await this.loadCloud()}
        else this.loadLocal();
        this.migrate();
        if(!AppState.habits.length){
            AppState.habits=[
                {id:'h1',name:'Медитация',icon:'meditation',repeat:{type:'daily',value:[]}},
                {id:'h2',name:'Чтение',icon:'book',repeat:{type:'daily',value:[]}},
                {id:'h3',name:'Тренировка',icon:'workout',repeat:{type:'daily',value:[]}},
                {id:'h4',name:'Саморефлексия (Утро)',icon:'sun',repeat:{type:'daily',value:[]}},
                {id:'h5',name:'Саморефлексия (Вечер)',icon:'moon',repeat:{type:'daily',value:[]}}
            ];this.save();
        }
        pieMonth=AppState.selectedDate.slice(0,7);
        showPage('dashboard');
    },
    migrate(){
        if(!localStorage.getItem('zen_v4')){
            const old=localStorage.getItem('zen_pro_v3');
            if(old)try{Object.assign(AppState,JSON.parse(old))}catch(e){}
        }
    },
    loadLocal(){const d=localStorage.getItem('zen_v4');if(d)try{Object.assign(AppState,JSON.parse(d))}catch(e){}},
    save(){
        localStorage.setItem('zen_v4',JSON.stringify(AppState));
        if(!this.tg?.initData)return;
        // Split into 2 keys for more cloud space
        const core={settings:AppState.settings,habits:AppState.habits,tasks:AppState.tasks,finances:AppState.finances};
        try{this.tg.CloudStorage.setItem('zc',JSON.stringify(core))}catch(e){}
        // Records: keep 30 days, trim reflection
        const recs={};const cut=new Date();cut.setDate(cut.getDate()-30);const cutS=formatDate(cut);
        Object.keys(AppState.records).forEach(k=>{
            if(k>=cutS){
                recs[k]={habits:AppState.records[k].habits||{},tasks:AppState.records[k].tasks||{}};
                if(AppState.records[k].reflect){
                    const r={...AppState.records[k].reflect};
                    Object.keys(r).forEach(f=>{if(typeof r[f]==='string')r[f]=r[f].slice(0,60)});
                    recs[k].reflect=r;
                }
            }
        });
        try{this.tg.CloudStorage.setItem('zr',JSON.stringify(recs))}catch(e){}
    },
    async loadCloud(){
        return new Promise(res=>{
            // Load core
            this.tg.CloudStorage.getItem('zc',(e1,v1)=>{
                if(!e1&&v1)try{const c=JSON.parse(v1);AppState.habits=c.habits||[];AppState.tasks=c.tasks||[];AppState.finances=c.finances||[];AppState.settings=c.settings||AppState.settings}catch(x){}
                // Load records
                this.tg.CloudStorage.getItem('zr',(e2,v2)=>{
                    if(!e2&&v2)try{AppState.records=JSON.parse(v2)}catch(x){}
                    else{// Fallback: try old single key
                        this.tg.CloudStorage.getItem('zen_v4',(e3,v3)=>{
                            if(!e3&&v3)try{Object.assign(AppState,JSON.parse(v3))}catch(x){}
                            else this.tg.CloudStorage.getItem('zen_data_v3',(e4,v4)=>{if(!e4&&v4)try{Object.assign(AppState,JSON.parse(v4))}catch(x){}});
                            res();return;
                        });return;
                    }
                    res();
                });
            });
        });
    }
};

function isScheduledFor(item,dateStr){
    if(!item.repeat||item.repeat.type==='none')return item.date===dateStr;
    const d=new Date(dateStr+'T12:00:00'),day=d.getDay(),adj=day===0?7:day,dt=d.getDate();
    switch(item.repeat.type){
        case'daily':return true;case'weekdays':case'weekly':return item.repeat.value.includes(adj);
        case'monthly':return item.repeat.value.includes(dt);default:return false;
    }
}

function showPage(id,e){
    if(e)e.preventDefault();currentPage=id;
    document.querySelectorAll('.page').forEach(p=>p.style.display='none');
    document.getElementById('page-'+id).style.display='block';
    document.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('active'));
    ({dashboard:0,habits:1,tasks:2,finance:3,reflect:4})[id]!==undefined&&document.querySelectorAll('.tab-item')[({dashboard:0,habits:1,tasks:2,finance:3,reflect:4})[id]]?.classList.add('active');
    refreshCurrentPage();
}
function refreshCurrentPage(){
    renderWeekStrip();
    if(currentPage==='dashboard')updateDashboard();
    if(currentPage==='habits')renderHabits();
    if(currentPage==='tasks')renderTasks();
    if(currentPage==='finance')renderFinance();
    if(currentPage==='reflect')loadReflection();
}

function updateDashboard(){
    const date=AppState.selectedDate,rec=AppState.records[date]||{habits:{},tasks:{}};
    const aH=AppState.habits.filter(h=>isScheduledFor(h,date)),aT=AppState.tasks.filter(t=>isScheduledFor(t,date));
    const hD=aH.filter(h=>rec.habits[h.id]).length,tD=aT.filter(t=>rec.tasks[t.id]).length;
    document.getElementById('h-count').textContent=`${hD}/${aH.length}`;
    document.getElementById('t-count').textContent=`${tD}/${aT.length}`;
    const tot=aH.length+aT.length;
    document.getElementById('score-main').textContent=`${tot?Math.round((hD+tD)/tot*100):0}%`;
    document.getElementById('quote-text').textContent='Всё начинается с одного шага.';
    document.getElementById('quote-author').textContent='— Лао-цзы';
}

function renderWeekStrip(){
    const strip=document.getElementById('week-strip');strip.innerHTML='';
    const now=new Date(),start=new Date(now);start.setDate(now.getDate()-(now.getDay()===0?6:now.getDay()-1));
    const D=['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],today=getLocalDate();
    for(let i=0;i<7;i++){
        const d=new Date(start);d.setDate(start.getDate()+i);const s=formatDate(d),el=document.createElement('div');
        el.className=`week-day ${s===AppState.selectedDate?'selected':''} ${s===today?'today':''}`;
        el.innerHTML=`<span class="day-name">${D[i]}</span><span class="day-num">${d.getDate()}</span>`;
        el.onclick=()=>{AppState.selectedDate=s;refreshCurrentPage()};
        strip.appendChild(el);
    }
}

function actBtns(type,id){
    return `<div style="display:flex;gap:2px"><button class="act-btn" onclick="editItem('${type}','${id}',event)">${IC.edit}</button><button class="act-btn" onclick="deleteItem('${type}','${id}',event)">${IC.trash}</button></div>`;
}

function renderHabits(){
    const L=document.getElementById('habits-list');L.innerHTML='';
    const date=AppState.selectedDate,rec=AppState.records[date]||{habits:{}};
    AppState.habits.filter(h=>isScheduledFor(h,date)).forEach(h=>{
        const done=!!rec.habits[h.id],el=document.createElement('div');
        el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML=`<div class="zen-icon">${IC[h.icon]||IC.bolt}</div><div style="flex:1"><div style="font-weight:700;font-size:15px">${h.name}</div></div>${actBtns('habit',h.id)}<div class="zen-check" onclick="toggleH('${h.id}',event)">${done?IC.check:''}</div>`;
        L.appendChild(el);
    });
}

function renderTasks(){
    const L=document.getElementById('tasks-list');L.innerHTML='';
    const date=AppState.selectedDate,rec=AppState.records[date]||{tasks:{}};
    AppState.tasks.filter(t=>isScheduledFor(t,date)).forEach(t=>{
        const done=!!rec.tasks[t.id],el=document.createElement('div');
        el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML=`<div style="width:4px;height:24px;border-radius:2px;background:var(--${t.priority==='high'?'pink':'pri'})"></div><div style="flex:1"><div style="font-weight:700;font-size:15px">${t.name}</div></div>${actBtns('task',t.id)}<div class="zen-check" onclick="toggleT('${t.id}',event)">${done?IC.check:''}</div>`;
        L.appendChild(el);
    });
}

function renderFinance(){
    const L=document.getElementById('finance-list');L.innerHTML='';
    const date=AppState.selectedDate;let inc=0,exp=0;
    AppState.finances.filter(f=>isScheduledFor(f,date)).forEach(f=>{
        if(f.type==='in')inc+=Number(f.amount);else exp+=Number(f.amount);
        const el=document.createElement('div');el.className='zen-card';
        const isIn=f.type==='in';
        // NO category shown for income
        el.innerHTML=`<div class="zen-icon" style="color:${isIn?'var(--sec)':'var(--pink)'}">${isIn?IC.up:IC.down}</div><div style="flex:1"><div style="font-weight:700;font-size:15px">${f.name}</div>${!isIn&&f.category?`<div style="font-size:11px;color:${CAT_COL[f.category]||'#64748b'};margin-top:2px">${f.category}</div>`:''}</div><div style="font-weight:800;font-size:14px;margin-right:6px;color:${isIn?'var(--sec)':'var(--pink)'}">${isIn?'+':'-'}${Number(f.amount).toLocaleString()}</div>${actBtns('finance',f.id)}`;
        L.appendChild(el);
    });
    document.getElementById('bal-in').textContent=inc.toLocaleString();
    document.getElementById('bal-out').textContent=exp.toLocaleString();
    document.getElementById('balance-total').textContent=(inc-exp).toLocaleString();
    renderPieChart();
}

// PIE CHART with month navigation
function renderPieChart(){
    if(!pieMonth)pieMonth=AppState.selectedDate.slice(0,7);
    const svg=document.getElementById('pie-chart'),legend=document.getElementById('pie-legend');
    svg.innerHTML='';legend.innerHTML='';
    const y=parseInt(pieMonth.slice(0,4)),m=parseInt(pieMonth.slice(5,7));
    document.getElementById('fin-month').textContent=`${MONTHS[m-1]} ${y}`;
    const days=new Date(y,m,0).getDate(),cats={};
    for(let d=1;d<=days;d++){
        const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        AppState.finances.filter(f=>f.type==='out'&&isScheduledFor(f,ds)).forEach(f=>{
            const c=f.category||'Другое';cats[c]=(cats[c]||0)+Number(f.amount);
        });
    }
    const total=Object.values(cats).reduce((a,b)=>a+b,0);
    if(!total){svg.innerHTML='<text x="50" y="55" text-anchor="middle" fill="#4e535a" font-size="10">Нет данных</text>';return}
    const R=38,C=2*Math.PI*R;let off=0;
    Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([cat,amt])=>{
        const pct=amt/total,dash=pct*C;
        const ci=document.createElementNS('http://www.w3.org/2000/svg','circle');
        ci.setAttribute('cx','50');ci.setAttribute('cy','50');ci.setAttribute('r',String(R));
        ci.setAttribute('fill','none');ci.setAttribute('stroke',CAT_COL[cat]||'#64748b');
        ci.setAttribute('stroke-width','10');ci.setAttribute('stroke-dasharray',`${dash} ${C-dash}`);
        ci.setAttribute('stroke-dashoffset',String(-off));ci.setAttribute('transform','rotate(-90 50 50)');
        svg.appendChild(ci);off+=dash;
        // Legend: % AND amount
        legend.innerHTML+=`<div class="legend-item"><span class="cat-dot" style="background:${CAT_COL[cat]||'#64748b'}"></span>${cat} ${Math.round(pct*100)}% · ${Number(amt).toLocaleString()}</div>`;
    });
}

function shiftPieMonth(delta){
    const y=parseInt(pieMonth.slice(0,4)),m=parseInt(pieMonth.slice(5,7));
    const nd=new Date(y,m-1+delta,1);
    pieMonth=`${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,'0')}`;
    renderPieChart();
}

// CRUD
function toggleH(id,e){if(e)e.stopPropagation();const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].habits[id]=!AppState.records[d].habits[id];Storage.save();renderHabits();updateDashboard()}
function toggleT(id,e){if(e)e.stopPropagation();const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].tasks[id]=!AppState.records[d].tasks[id];Storage.save();renderTasks();updateDashboard()}
function deleteItem(type,id,e){if(e)e.stopPropagation();if(!confirm('Удалить?'))return;const k=type==='finance'?'finances':type+'s';AppState[k]=AppState[k].filter(x=>x.id!==id);Storage.save();refreshCurrentPage()}
function editItem(type,id,e){if(e)e.stopPropagation();const k=type==='finance'?'finances':type+'s';openModal(type,AppState[k].find(x=>x.id===id))}

// MODAL
let modalType='',modalId=null,selDays=new Set();
function openModal(type,item=null){
    modalType=type;modalId=item?.id||null;
    document.getElementById('m-name').value=item?item.name:'';
    document.getElementById('m-repeat').value=item?.repeat?.type||'none';
    const fin=type==='finance';
    document.getElementById('m-finance-fields').style.display=fin?'block':'none';
    if(fin){
        document.getElementById('m-amount').value=item?item.amount:'';
        document.getElementById('m-type').value=item?item.type:'out';
        document.getElementById('m-category').value=item?.category||'Еда';
        // Hide category for income
        toggleCatVisibility();
    }
    selDays.clear();document.querySelectorAll('.wd-btn').forEach(b=>b.classList.remove('active'));
    if(item?.repeat?.type==='weekdays')item.repeat.value.forEach(v=>{selDays.add(v);document.querySelector(`.wd-btn[data-day="${v}"]`)?.classList.add('active')});
    toggleWD();
    document.getElementById('modal-title').textContent=item?'Изменить':(fin?'Бюджет':type==='habit'?'Привычка':'Задача');
    document.getElementById('modal-overlay').classList.add('active');
    requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('modal-sheet').classList.add('active')));
    setTimeout(()=>document.getElementById('m-name').focus(),400);
}
function closeModal(){document.getElementById('modal-sheet').classList.remove('active');setTimeout(()=>document.getElementById('modal-overlay').classList.remove('active'),350)}
function toggleWD(){document.getElementById('m-weekdays').style.display=document.getElementById('m-repeat').value==='weekdays'?'flex':'none'}
function toggleCatVisibility(){
    const cat=document.getElementById('m-category');
    cat.style.display=document.getElementById('m-type').value==='in'?'none':'block';
}
function saveModal(){
    const name=document.getElementById('m-name').value;if(!name)return;
    const rT=document.getElementById('m-repeat').value,date=AppState.selectedDate;
    let rp={type:rT,value:[]};
    if(rT==='weekdays')rp.value=[...selDays];
    if(rT==='monthly')rp.value=[new Date(date+'T12:00:00').getDate()];
    const data={id:modalId||Date.now().toString(),name,repeat:rp,date};
    if(modalType==='habit')data.icon=data.icon||'bolt';
    else if(modalType==='task')data.priority='med';
    else if(modalType==='finance'){
        data.amount=document.getElementById('m-amount').value;
        data.type=document.getElementById('m-type').value;
        // Only save category for expenses
        if(data.type==='out') data.category=document.getElementById('m-category').value;
    }
    const k=modalType==='finance'?'finances':modalType+'s';
    if(modalId){const i=AppState[k].findIndex(x=>x.id===modalId);if(i>=0)Object.assign(AppState[k][i],data)}
    else AppState[k].push(data);
    Storage.save();closeModal();refreshCurrentPage();
}

// REFLECTION
function loadReflection(){
    document.getElementById('ref-date').textContent=dateLabel(AppState.selectedDate);
    const r=AppState.records[AppState.selectedDate]?.reflect||{};
    document.getElementById('ref-am-main').value=r.am_main||'';
    document.getElementById('ref-am-grateful').value=r.am_grateful||'';
    document.getElementById('ref-pm-good').value=r.pm_good||'';
    document.getElementById('ref-pm-improve').value=r.pm_improve||'';
    document.getElementById('ref-pm-learned').value=r.pm_learned||'';
    document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.remove('active');if(parseInt(b.dataset.val)===r.am_mood)b.classList.add('active')});
}
function saveReflection(){
    const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};
    const mood=document.querySelector('.mood-btn.active');
    AppState.records[d].reflect={
        am_main:document.getElementById('ref-am-main').value.slice(0,300),
        am_mood:mood?parseInt(mood.dataset.val):0,
        am_grateful:document.getElementById('ref-am-grateful').value.slice(0,300),
        pm_good:document.getElementById('ref-pm-good').value.slice(0,300),
        pm_improve:document.getElementById('ref-pm-improve').value.slice(0,300),
        pm_learned:document.getElementById('ref-pm-learned').value.slice(0,300)
    };
    Storage.save();alert('Записи сохранены!');
}
function shiftRefDate(delta){
    const d=new Date(AppState.selectedDate+'T12:00:00');d.setDate(d.getDate()+delta);
    AppState.selectedDate=formatDate(d);loadReflection();renderWeekStrip();
}

// INIT
document.addEventListener('DOMContentLoaded',async()=>{
    await Storage.init();
    document.getElementById('btn-add-habit').onclick=()=>openModal('habit');
    document.getElementById('btn-add-task').onclick=()=>openModal('task');
    document.getElementById('btn-add-finance').onclick=()=>openModal('finance');
    document.getElementById('modal-save-btn').onclick=saveModal;
    document.getElementById('btn-save-reflect').onclick=saveReflection;
    document.getElementById('ref-prev').onclick=()=>shiftRefDate(-1);
    document.getElementById('ref-next').onclick=()=>shiftRefDate(1);
    document.getElementById('fin-prev').onclick=()=>shiftPieMonth(-1);
    document.getElementById('fin-next').onclick=()=>shiftPieMonth(1);
    document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target===this)closeModal()});
    document.getElementById('modal-sheet').addEventListener('click',e=>e.stopPropagation());
    document.getElementById('modal-sheet').addEventListener('touchstart',e=>e.stopPropagation());
    document.getElementById('m-repeat').addEventListener('change',toggleWD);
    document.getElementById('m-type').addEventListener('change',toggleCatVisibility);
    document.querySelectorAll('.wd-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const day=parseInt(b.dataset.day);if(selDays.has(day)){selDays.delete(day);b.classList.remove('active')}else{selDays.add(day);b.classList.add('active')}}));
    document.querySelectorAll('.mood-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();document.querySelectorAll('.mood-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
    setInterval(()=>{document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})},1000);
    document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
});
