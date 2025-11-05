// Enhanced v1.2 - Optimized
(function() {'use strict';

// State (short names)
let stats={gTotal:0,gMoves:0,gTime:0,wins:0,optWin:0,modes:{play:0,teach:0,learn:0,challenge:0,sandbox:0},bestEf:0};
let daily={date:null,cfg:null,done:false,str:0,dates:[]};
let replay=null,vfx=true;

const achPrg={rookie:{cur:0,max:1,lbl:'3'},architect:{cur:0,max:1,lbl:'8'},optimal_master:{cur:0,max:1,lbl:'Opt'},perfectionist:{cur:0,max:1,lbl:'6+'},invincible:{cur:0,max:1,lbl:'10+'},absolute_perfection:{cur:0,max:1,lbl:'12'},speedrun_legend:{cur:0,max:1,lbl:'8+2m'},undoer:{cur:0,max:15,lbl:'undo'},creative_soul:{cur:0,max:10,lbl:'cfg'}};

// Achievement Progress
function updAch(id,cur,max){if(achPrg[id]){achPrg[id].cur=Math.min(cur,max);achPrg[id].max=max;savePrg();}}
function getAch(id){return achPrg[id]||{cur:0,max:1,lbl:''};}
function savePrg(){try{localStorage.setItem('hanoi_ach_prg',JSON.stringify(achPrg));}catch(e){}}
function loadPrg(){try{const s=JSON.parse(localStorage.getItem('hanoi_ach_prg'));if(s)Object.assign(achPrg,s);}catch(e){}}

window.enhanceAchievementDisplay=function(el,id,unlock){
    if(unlock)return;
    const p=getAch(id);
    if(p.max>1||p.cur>0){
        const d=el.querySelector('.details');
        if(d){
            const pct=Math.floor((p.cur/p.max)*100);
            d.insertAdjacentHTML('beforeend',`<div class="achievement-progress"><div class="achievement-progress-bar" style="width:${pct}%"></div></div><div class="achievement-progress-text">${p.cur}/${p.max} ${p.lbl}</div>`);
        }
    }
};

// Visual Effects
function addGlow(el){if(vfx)el.classList.add('disk-glow');}
function rmGlow(el){el.classList.remove('disk-glow');}
function trail(el){
    if(!vfx)return;
    const t=el.cloneNode(true);
    t.classList.add('disk-trail');
    t.style.position='absolute';
    t.style.left=el.offsetLeft+'px';
    t.style.top=el.offsetTop+'px';
    t.style.width=el.offsetWidth+'px';
    el.parentElement.appendChild(t);
    setTimeout(()=>{if(t.parentElement)t.parentElement.removeChild(t);},500);
}

window.enhanceDiskDrag=function(el){addGlow(el);trail(el);};
window.enhanceDiskDrop=function(el){rmGlow(el);};
window.enhancePoleHover=function(el,hover){hover?el.classList.add('pole-highlight-glow'):el.classList.remove('pole-highlight-glow');};

// Stats
function loadS(){try{const s=localStorage.getItem('hanoi_game_stats');if(s)Object.assign(stats,JSON.parse(s));}catch(e){}}
function saveS(){try{localStorage.setItem('hanoi_game_stats',JSON.stringify(stats));}catch(e){}}
function track(mode,moves,time,opt,isOpt){
    stats.gTotal++;stats.gMoves+=moves;stats.gTime+=time;stats.wins++;
    if(isOpt)stats.optWin++;
    if(stats.modes[mode]!==undefined)stats.modes[mode]++;
    if(opt>0){const ef=(opt/moves)*100;if(ef>stats.bestEf)stats.bestEf=ef;}
    saveS();
}

function render(){
    const c=document.getElementById('statsContent');
    if(!c)return;
    const avg=stats.gTotal>0?Math.round(stats.gMoves/stats.gTotal):0;
    const avgT=stats.gTotal>0?Math.round(stats.gTime/stats.gTotal):0;
    const wr=stats.gTotal>0?Math.round((stats.wins/stats.gTotal)*100):0;
    const total=Object.values(stats.modes).reduce((a,b)=>a+b,0);
    const mn={play:'🎮Play',teach:'🎓Teach',learn:'🧠Learn',challenge:'⏱️Challenge',sandbox:'🚀Sandbox'};
    
    c.innerHTML=`<div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Trận</div><div class="stat-value">${stats.gTotal}</div></div>
        <div class="stat-card"><div class="stat-label">Thắng</div><div class="stat-value">${stats.wins}</div></div>
        <div class="stat-card"><div class="stat-label">TB Moves</div><div class="stat-value">${avg}</div></div>
        <div class="stat-card"><div class="stat-label">Win%</div><div class="stat-value">${wr}%</div></div>
        <div class="stat-card"><div class="stat-label">Optimal</div><div class="stat-value">${stats.optWin}</div></div>
        <div class="stat-card"><div class="stat-label">Best Eff</div><div class="stat-value">${stats.bestEf.toFixed(1)}%</div></div>
    </div>
    <div class="stat-chart"><h4>📊 Modes</h4>${Object.entries(stats.modes).map(([m,cnt])=>{
        const pct=total>0?Math.round((cnt/total)*100):0;
        return `<div class="stat-bar-container"><div class="stat-bar-label"><span>${mn[m]||m}</span><span>${cnt} (${pct}%)</span></div><div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%"></div></div></div>`;
    }).join('')}</div>
    <div class="stat-chart"><h4>⏱️ Time</h4><div class="stat-bar-container"><div class="stat-bar-label"><span>Total</span><span>${fmtHr(stats.gTime)}</span></div></div><div class="stat-bar-container"><div class="stat-bar-label"><span>Avg</span><span>${fmtTm(avgT)}</span></div></div></div>`;
}

function fmtHr(s){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h>0?`${h}h ${m}m`:`${m}m`;}
function fmtTm(s){const m=Math.floor(s/60),ss=s%60;return `${m.toString().padStart(2,'0')}:${ss.toString().padStart(2,'0')}`;}

// Daily Challenge
function getDay(){const d=new Date();return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;}
function genCfg(ds){
    const seed=ds.split('-').reduce((a,b)=>parseInt(a)+parseInt(b),0);
    const rnd=(seed*9301+49297)%233280;
    const rng=rnd/233280;
    const rules=['classic','adjacent','cyclic'];
    return {disks:4+Math.floor(rng*5),poles:3+Math.floor((rng*1000)%4),rule:rules[Math.floor((rng*10000)%3)],seed:ds};
}

function loadD(){
    try{const s=localStorage.getItem('hanoi_daily');if(s)daily=JSON.parse(s);}catch(e){}
    const td=getDay();
    if(daily.date!==td){daily.date=td;daily.cfg=genCfg(td);daily.done=false;saveD();}
}
function saveD(){try{localStorage.setItem('hanoi_daily',JSON.stringify(daily));}catch(e){}}
function compD(){
    if(!daily.done){
        daily.done=true;
        const td=getDay();
        if(!daily.dates.includes(td)){
            daily.dates.push(td);
            const yd=new Date();yd.setDate(yd.getDate()-1);
            const yds=getDay.call({},yd);
            daily.str=(daily.dates.includes(yds)||daily.dates.length===1)?daily.str+1:1;
            if(daily.dates.length>30)daily.dates=daily.dates.slice(-30);
        }
        saveD();
        alert(`🎉 Daily done!\n🔥 Streak: ${daily.str}\nBack tomorrow!`);
    }
}

function renderD(){
    const c=document.getElementById('dailyChallengeContent');
    if(!c||!daily.cfg)return;
    const cfg=daily.cfg;
    const rn={classic:'Classic',adjacent:'Adjacent',cyclic:'Cyclic'};
    const days=[];
    for(let i=6;i>=0;i--){
        const d=new Date();d.setDate(d.getDate()-i);
        const ds=getDay.call({},d);
        days.push({ds,done:daily.dates.includes(ds),today:i===0,num:d.getDate()});
    }
    c.innerHTML=`<p style="font-size:14px;color:var(--muted);margin:0 0 8px 0;">Daily ready! Complete for streak 🔥</p>
    <div class="daily-config"><div style="font-size:18px;font-weight:900;color:#ff6b35;margin-bottom:8px;">📋 Today</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left;">
    <div><strong>Disks:</strong> ${cfg.disks}</div><div><strong>Poles:</strong> ${cfg.poles}</div>
    <div><strong>Rule:</strong> ${rn[cfg.rule]}</div><div><strong>Status:</strong> ${daily.done?'✅Done':'⏳Wait'}</div></div></div>
    <div style="margin:16px 0;"><div style="font-size:14px;font-weight:800;color:var(--accent);margin-bottom:8px;">🔥 Streak: ${daily.str}</div>
    <div class="daily-streak">${days.map(d=>`<div class="streak-day ${d.done?'completed':''} ${d.today?'today':''}">${d.num}</div>`).join('')}</div></div>
    <div class="popup-actions"><button id="dailyStartBtn" class="btn" style="background:linear-gradient(135deg,#ff6b35,#f7931e);" ${daily.done?'disabled':''}>
    ${daily.done?'✅ Done':'🚀 Start'}</button><button id="dailyCloseBtn" class="ghost">Close</button></div>`;
    
    const sb=document.getElementById('dailyStartBtn'),cb=document.getElementById('dailyCloseBtn');
    if(sb&&!daily.done)sb.addEventListener('click',startD);
    if(cb)cb.addEventListener('click',()=>document.getElementById('dailyChallengePanel').style.display='none');
}

function startD(){
    const c=daily.cfg;
    if(window.startSandboxWithConfig)window.startSandboxWithConfig(c.poles,c.disks,c.rule,'classic','any_other',true);
    document.getElementById('dailyChallengePanel').style.display='none';
}

function updCD(){
    const el=document.getElementById('dailyCountdown');
    if(!el)return;
    const now=new Date(),tm=new Date(now);
    tm.setDate(tm.getDate()+1);tm.setHours(0,0,0,0);
    const diff=tm-now;
    const h=Math.floor(diff/(1000*60*60)),m=Math.floor((diff%(1000*60*60))/(1000*60)),s=Math.floor((diff%(1000*60))/1000);
    el.textContent=`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Share
