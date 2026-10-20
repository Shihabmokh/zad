/* ============ زاد — الحالة والتخزين ============ */
const Zad = (() => {
  const KEY = 'zad.state.v1';
  const DEF = {
    name: '',
    theme: 'auto',            // auto | day | night | sepia
    font: 'amiri',            // amiri | tajawal | plex
    fontSize: 19, lineH: 2.05, readW: 38,
    morning: '11:00', evening: '22:00',
    interests: null,          // null = الكل؛ أو مصفوفة فئات عامة مهتم بها
    cyberOn: true,
    ai: { enabled:false, provider:'anthropic', base:'', key:'', model:'claude-opus-4-8' },
    // بيانات المستخدم
    read: {},                 // id -> timestamp
    saved: {},                // id -> true
    rated: {},                // id -> 'yes' | 'no'
    hidden: {},               // id -> true (غير مهتم يخفي)
    notes: {},                // id -> نص التأمل
    quiz: {},                 // id -> index المختار
    daily: {},                // 'YYYY-MM-DD' -> { general:id, cyber:id }
    generated: [],            // مواضيع مولّدة/مستوردة (كائنات topic)
    streak: 0, lastRead: '', readDays: {}, // 'YYYY-MM-DD' -> count
    firstRun: true
  };
  let s = load();

  function load(){
    try { const r = JSON.parse(localStorage.getItem(KEY)); return r ? deepMerge(structuredClone(DEF), r) : structuredClone(DEF); }
    catch(e){ return structuredClone(DEF); }
  }
  function deepMerge(a,b){ for(const k in b){ if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]) deepMerge(a[k],b[k]); else a[k]=b[k]; } return a; }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }

  // ---- التاريخ ----
  function dayKey(d=new Date()){
    const z=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;
  }
  // اختيار شبه عشوائي ثابت لليوم (بذرة من التاريخ + ملح)
  function seeded(seed){ let h=2166136261>>>0; const str=String(seed); for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0)/4294967296; }

  // ---- مجموع المواضيع (المكتبة + المولّد) ----
  function pool(){ return (window.TOPICS||[]).concat(s.generated||[]); }
  function byId(id){ return pool().find(t=>t.id===id); }
  function catsOf(track){
    const set=new Set(); pool().forEach(t=>{ if(t.track===track) set.add(t.cat); }); return [...set];
  }

  // ---- اختيار مواضيع اليوم ----
  function pick(track, dk){
    const all = pool().filter(t=>t.track===track && !s.hidden[t.id]);
    let cand = all;
    if(track==='general' && Array.isArray(s.interests)) {
      const f = all.filter(t=>s.interests.includes(t.cat));
      if(f.length) cand = f;
    }
    // فضّل غير المقروء
    const unread = cand.filter(t=>!s.read[t.id]);
    const base = unread.length ? unread : cand;
    if(!base.length) return null;
    const idx = Math.floor(seeded(dk+'|'+track) * base.length);
    return base[idx] ? base[idx].id : base[0].id;
  }
  function today(){
    const dk = dayKey();
    if(!s.daily[dk]) s.daily[dk] = {};
    const d = s.daily[dk];
    if(!d.general || !byId(d.general)) { const g=pick('general',dk); if(g){ d.general=g; save(); } }
    if(s.cyberOn && (!d.cyber || !byId(d.cyber))) { const c=pick('cyber',dk); if(c){ d.cyber=c; save(); } }
    return { dk, general:d.general?byId(d.general):null, cyber:d.cyber?byId(d.cyber):null };
  }
  function setDailyCyber(id){ const dk=dayKey(); if(!s.daily[dk]) s.daily[dk]={}; s.daily[dk].cyber=id; save(); }

  // ---- فعل القراءة + السلسلة ----
  function markRead(id){
    const now=Date.now(), dk=dayKey();
    const firstToday = !s.readDays[dk];
    if(!s.read[id]) s.read[id]=now;
    s.readDays[dk]=(s.readDays[dk]||0)+ (s.read[id]===now?1:0);
    if(firstToday){
      const y=new Date(); y.setDate(y.getDate()-1);
      s.streak = (s.lastRead===dayKey(y)) ? s.streak+1 : 1;
      s.lastRead = dk;
    }
    save();
  }
  function isStreakAlive(){
    if(!s.lastRead) return false;
    const t=dayKey(), y=new Date(); y.setDate(y.getDate()-1);
    return s.lastRead===t || s.lastRead===dayKey(y);
  }

  // ---- تقييم / حفظ / إخفاء ----
  function rate(id,v){ if(s.rated[id]===v){ delete s.rated[id]; } else { s.rated[id]=v; } if(v==='no') s.hidden[id]=true; else delete s.hidden[id]; save(); }
  function toggleSave(id){ if(s.saved[id]) delete s.saved[id]; else s.saved[id]=true; save(); return !!s.saved[id]; }
  function toggleHidden(id){ if(s.hidden[id]) delete s.hidden[id]; else s.hidden[id]=true; save(); return !!s.hidden[id]; }
  function note(id,v){ s.notes[id]=v; save(); }
  function setQuiz(id,i){ s.quiz[id]=i; save(); }

  // ---- إحصاء ----
  function stats(){
    const readIds=Object.keys(s.read);
    const byCat={};
    readIds.forEach(id=>{ const t=byId(id); if(t) byCat[t.cat]=(byCat[t.cat]||0)+1; });
    const days=[]; for(let i=29;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days.push(s.readDays[dayKey(d)]||0); }
    return { total:readIds.length, saved:Object.keys(s.saved).length, streak:s.streak, byCat, days,
             general:readIds.filter(id=>{const t=byId(id);return t&&t.track==='general';}).length,
             cyber:readIds.filter(id=>{const t=byId(id);return t&&t.track==='cyber';}).length };
  }

  function set(patch){ Object.assign(s, patch); save(); }
  function addGenerated(t){ s.generated.unshift(t); save(); }
  function reset(){ s=structuredClone(DEF); save(); }

  return {
    get s(){return s;}, save, dayKey, pool, byId, catsOf, today, setDailyCyber,
    markRead, isStreakAlive, rate, toggleSave, toggleHidden, note, setQuiz, stats,
    set, addGenerated, reset
  };
})();
