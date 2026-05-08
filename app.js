/* ZEN PRODUCTIVITY v5.0 — All Features */
function formatDate(d){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function getLocalDate(){return formatDate(new Date())}
function dateLabel(s){return new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',weekday:'short'})}
const MO=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const IC={meditation:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2"/><path d="M4 18h16M8 18c0-3 1-6 4-8 3 2 4 5 4 8"/></svg>',book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',workout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5v14M18 5v14M6 12h12M4 7h4M16 7h4M4 17h4M16 17h4"/></svg>',sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>',edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',archive:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>'};
const CAT_COL={'Еда':'#f43f5e','Транспорт':'#6366f1','Жильё':'#f59e0b','Развлечения':'#8b5cf6','Связь':'#06b6d4','Здоровье':'#10b981','Одежда':'#ec4899','Образование':'#3b82f6','Подписки':'#a855f7','Другое':'#64748b'};
const QUOTES=[
    ['Всё начинается с одного шага.', 'Лао-цзы'],
    ['Следите за своими мыслями — ибо обращаются они в слова...', 'Маргарет Тэтчер'],
    ['Дисциплина — мост между целями и результатом.', 'Джим Рон'],
    ['Мы — то, что мы делаем постоянно. Совершенство — это не действие, а привычка.', 'Аристотель'],
    ['Сложнее всего начать действовать. Всё остальное зависит только от упорства.', 'Амелия Эрхарт'],
    ['Маленькие ежедневные улучшения в долгосрочной перспективе приносят ошеломляющие результаты.', 'Робин Шарма'],
    ['Успех — это сумма небольших усилий, повторяемых изо дня в день.', 'Роберт Кольер'],
    ['Любить то, что вы делаете — единственный способ сделать великое дело.', 'Стив Джобс'],
    ['Не считай дни — делай так, чтобы дни считались.', 'Мухаммед Али'],
    ['Фокусируйся на процессе, а не на результате. Результат придет сам.', 'Билл Уолш'],
    ['Делай сегодня то, что другие не хотят — завтра будешь жить так, как другие не могут.', 'Джаред Лето'],
    ['Тишина — источник великой силы.', 'Лао-цзы'],
    ['Неудача — это просто возможность начать снова, но уже более мудро.', 'Генри Форд'],
    ['Если вы не планируете свое время, кто-то другой сделает это за вас.', 'Тони Роббинс'],
    ['Мотивация заставляет вас начать. Привычка заставляет вас продолжать.', 'Джим Рюн'],
    ['Вы не можете изменить свое будущее, но вы можете изменить свои привычки.', 'Абдул Калам'],
    ['Сильный человек — это не тот, кто может многое себе позволить, а тот, кто может от многого отказаться.', 'Александр Суворов'],
    ['Самый трудный шаг — это шаг за пределы привычного.', 'Неизвестный автор'],
    ['Не пытайтесь стать успешным человеком, а лучше попытайтесь стать ценным человеком.', 'Альберт Эйнштейн'],
    
    // Японские мудрости (Кайдзен, Самураи, Дзен)
    ['Упади семь раз, встань восемь (Nana korobi ya oki).', 'Японская пословица'],
    ['Даже путь в тысячу ри начинается с одного шага.', 'Японская пословица'],
    ['Кто торопится, тот ошибается.', 'Японская пословица'],
    ['Если проблему можно решить, то не стоит о ней беспокоиться. Если её решить нельзя, то беспокоиться о ней бесполезно.', 'Японская пословица'],
    ['Побеждает тот, кто умеет ждать.', 'Японская пословица'],
    ['Не бойся немного согнуться, прямее выпрямишься.', 'Японская пословица'],
    ['Холодный чай и холодный рис терпимы, но холодный взгляд и холодное слово — невыносимы.', 'Японская пословица'],
    ['Совершенствование не имеет конца (Кайдзен).', 'Японская философия'],
    ['Тот, кто улыбается, а не злится, всегда сильнее.', 'Японская пословица'],
    ['Быстро — это медленно, но без перерывов.', 'Японская пословица'],
    ['Лучше быть врагом хорошего человека, чем другом плохого.', 'Японская пословица'],
    ['Никто не спотыкается, лёжа в постели.', 'Японская пословица'],
    ['Сделай всё, что сможешь, а в остальном положись на судьбу.', 'Японская пословица'],
    ['Видение без действия — это мечта. Действие без видения — это кошмар.', 'Японская пословица'],

    // Мартин Медоуз ("365 дней самодисциплины")
    ['Самодисциплина — это способность заставить себя делать то, что вы должны делать, когда вы должны это делать, независимо от того, хочется вам этого или нет.', 'Мартин Медоуз'],
    ['Комфорт — враг величия. Рост происходит только тогда, когда вы выходите за пределы своей зоны комфорта.', 'Мартин Медоуз'],
    ['Ваши привычки определяют вашу жизнь. Измените свои привычки, и вы измените свою жизнь.', 'Мартин Медоуз'],
    ['Мотивация — это искра, а самодисциплина — это топливо, которое поддерживает огонь.', 'Мартин Медоуз'],
    ['Не ждите идеального момента. Момента лучше, чем сейчас, не будет никогда.', 'Мартин Медоуз'],
    ['Лучший способ предсказать свое будущее — создать его самому, шаг за шагом, день за днем.', 'Мартин Медоуз'],
    ['Отказ от мгновенного удовольствия ради долгосрочной цели — это суть самодисциплины.', 'Мартин Медоуз'],
    ['Успех не приходит в одночасье. Это результат бесчисленных часов тяжелой работы, преданности делу и самодисциплины.', 'Мартин Медоуз'],
    ['Не бойтесь неудач. Рассматривайте их как ценные уроки на пути к успеху.', 'Мартин Медоуз'],
    ['Ваш разум — это мощный инструмент. Научитесь контролировать свои мысли, и вы сможете контролировать свою жизнь.', 'Мартин Медоуз'],
    ['Каждое принятое вами решение либо приближает вас к вашим целям, либо отдаляет от них.', 'Мартин Медоуз'],
    ['Окружите себя людьми, которые вдохновляют вас стать лучше и поддерживают вас на пути к успеху.', 'Мартин Медоуз'],
    ['Отмечайте свои победы, какими бы маленькими они ни были. Это поможет вам сохранить мотивацию.', 'Мартин Медоуз'],
    ['Никогда не сдавайтесь. Самые большие прорывы часто происходят сразу после того, как вы хотели все бросить.', 'Мартин Медоуз']
];

const AppState={settings:{currency:'сум',theme:'dark',pomo:{focus:25,short:5,long:15,sessions:0},budgetLimits:{}},habits:[],tasks:[],finances:[],records:{},selectedDate:getLocalDate()};
let currentPage='dashboard',pieMonth=null,stripBaseDate=new Date();

// HAPTIC
function haptic(type){try{Telegram.WebApp.HapticFeedback[type.includes('.')?'notificationOccurred':'impactOccurred'](type.replace('.',''))}catch(e){}}

// STORAGE — CloudStorage split by month
const Storage={
    tg:window.Telegram?.WebApp,
    async init(){
        if(this.tg?.initData){this.tg.ready();this.tg.expand();await this.loadCloud()}
        else this.loadLocal();
        this.migrate();
        migrateTasks(); // Авто-перенос задач
        if(!AppState.habits.length){
            AppState.habits=[{id:'h1',name:'Медитация',icon:'meditation',repeat:{type:'daily',value:[]}},{id:'h2',name:'Чтение',icon:'book',repeat:{type:'daily',value:[]}},{id:'h3',name:'Тренировка',icon:'workout',repeat:{type:'daily',value:[]}},{id:'h4',name:'Саморефлексия (Утро)',icon:'sun',repeat:{type:'daily',value:[]}},{id:'h5',name:'Саморефлексия (Вечер)',icon:'moon',repeat:{type:'daily',value:[]}}];
            this.save();
        }
        pieMonth=AppState.selectedDate.slice(0,7);
        stripBaseDate=new Date(AppState.selectedDate+'T12:00:00');
        if(AppState.settings.theme==='light')document.body.classList.add('light');
        if(Notification.permission==='default')Notification.requestPermission();
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
        // Records by month
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
                // Если zc5 существует и там БОЛЬШЕ 5 привычек (значит это не ошибка дефолта)
                if(c && c.habits && c.habits.length > 5){
                    AppState.habits=c.habits;AppState.tasks=c.tasks||[];AppState.finances=c.finances||[];AppState.settings={...AppState.settings,...(c.settings||{})};
                    const now=new Date(),cm=formatDate(now).slice(0,7),pm=new Date(now.getFullYear(),now.getMonth()-1,1),pmk=formatDate(pm).slice(0,7);
                    let loaded=0;const done=()=>{loaded++;if(loaded>=2)res()};
                    [cm,pmk].forEach(m=>{this.tg.CloudStorage.getItem('zr_'+m,(e2,v2)=>{if(!e2&&v2)try{Object.assign(AppState.records,JSON.parse(v2))}catch(x){} done()})});
                } else {
                    // Cloud Migration: загружаем старые резервные копии из облака
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
    // БАГФИКС: Не показывать повторяющиеся задачи/привычки в дни ДО их создания
    if(i.date && d < i.date) return false; 
    const dt=new Date(d+'T12:00:00'),day=dt.getDay(),adj=day===0?7:day,dn=dt.getDate();
    switch(i.repeat.type){
        case'daily':return true;
        case'weekdays':case'weekly':return i.repeat.value.includes(adj);
        case'monthly':return i.repeat.value.includes(dn);
        default:return false
    }
}

// TASK MIGRATION (Carry-over)
function migrateTasks(){
    const today=getLocalDate();
    let changed=false;
    AppState.tasks.forEach(t=>{
        if((!t.repeat || t.repeat.type==='none') && !t.archived && t.date < today){
            // Если задача за прошлое и не выполнена в рекордах
            const rec=AppState.records[t.date];
            if(!rec || !rec.tasks[t.id]){
                t.date = today;
                changed = true;
            }
        }
    });
    if(changed) Storage.save();
}

// STREAKS
function getStreak(habit){let streak=0;const d=new Date();d.setDate(d.getDate()-1);// start from yesterday
    for(let i=0;i<365;i++){const ds=formatDate(d);if(!isScheduledFor(habit,ds)){d.setDate(d.getDate()-1);continue}
        if(AppState.records[ds]?.habits[habit.id]){streak++;d.setDate(d.getDate()-1)}else break}
    // check today
    const today=getLocalDate();if(isScheduledFor(habit,today)&&AppState.records[today]?.habits[habit.id])streak++;
    return streak}

// NAV
function showPage(id,e){if(e)e.preventDefault();currentPage=id;document.querySelectorAll('.page').forEach(p=>p.style.display='none');document.getElementById('page-'+id).style.display='block';document.querySelectorAll('.tab-item').forEach(t=>t.classList.remove('active'));const idx={dashboard:0,habits:1,tasks:2,finance:3,reflect:4}[id];document.querySelectorAll('.tab-item')[idx]?.classList.add('active');refreshCurrentPage()}
function refreshCurrentPage(){renderWeekStrip();({dashboard:updateDashboard,habits:renderHabits,tasks:renderTasks,finance:renderFinance,reflect:loadReflection})[currentPage]?.()}

function updateDashboard(){
    const date=AppState.selectedDate,rec=AppState.records[date]||{habits:{},tasks:{}};
    const aH=AppState.habits.filter(h=>!h.archived&&isScheduledFor(h,date)),aT=AppState.tasks.filter(t=>!t.archived&&isScheduledFor(t,date));
    const hD=aH.filter(h=>rec.habits[h.id]).length,tD=aT.filter(t=>rec.tasks[t.id]).length;
    document.getElementById('h-count').textContent=`${hD}/${aH.length}`;
    document.getElementById('t-count').textContent=`${tD}/${aT.length}`;
    const tot=aH.length+aT.length,pct=tot?Math.round((hD+tD)/tot*100):0;
    document.getElementById('score-main').textContent=`${pct}%`;
    if(pct===100&&tot>0)haptic('notification.success');
    // Quote
    const doy=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/86400000);
    const q=QUOTES[doy%QUOTES.length];
    document.getElementById('quote-text').textContent=q[0];document.getElementById('quote-author').textContent='— '+q[1];
    renderCalGrid();generateInsight();
}

// WEEK STRIP
function renderWeekStrip(){const s=document.getElementById('week-strip');s.innerHTML='';const st=new Date(stripBaseDate);st.setDate(st.getDate()-(st.getDay()===0?6:st.getDay()-1));const D=['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'],td=getLocalDate();for(let i=0;i<7;i++){const d=new Date(st);d.setDate(st.getDate()+i);const ds=formatDate(d),el=document.createElement('div');el.className=`week-day ${ds===AppState.selectedDate?'selected':''} ${ds===td?'today':''}`;el.innerHTML=`<span class="day-name">${D[i]}</span><span class="day-num">${d.getDate()}</span>`;el.onclick=()=>{AppState.selectedDate=ds;refreshCurrentPage()};s.appendChild(el)}}
function shiftWeek(d){stripBaseDate.setDate(stripBaseDate.getDate()+d*7);renderWeekStrip()}

// CALENDAR GRID
function renderCalGrid(){const g=document.getElementById('cal-grid');g.innerHTML='';const sel=AppState.selectedDate,y=parseInt(sel.slice(0,4)),m=parseInt(sel.slice(5,7));
    ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].forEach(d=>{const h=document.createElement('div');h.className='cal-hdr';h.textContent=d;g.appendChild(h)});
    const first=new Date(y,m-1,1),days=new Date(y,m,0).getDate();let startDay=first.getDay();startDay=startDay===0?7:startDay;
    for(let i=1;i<startDay;i++){const e=document.createElement('div');e.className='cal-cell empty';g.appendChild(e)}
    const td=getLocalDate();
    for(let d=1;d<=days;d++){const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const el=document.createElement('div');
        const rec=AppState.records[ds]||{habits:{},tasks:{}};const aH=AppState.habits.filter(h=>!h.archived&&isScheduledFor(h,ds));const aT=AppState.tasks.filter(t=>!t.archived&&isScheduledFor(t,ds));const tot=aH.length+aT.length;const done=aH.filter(h=>rec.habits[h.id]).length+aT.filter(t=>rec.tasks[t.id]).length;
        let cls='cal-cell';if(ds===td)cls+=' today';if(ds===sel)cls+=' sel';if(tot>0&&done===tot)cls+=' done-full';else if(done>0)cls+=' done-part';
        el.className=cls;el.textContent=d;el.onclick=()=>{AppState.selectedDate=ds;refreshCurrentPage()};g.appendChild(el)}}

// AI INSIGHTS
function generateInsight(){const box=document.getElementById('ai-box'),txt=document.getElementById('ai-text');
    const insights=[];const d=new Date();
    // Check last 7 days
    let missedH={},totalDays=0;
    for(let i=1;i<=7;i++){const dt=new Date(d);dt.setDate(d.getDate()-i);const ds=formatDate(dt);const rec=AppState.records[ds]||{habits:{}};
        AppState.habits.filter(h=>!h.archived&&isScheduledFor(h,ds)).forEach(h=>{if(!rec.habits[h.id]){missedH[h.name]=(missedH[h.name]||0)+1}});totalDays++}
    const worst=Object.entries(missedH).sort((a,b)=>b[1]-a[1])[0];
    if(worst&&worst[1]>=3)insights.push(`«${worst[0]}» пропущена ${worst[1]} раз за неделю. Попробуй изменить время.`);
    // Budget insight
    const pm=pieMonth||AppState.selectedDate.slice(0,7);const cats=getMonthCats(pm);const total=Object.values(cats).reduce((a,b)=>a+b,0);
    if(total>0){const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];if(top)insights.push(`Главный расход: ${top[0]} (${Math.round(top[1]/total*100)}%). Всего ${total.toLocaleString()} сум.`)}
    // Mood correlation
    let moodWithMed=0,moodWithout=0,cM=0,cW=0;
    for(let i=1;i<=14;i++){const dt=new Date(d);dt.setDate(d.getDate()-i);const ds=formatDate(dt);const r=AppState.records[ds];if(!r?.reflect?.am_mood)continue;
        if(r.habits?.h1){moodWithMed+=r.reflect.am_mood;cM++}else{moodWithout+=r.reflect.am_mood;cW++}}
    if(cM>=3&&cW>=3){const avg1=(moodWithMed/cM).toFixed(1),avg2=(moodWithout/cW).toFixed(1);if(avg1>avg2)insights.push(`Настроение выше в дни с медитацией (${avg1} vs ${avg2}).`)}
    if(insights.length){box.style.display='flex';txt.textContent=insights[0]}else box.style.display='none'}

function actBtns(type,id,archived){
    return `<div style="display:flex;gap:2px"><button class="act-btn" onclick="editItem('${type}','${id}',event)">${IC.edit}</button>${archived?`<button class="act-btn" onclick="unarchive('${type}','${id}',event)">${IC.bolt}</button>`:`<button class="act-btn" onclick="archiveItem('${type}','${id}',event)">${IC.archive}</button>`}<button class="act-btn" onclick="deleteItem('${type}','${id}',event)">${IC.trash}</button></div>`}

function renderHabits(){const L=document.getElementById('habits-list');L.innerHTML='';const date=AppState.selectedDate,rec=AppState.records[date]||{habits:{}};
    AppState.habits.filter(h=>!h.archived&&isScheduledFor(h,date)).forEach(h=>{const done=!!rec.habits[h.id],streak=getStreak(h),el=document.createElement('div');el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML=`<div class="zen-icon">${IC[h.icon]||IC.bolt}</div><div style="flex:1"><div style="font-weight:700;font-size:15px">${h.name}</div>${streak>0?`<span class="streak-badge">🔥 ${streak} дн.</span>`:''}</div>${actBtns('habit',h.id)}<div class="zen-check" onclick="toggleH('${h.id}',event)">${done?IC.check:''}</div>`;L.appendChild(el)});
    // Archive
    const arch=AppState.habits.filter(h=>h.archived);const aDiv=document.getElementById('habits-archive'),aL=document.getElementById('habits-arch-list');
    if(arch.length){aDiv.style.display='block';aL.innerHTML='';arch.forEach(h=>{const el=document.createElement('div');el.className='zen-card archived';el.innerHTML=`<div class="zen-icon">${IC[h.icon]||IC.bolt}</div><div style="flex:1"><div style="font-weight:700;font-size:14px">${h.name}</div></div>${actBtns('habit',h.id,true)}`;aL.appendChild(el)})}else aDiv.style.display='none'}

function renderTasks(){const L=document.getElementById('tasks-list');L.innerHTML='';const date=AppState.selectedDate,rec=AppState.records[date]||{tasks:{}};
    const sorted=AppState.tasks.filter(t=>!t.archived&&isScheduledFor(t,date)).sort((a,b)=>{const o={high:0,med:1,low:2};return(o[a.priority]||1)-(o[b.priority]||1)});
    sorted.forEach(t=>{const done=!!rec.tasks[t.id],el=document.createElement('div');el.className=`zen-card ${done?'completed':''}`;
        el.innerHTML=`<div class="priority-bar p-${t.priority||'med'}"></div><div style="flex:1"><div style="font-weight:700;font-size:15px">${t.name}</div></div>${actBtns('task',t.id)}<div class="zen-check" onclick="toggleT('${t.id}',event)">${done?IC.check:''}</div>`;L.appendChild(el)});
    const arch=AppState.tasks.filter(t=>t.archived);const aDiv=document.getElementById('tasks-archive'),aL=document.getElementById('tasks-arch-list');
    if(arch.length){aDiv.style.display='block';aL.innerHTML='';arch.forEach(t=>{const el=document.createElement('div');el.className='zen-card archived';el.innerHTML=`<div class="priority-bar p-${t.priority||'med'}"></div><div style="flex:1"><div style="font-weight:700;font-size:14px">${t.name}</div></div>${actBtns('task',t.id,true)}`;aL.appendChild(el)})}else aDiv.style.display='none'}

function renderFinance(){const L=document.getElementById('finance-list');L.innerHTML='';const date=AppState.selectedDate;let inc=0,exp=0;
    AppState.finances.filter(f=>isScheduledFor(f,date)).forEach(f=>{if(f.type==='in')inc+=Number(f.amount);else exp+=Number(f.amount);const el=document.createElement('div');el.className='zen-card';const isIn=f.type==='in';
        el.innerHTML=`<div class="zen-icon" style="color:${isIn?'var(--sec)':'var(--pink)'}">${isIn?IC.up:IC.down}</div><div style="flex:1"><div style="font-weight:700;font-size:15px">${f.name}</div>${!isIn&&f.category?`<div style="font-size:11px;color:${CAT_COL[f.category]||'#64748b'};margin-top:2px">${f.category}</div>`:''}</div><div style="font-weight:800;font-size:14px;margin-right:6px;color:${isIn?'var(--sec)':'var(--pink)'}">${isIn?'+':'-'}${Number(f.amount).toLocaleString()}</div>${actBtns('finance',f.id)}`;L.appendChild(el)});
    document.getElementById('bal-in').textContent='+'+inc.toLocaleString();document.getElementById('bal-out').textContent='-'+exp.toLocaleString();document.getElementById('balance-total').textContent=(inc-exp).toLocaleString();
    
    // Monthly Summary
    let mInc=0, mExp=0;
    const pm=pieMonth||AppState.selectedDate.slice(0,7);
    const y=parseInt(pm.slice(0,4)),m=parseInt(pm.slice(5,7)),days=new Date(y,m,0).getDate();
    for(let d=1;d<=days;d++){
        const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        AppState.finances.filter(f=>isScheduledFor(f,ds)).forEach(f=>{if(f.type==='in')mInc+=Number(f.amount);else mExp+=Number(f.amount)});
    }
    document.getElementById('fin-month-title').textContent=`ИТОГИ МЕСЯЦА: ${MO[m-1].toUpperCase()}`;
    document.getElementById('month-bal-in').textContent=mInc.toLocaleString();document.getElementById('month-bal-out').textContent=mExp.toLocaleString();document.getElementById('month-balance-total').textContent=(mInc-mExp).toLocaleString();

    renderPieChart();renderBudgetLimits()}


function getMonthCats(pm){const y=parseInt(pm.slice(0,4)),m=parseInt(pm.slice(5,7)),days=new Date(y,m,0).getDate(),cats={};for(let d=1;d<=days;d++){const ds=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;AppState.finances.filter(f=>f.type==='out'&&isScheduledFor(f,ds)).forEach(f=>{const c=f.category||'Другое';cats[c]=(cats[c]||0)+Number(f.amount)})}return cats}

function renderPieChart(){if(!pieMonth)pieMonth=AppState.selectedDate.slice(0,7);const svg=document.getElementById('pie-chart'),leg=document.getElementById('pie-legend');svg.innerHTML='';leg.innerHTML='';
    const y=parseInt(pieMonth.slice(0,4)),m=parseInt(pieMonth.slice(5,7));document.getElementById('fin-month').textContent=`${MO[m-1]} ${y}`;
    const cats=getMonthCats(pieMonth),total=Object.values(cats).reduce((a,b)=>a+b,0);
    if(!total){svg.innerHTML='<text x="50" y="55" text-anchor="middle" fill="#4e535a" font-size="10">Нет данных</text>';return}
    const R=38,C=2*Math.PI*R;let off=0;
    Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([cat,amt])=>{const pct=amt/total,dash=pct*C;const ci=document.createElementNS('http://www.w3.org/2000/svg','circle');ci.setAttribute('cx','50');ci.setAttribute('cy','50');ci.setAttribute('r',String(R));ci.setAttribute('fill','none');ci.setAttribute('stroke',CAT_COL[cat]||'#64748b');ci.setAttribute('stroke-width','10');ci.setAttribute('stroke-dasharray',`${dash} ${C-dash}`);ci.setAttribute('stroke-dashoffset',String(-off));ci.setAttribute('transform','rotate(-90 50 50)');svg.appendChild(ci);off+=dash;
        leg.innerHTML+=`<div class="legend-item"><span class="cat-dot" style="background:${CAT_COL[cat]||'#64748b'}"></span>${cat} ${Math.round(pct*100)}% · ${Number(amt).toLocaleString()}</div>`})}