function encRep(g){try{const r={n:g.disks,m:g.moves,t:g.time,mode:g.mode,seq:g.sequence||[]};return btoa(encodeURIComponent(JSON.stringify(r)));}catch(e){return '';}}
function decRep(e){try{return JSON.parse(decodeURIComponent(atob(e)));}catch(e){return null;}}
function genURL(g){return `${window.location.origin}${window.location.pathname}?replay=${encRep(g)}`;}

function showShr(g){
    const p=document.getElementById('sharePopup'),u=document.getElementById('shareUrlBox');
    if(!p||!u)return;
    const url=genURL(g);replay=g;u.textContent=url;p.classList.add('show');
    u.onclick=()=>copy(url);
}

function copy(txt){
    if(navigator.clipboard){
        navigator.clipboard.writeText(txt).then(()=>alert('✅ Copied!')).catch(()=>fbCopy(txt));
    }else fbCopy(txt);
}

function fbCopy(txt){
    const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    try{document.execCommand('copy');alert('✅ Copied!');}catch(e){alert('❌ Copy failed');}
    document.body.removeChild(ta);
}

function shrTW(){if(!replay)return;const txt=`🎮 Tower of Hanoi!\n${replay.disks} disks - ${replay.moves} moves - ${fmtTm(replay.time)}\nBeat me?`;window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(genURL(replay))}`,'_blank');}
function shrFB(){if(!replay)return;window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(genURL(replay))}`,'_blank');}