function renderBudgetLimits(){const c=document.getElementById('budget-limits');c.innerHTML='';const lim=AppState.settings.budgetLimits||{};const cats=getMonthCats(pieMonth||AppState.selectedDate.slice(0,7));
    Object.entries(lim).forEach(([cat,max])=>{if(!max)return;const spent=cats[cat]||0;const pct=Math.min(spent/max*100,100);const warn=pct>=80;
        c.innerHTML+=`<div class="limit-item"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600"><span>${cat}</span><span class="${warn?'limit-warn':''}">${spent.toLocaleString()} / ${Number(max).toLocaleString()}</span></div><div class="limit-bar"><div class="limit-fill" style="width:${pct}%;background:${warn?'var(--pink)':CAT_COL[cat]||'var(--pri)'}"></div></div></div>`})}

function shiftPieMonth(d){const y=parseInt(pieMonth.slice(0,4)),m=parseInt(pieMonth.slice(5,7));const n=new Date(y,m-1+d,1);pieMonth=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;renderFinance()}

// CRUD
function toggleH(id,e){if(e)e.stopPropagation();haptic('light');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].habits[id]=!AppState.records[d].habits[id];Storage.save();renderHabits();updateDashboard()}
function toggleT(id,e){if(e)e.stopPropagation();haptic('light');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};AppState.records[d].tasks[id]=!AppState.records[d].tasks[id];Storage.save();renderTasks();updateDashboard()}
function deleteItem(t,id,e){if(e)e.stopPropagation();if(!confirm('Удалить?'))return;haptic('medium');const k=t==='finance'?'finances':t+'s';AppState[k]=AppState[k].filter(x=>x.id!==id);Storage.save();refreshCurrentPage()}
function editItem(t,id,e){if(e)e.stopPropagation();const k=t==='finance'?'finances':t+'s';openModal(t,AppState[k].find(x=>x.id===id))}
function archiveItem(t,id,e){if(e)e.stopPropagation();haptic('medium');const k=t==='finance'?'finances':t+'s';const it=AppState[k].find(x=>x.id===id);if(it)it.archived=true;Storage.save();refreshCurrentPage()}
function unarchive(t,id,e){if(e)e.stopPropagation();const k=t==='finance'?'finances':t+'s';const it=AppState[k].find(x=>x.id===id);if(it)it.archived=false;Storage.save();refreshCurrentPage()}

// MODAL
let modalType='',modalId=null,selDays=new Set();
function openModal(type,item=null){modalType=type;modalId=item?.id||null;document.getElementById('m-name').value=item?item.name:'';document.getElementById('m-repeat').value=item?.repeat?.type||'none';
    document.getElementById('m-finance-fields').style.display=type==='finance'?'block':'none';
    document.getElementById('m-priority-field').style.display=type==='task'?'block':'none';
    if(type==='task')document.getElementById('m-priority').value=item?.priority||'med';
    if(type==='finance'){document.getElementById('m-amount').value=item?item.amount:'';document.getElementById('m-type').value=item?item.type:'out';document.getElementById('m-category').value=item?.category||'Еда';toggleCatVis()}
    selDays.clear();document.querySelectorAll('.wd-btn').forEach(b=>b.classList.remove('active'));
    if(item?.repeat?.type==='weekdays')item.repeat.value.forEach(v=>{selDays.add(v);document.querySelector(`.wd-btn[data-day="${v}"]`)?.classList.add('active')});
    toggleWD();document.getElementById('modal-title').textContent=item?'Изменить':(type==='finance'?'Бюджет':type==='habit'?'Привычка':'Задача');
    document.getElementById('modal-overlay').classList.add('active');requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('modal-sheet').classList.add('active')));
    setTimeout(()=>document.getElementById('m-name').focus(),400)}