// Draggable Panels
function drag(panel,handle,ignore){
    let x=0,y=0,mx=0,my=0;
    handle.onmousedown=start;
    
    function start(e){
        if(ignore.some(s=>e.target.matches(s)))return;
        e.preventDefault();
        mx=e.clientX;my=e.clientY;
        document.onmouseup=stop;
        document.onmousemove=move;
        panel.style.cursor='move';
    }
    function move(e){
        e.preventDefault();
        x=mx-e.clientX;y=my-e.clientY;mx=e.clientX;my=e.clientY;
        panel.style.top=(panel.offsetTop-y)+'px';
        panel.style.left=(panel.offsetLeft-x)+'px';
    }
    function stop(){document.onmouseup=null;document.onmousemove=null;panel.style.cursor='';}
}

// Init
function init(){
    loadPrg();loadS();loadD();
    
    // Stats
    const sBtn=document.getElementById('statsBtn'),sPnl=document.getElementById('statsPanel'),sCls=document.getElementById('statsClose');
    if(sBtn)sBtn.addEventListener('click',()=>{render();if(sPnl){sPnl.style.display='block';drag(sPnl,sPnl.querySelector('.stats-header'),['.learn-close-btn','button']);}});
    if(sCls)sCls.addEventListener('click',()=>{if(sPnl)sPnl.style.display='none';});
    
    // Daily
    const dBdg=document.getElementById('dailyChallengeBadge'),dPnl=document.getElementById('dailyChallengePanel');
    if(dBdg){
        dBdg.style.display='block';
        dBdg.addEventListener('click',()=>{renderD();if(dPnl){dPnl.style.display='block';drag(dPnl,dPnl.querySelector('.daily-header'),['.btn','button']);}});
        setInterval(updCD,1000);updCD();
        // Draggable badge
        drag(dBdg,dBdg,[]);
    }
    
    // Share
    const shBtn=document.getElementById('shareBtn'),shPop=document.getElementById('sharePopup'),shCls=document.getElementById('shareCloseBtn'),
          shCpy=document.getElementById('shareCopyBtn'),shTW=document.getElementById('shareTwitterBtn'),shFB=document.getElementById('shareFacebookBtn');
    if(shCls)shCls.addEventListener('click',()=>{if(shPop)shPop.classList.remove('show');});
    if(shCpy)shCpy.addEventListener('click',()=>{const u=document.getElementById('shareUrlBox');if(u)copy(u.textContent);});
    if(shTW)shTW.addEventListener('click',shrTW);
    if(shFB)shFB.addEventListener('click',shrFB);
    if(shPop)drag(shPop,shPop,['.share-btn','button','.share-url-box']);
    
    console.log('✅ Enhancements loaded');
}

// API
window.GameEnhancements={
    trackGameCompletion:track,
    updateAchievementProgress:updAch,
    completeDailyChallenge:compD,
    showSharePopup:showShr,
    loadStats:loadS,
    loadDailyChallenge:loadD
};

// Start
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();

})();