function closeModal(){document.getElementById('modal-sheet').classList.remove('active');setTimeout(()=>document.getElementById('modal-overlay').classList.remove('active'),350)}
function toggleWD(){document.getElementById('m-weekdays').style.display=document.getElementById('m-repeat').value==='weekdays'?'flex':'none'}
function toggleCatVis(){document.getElementById('m-category').style.display=document.getElementById('m-type').value==='in'?'none':'block'}
function saveModal(){const name=document.getElementById('m-name').value;if(!name)return;haptic('light');
    const rT=document.getElementById('m-repeat').value,date=AppState.selectedDate;let rp={type:rT,value:[]};
    if(rT==='weekdays')rp.value=[...selDays];if(rT==='monthly')rp.value=[new Date(date+'T12:00:00').getDate()];
    const data={id:modalId||Date.now().toString(),name,repeat:rp,date};
    if(modalType==='habit')data.icon=data.icon||'bolt';
    else if(modalType==='task'){data.priority=document.getElementById('m-priority').value}
    else if(modalType==='finance'){data.amount=document.getElementById('m-amount').value;data.type=document.getElementById('m-type').value;if(data.type==='out')data.category=document.getElementById('m-category').value}
    const k=modalType==='finance'?'finances':modalType+'s';
    if(modalId){const i=AppState[k].findIndex(x=>x.id===modalId);if(i>=0)Object.assign(AppState[k][i],data)}else AppState[k].push(data);
    Storage.save();closeModal();refreshCurrentPage()}

// REFLECTION
function loadReflection(){document.getElementById('ref-date').textContent=dateLabel(AppState.selectedDate);const r=AppState.records[AppState.selectedDate]?.reflect||{};
    document.getElementById('ref-am-main').value=r.am_main||'';document.getElementById('ref-am-grateful').value=r.am_grateful||'';
    document.getElementById('ref-pm-good').value=r.pm_good||'';document.getElementById('ref-pm-improve').value=r.pm_improve||'';document.getElementById('ref-pm-learned').value=r.pm_learned||'';
    document.querySelectorAll('.mood-btn').forEach(b=>{b.classList.remove('active');if(parseInt(b.dataset.val)===r.am_mood)b.classList.add('active')});renderMoodGraph()}
function saveReflection(){haptic('notification.success');const d=AppState.selectedDate;if(!AppState.records[d])AppState.records[d]={habits:{},tasks:{}};
    AppState.records[d].reflect={am_main:document.getElementById('ref-am-main').value.slice(0,300),am_mood:parseInt(document.querySelector('.mood-btn.active')?.dataset.val)||0,am_grateful:document.getElementById('ref-am-grateful').value.slice(0,300),pm_good:document.getElementById('ref-pm-good').value.slice(0,300),pm_improve:document.getElementById('ref-pm-improve').value.slice(0,300),pm_learned:document.getElementById('ref-pm-learned').value.slice(0,300)};
    Storage.save();alert('Сохранено!')}
function shiftRefDate(delta){const d=new Date(AppState.selectedDate+'T12:00:00');d.setDate(d.getDate()+delta);AppState.selectedDate=formatDate(d);loadReflection();renderWeekStrip()}

// MOOD GRAPH
function renderMoodGraph(){const svg=document.getElementById('mood-graph');svg.innerHTML='';const pts=[];const d=new Date();
    for(let i=13;i>=0;i--){const dt=new Date(d);dt.setDate(d.getDate()-i);const ds=formatDate(dt);const mood=AppState.records[ds]?.reflect?.am_mood;pts.push({x:((13-i)/13)*280+10,y:mood?80-mood*14:null,mood,label:dt.getDate()})}
    // Grid
    for(let i=1;i<=5;i++){const y=80-i*14;svg.innerHTML+=`<line x1="10" y1="${y}" x2="290" y2="${y}" stroke="var(--border)" stroke-width="0.5"/>`}
    // Lines & dots
    let path='';pts.forEach((p,i)=>{if(p.y===null)return;const cmd=path?'L':'M';path+=`${cmd}${p.x},${p.y} `;
        const col=['','#f43f5e','#f59e0b','#eab308','#22c55e','#10b981'][p.mood];
        svg.innerHTML+=`<circle cx="${p.x}" cy="${p.y}" r="4" fill="${col}"/>`});
    if(path)svg.innerHTML+=`<path d="${path}" fill="none" stroke="var(--pri)" stroke-width="1.5" opacity="0.5"/>`;
    pts.forEach(p=>{svg.innerHTML+=`<text x="${p.x}" y="78" text-anchor="middle" fill="var(--muted)" font-size="7">${p.label}</text>`})}

// POMODORO
let pomoInterval=null,pomoSec=25*60,pomoRunning=false,pomoMode='focus',pomoSess=1;
function openPomodoro(){document.getElementById('pomo-overlay').classList.add('active');requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('pomo-sheet').classList.add('active')));updateStatusPomo()}
function closePomodoro(){document.getElementById('pomo-sheet').classList.remove('active');setTimeout(()=>document.getElementById('pomo-overlay').classList.remove('active'),350)}
function setPomoMode(m){pomoMode=m;const times={focus:AppState.settings.pomo.focus*60,short:AppState.settings.pomo.short*60,long:AppState.settings.pomo.long*60};pomoSec=times[m];updateStatusPomo()}
function updateStatusPomo(){
    document.querySelectorAll('.pomo-mode-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById('mode-'+pomoMode).classList.add('active');
    document.getElementById('pomo-sessions').textContent=`Сессия ${pomoSess} / 4`;
    updatePomoDisplay();
}
function updatePomoDisplay(){const m=Math.floor(pomoSec/60),s=pomoSec%60;document.getElementById('pomo-time').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    const total=(pomoMode==='focus'?AppState.settings.pomo.focus:pomoMode==='short'?AppState.settings.pomo.short:AppState.settings.pomo.long)*60;
    const pct=(1-pomoSec/total)*327;document.getElementById('pomo-progress').setAttribute('stroke-dashoffset',String(327-pct))}
function startPomo(){if(pomoRunning){clearInterval(pomoInterval);pomoRunning=false;document.getElementById('pomo-start').textContent='Старт';return}
    pomoRunning=true;document.getElementById('pomo-start').textContent='Пауза';
    pomoInterval=setInterval(()=>{pomoSec--;if(pomoSec<=0){
        clearInterval(pomoInterval);pomoRunning=false;document.getElementById('pomo-start').textContent='Старт';
        haptic('notification.success');sendPomoNotify();
        if(pomoMode==='focus'){
            if(pomoSess<4){pomoSess++;setPomoMode('short')}else{pomoSess=1;setPomoMode('long')}
        }else{setPomoMode('focus')}
    }updatePomoDisplay()},1000)}
function resetPomo(){clearInterval(pomoInterval);pomoRunning=false;pomoMode='focus';pomoSess=1;pomoSec=AppState.settings.pomo.focus*60;document.getElementById('pomo-start').textContent='Старт';updateStatusPomo()}
function sendPomoNotify(){
    const msg=pomoMode==='focus'?'Время отдохнуть!':'Пора за работу!';
    if(Notification.permission==='granted')new Notification('Zen Помодоро',{body:msg,icon:'favicon.ico'});
    try{const audio=new AudioContext();const o=audio.createOscillator();const g=audio.createGain();o.connect(g);g.connect(audio.destination);o.type='sine';o.frequency.setValueAtTime(880,audio.currentTime);g.gain.setValueAtTime(0.1,audio.currentTime);o.start();g.gain.exponentialRampToValueAtTime(0.00001,audio.currentTime+1);o.stop(audio.currentTime+1)}catch(e){}
}

// SETTINGS
function openSettings(){document.getElementById('settings-overlay').classList.add('active');requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('settings-sheet').classList.add('active')))}
function closeSettings(){document.getElementById('settings-sheet').classList.remove('active');setTimeout(()=>document.getElementById('settings-overlay').classList.remove('active'),350)}
function toggleTheme(){const isLight=document.body.classList.toggle('light');AppState.settings.theme=isLight?'light':'dark';document.getElementById('btn-theme').textContent=isLight?'Тёмная':'Светлая';Storage.save()}
function openLimitsEditor(){const cats=Object.keys(CAT_COL);let msg='Установите лимит для каждой категории (0 = без лимита):\n\n';
    cats.forEach(c=>{const cur=AppState.settings.budgetLimits[c]||0;const val=prompt(`${c} (текущий: ${cur.toLocaleString()}):`,cur);if(val!==null)AppState.settings.budgetLimits[c]=parseInt(val)||0});
    Storage.save();renderFinance()}
function exportData(){const txt=JSON.stringify(AppState,null,2);navigator.clipboard?.writeText(txt).then(()=>alert('Данные скопированы в буфер!')).catch(()=>{const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);alert('Скопировано!')})}

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
    document.getElementById('pomo-start').onclick=startPomo;
    document.getElementById('pomo-reset').onclick=resetPomo;
    document.getElementById('modal-overlay').addEventListener('click',function(e){if(e.target===this)closeModal()});
    document.getElementById('pomo-overlay').addEventListener('click',function(e){if(e.target===this)closePomodoro()});
    document.getElementById('settings-overlay').addEventListener('click',function(e){if(e.target===this)closeSettings()});
    [document.getElementById('modal-sheet'),document.getElementById('pomo-sheet'),document.getElementById('settings-sheet')].forEach(s=>{s.addEventListener('click',e=>e.stopPropagation());s.addEventListener('touchstart',e=>e.stopPropagation())});
    document.getElementById('m-repeat').addEventListener('change',toggleWD);
    document.getElementById('m-type').addEventListener('change',toggleCatVis);
    document.querySelectorAll('.wd-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();const day=parseInt(b.dataset.day);if(selDays.has(day)){selDays.delete(day);b.classList.remove('active')}else{selDays.add(day);b.classList.add('active')}}));
    document.querySelectorAll('.mood-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();document.querySelectorAll('.mood-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
    setInterval(()=>{document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})},1000);
    document.getElementById('header-time').textContent=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    document.getElementById('btn-theme').textContent=AppState.settings.theme==='light'?'Тёмная':'Светлая';
});
