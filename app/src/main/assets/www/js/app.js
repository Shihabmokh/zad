/* ============ زاد — الواجهة والتنقّل ============ */
(() => {
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');
  const S = () => Zad.s;

  /* ---------- الثيم ---------- */
  function effectiveTheme(){
    const t = S().theme;
    if(t!=='auto') return t;
    const h = new Date().getHours();
    return (h>=18 || h<6) ? 'night' : 'day';
  }
  function applyTheme(){
    const t = effectiveTheme();
    document.documentElement.setAttribute('data-theme', t==='day'?'':t);
    const fonts={amiri:"'Amiri',serif",tajawal:"'Tajawal',sans-serif",plex:"'Plex Ar',sans-serif"};
    document.documentElement.style.setProperty('--read', fonts[S().font]||fonts.amiri);
    document.documentElement.style.setProperty('--read-size', S().fontSize+'px');
    document.documentElement.style.setProperty('--read-lh', S().lineH);
    document.documentElement.style.setProperty('--read-w', S().readW+'em');
  }

  /* ---------- جسر أندرويد ---------- */
  function syncAlarms(){
    try{ if(window.AndroidBridge && AndroidBridge.setAlarms) AndroidBridge.setAlarms(S().morning, S().evening); }catch(e){}
  }
  // يستدعيه أندرويد عند النقر على التنبيه
  window.ZadOpen = (track)=>{ location.hash = '#/today/'+(track==='general'?'general':'cyber'); };

  /* ---------- أدوات ---------- */
  let toastT;
  function toast(msg){
    let el=document.querySelector('.toast'); if(!el){ el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function greeting(){
    const h=new Date().getHours(); const n=S().name?('، '+S().name):'';
    if(h<5) return 'ليلة مباركة'+n;
    if(h<12) return 'صباح الخير'+n;
    if(h<17) return 'نهارك طيب'+n;
    if(h<22) return 'مساء الخير'+n;
    return 'مساء الخير'+n;
  }

  /* ---------- شريط علوي ---------- */
  function topbar(){
    const alive=Zad.isStreakAlive(), st=S().streak;
    return `<header class="topbar"><div class="wrap">
      <div class="brand">${I.lamp}<span>زاد</span></div>
      <div class="spacer"></div>
      <div class="streak" title="سلسلة القراءة" style="${st&&alive?'':'opacity:.5'}">${I.flame}<span>${st||0}</span></div>
      <button class="icon-btn" data-go="settings" aria-label="الإعدادات">${I.gear}</button>
    </div></header>`;
  }

  /* ================= الرئيسية ================= */
  function viewHome(){
    const {general, cyber} = Zad.today();
    const h=new Date().getHours();
    const stx=Zad.stats();
    const leaf=(t, due, timeLbl)=>{
      if(!t) return '';
      const done=!!S().read[t.id];
      return `<a class="leaf ${t.track==='cyber'?'cyber':''} ${due?'due':''}" data-read="${t.id}">
        <div class="row1"><span class="chip">${catName(t.cat)}</span>
          ${t.en?`<span class="en">${esc(t.en)}</span>`:''}
          <span class="when">${I.clock}${timeLbl}</span></div>
        <h3>${esc(t.title)}</h3>
        ${t.subtitle?`<p class="sub">${esc(t.subtitle)}</p>`:''}
        <div class="foot">
          ${done?`<span class="done">${I.check}تمت القراءة</span>`:`<span>${t.minutes} دقائق قراءة</span>`}
          <span class="cta">${done?'إعادة':'اقرأ الآن'} ›</span>
        </div></a>`;
    };
    const cyberDue = h>=11 && h<22;
    return `${topbar()}<main class="wrap">
      <div class="greet"><h1>${greeting()}</h1><p>زادك اليوم بين يديك. موضوعان يفتحان لك باباً جديداً.</p></div>

      <div class="section-head"><h2>زاد اليوم</h2><div class="ln"></div></div>
      ${leaf(cyber, cyberDue, 'الحادية عشرة صباحاً')}
      ${leaf(general, !cyberDue, 'العاشرة مساءً')}

      <div class="section-head"><h2>رحلتك</h2><div class="ln"></div><a data-go="stats">التفاصيل</a></div>
      <div class="mini-stats">
        <div class="stat"><b>${stx.streak||0}</b><span>يوم متتالٍ</span></div>
        <div class="stat"><b>${stx.total}</b><span>موضوعاً قرأته</span></div>
        <div class="stat"><b>${stx.saved}</b><span>محفوظ</span></div>
      </div>

      <div class="section-head"><h2>من المكتبة</h2><div class="ln"></div><a data-go="lib">الكل</a></div>
      ${suggestions()}
    </main>`;
  }
  function suggestions(){
    const read=S().read, hidden=S().hidden;
    const pool=Zad.pool().filter(t=>!read[t.id]&&!hidden[t.id]);
    const today=Zad.today();
    const ex=new Set([today.general&&today.general.id, today.cyber&&today.cyber.id]);
    const list=pool.filter(t=>!ex.has(t.id)).slice(0,4);
    if(!list.length) return `<p class="hint">قرأت كل المواضيع المتاحة! فعّل التوليد بالذكاء الاصطناعي من الإعدادات لمواضيع جديدة كل يوم.</p>`;
    return `<ul class="tlist">${list.map(rowItem).join('')}</ul>`;
  }

  /* ================= المكتبة ================= */
  let libTrack='all', libCat='all', libMode='all';
  function viewLib(){
    const cats = libTrack==='cyber'?Zad.catsOf('cyber'):libTrack==='general'?Zad.catsOf('general'):[...Zad.catsOf('general'),...Zad.catsOf('cyber')];
    const chips = ['all',...cats].map(c=>`<button class="fchip ${libCat===c?'on':''}" data-cat="${c}">${c==='all'?'كل الفئات':catName(c)}</button>`).join('');
    return `${topbar()}<main class="wrap">
      <div class="greet" style="padding-bottom:0"><h1>المكتبة</h1></div>
      <div class="seg">
        <button class="${libTrack==='all'?'on':''}" data-track="all">الكل</button>
        <button class="${libTrack==='general'?'on':''}" data-track="general">معرفة عامة</button>
        <button class="${libTrack==='cyber'?'on':''}" data-track="cyber">أمن سيبراني</button>
      </div>
      <div class="filters">${chips}</div>
      <div class="seg" style="margin-top:4px">
        <button class="${libMode==='all'?'on':''}" data-mode="all">الكل</button>
        <button class="${libMode==='unread'?'on':''}" data-mode="unread">غير مقروء</button>
        <button class="${libMode==='read'?'on':''}" data-mode="read">مقروء</button>
        <button class="${libMode==='hidden'?'on':''}" data-mode="hidden">مخفي</button>
      </div>
      ${libList()}
    </main>`;
  }
  function libList(){
    let list=Zad.pool();
    if(libTrack!=='all') list=list.filter(t=>t.track===libTrack);
    if(libCat!=='all') list=list.filter(t=>t.cat===libCat);
    const rd=S().read, hd=S().hidden;
    if(libMode==='unread') list=list.filter(t=>!rd[t.id]&&!hd[t.id]);
    else if(libMode==='read') list=list.filter(t=>rd[t.id]);
    else if(libMode==='hidden') list=list.filter(t=>hd[t.id]);
    else list=list.filter(t=>!hd[t.id]);
    if(!list.length) return emptyBox('لا مواضيع في هذا التصنيف بعد.');
    return `<ul class="tlist">${list.map(rowItem).join('')}</ul>`;
  }
  function rowItem(t){
    const done=!!S().read[t.id], saved=!!S().saved[t.id];
    return `<li class="titem ${t.track==='cyber'?'cyber':''} ${done?'read':''}" data-read="${t.id}">
      <span class="dot"></span>
      <div class="tx"><h4>${esc(t.title)}</h4><p>${catName(t.cat)} · ${t.minutes} د${saved?' · محفوظ':''}</p></div>
      ${saved?`<span class="star">${I.bookmarkOn}</span>`:''}
      ${done?`<span class="mk">${I.check}</span>`:''}
    </li>`;
  }

  /* ================= المحفوظات ================= */
  function viewSaved(){
    const ids=Object.keys(S().saved).filter(id=>Zad.byId(id));
    const list=ids.map(Zad.byId);
    return `${topbar()}<main class="wrap">
      <div class="greet"><h1>المحفوظات</h1><p>مواضيع اخترت أن تعود إليها.</p></div>
      ${list.length?`<ul class="tlist">${list.map(rowItem).join('')}</ul>`:emptyBox('لم تحفظ موضوعاً بعد. اضغط علامة الحفظ أثناء القراءة.')}
    </main>`;
  }

  /* ================= الإحصاء ================= */
  function viewStats(){
    const x=Zad.stats();
    const maxC=Math.max(1,...Object.values(x.byCat));
    const bars=Object.entries(x.byCat).sort((a,b)=>b[1]-a[1]).map(([c,n])=>
      `<div class="bar-row"><span class="bn">${catName(c)}</span><span class="bt"><i style="width:${Math.round(n/maxC*100)}%"></i></span><span class="bv">${n}</span></div>`).join('')
      || `<p class="hint">ابدأ القراءة لترى تقدّمك هنا.</p>`;
    const mx=Math.max(1,...x.days);
    const heat=x.days.map(d=>{const l=d===0?0:d>=mx?3:d>=Math.ceil(mx/2)?2:1;return `<i class="${l?'l'+l:''}" title="${d} موضوع"></i>`;}).join('');
    return `${topbar()}<main class="wrap">
      <div class="greet"><h1>رحلتك</h1><p>كل موضوع تقرؤه تصويتٌ لمن تريد أن تصبح.</p></div>
      <div class="mini-stats" style="margin-bottom:18px">
        <div class="stat"><b>${x.streak}</b><span>يوم متتالٍ</span></div>
        <div class="stat"><b>${x.general}</b><span>معرفة عامة</span></div>
        <div class="stat"><b>${x.cyber}</b><span>أمن سيبراني</span></div>
      </div>
      <div class="section-head"><h2>آخر ٣٠ يوماً</h2><div class="ln"></div></div>
      <div class="heat">${heat}</div>
      <div class="section-head"><h2>حسب الفئة</h2><div class="ln"></div></div>
      <div class="bars">${bars}</div>
    </main>`;
  }

  /* ================= القارئ ================= */
  function viewReader(id){
    const t=Zad.byId(id);
    if(!t) return `${topbar()}<main class="wrap">${emptyBox('الموضوع غير موجود.')}</main>`;
    Zad.markRead(id);
    const saved=!!S().saved[id];
    const terms=(t.terms&&t.terms.length)?`<div class="panel cy"><div class="ph">${I.key} مصطلحات تقنية</div>
      <table class="terms"><tbody>${t.terms.map(x=>`<tr><td class="en">${esc(x.en)}</td><td>${esc(x.ar)}</td></tr>`).join('')}</tbody></table></div>`:'';
    const kp=(t.keyPoints&&t.keyPoints.length)?`<div class="panel spine ${t.track==='cyber'?'cy':''}"><div class="ph">${I.spark} النقاط الأساسية</div>
      <ul class="kp">${t.keyPoints.map(p=>`<li>${esc(p)}</li>`).join('')}</ul></div>`:'';
    const quiz=t.quiz?quizHtml(t):'';
    const savedNote=S().notes[id]||'';
    const reflect=t.reflect?`<div class="panel reflect"><div class="ph">${I.think} وقفة تأمّل</div>
      <p class="rq">${esc(t.reflect)}</p>
      <textarea data-note="${id}" placeholder="اكتب خاطرتك هنا… (تُحفظ تلقائياً)">${esc(savedNote)}</textarea>
      <div class="saved-tip" data-notetip="${id}"></div></div>`:'';
    const refs=(t.reading&&t.reading.length)?`<div class="panel"><div class="ph">${I.book} للقراءة والتوسّع</div>
      <ul class="refs">${t.reading.map(r=>`<li class="ref"><span class="rtype">${esc(r.type)}</span>
        <div class="rbody"><h5>${esc(r.title)}</h5>${r.author?`<p class="au">${esc(r.author)}</p>`:''}${r.note?`<p class="nt">${esc(r.note)}</p>`:''}</div></li>`).join('')}</ul></div>`:'';
    const rv=S().rated[id];
    return `<div class="progress" id="prog"></div>
      <div class="reader-bar"><div class="wrap">
        <button class="icon-btn" data-back aria-label="رجوع">${I.back}</button>
        <div class="spacer"></div>
        <button class="icon-btn" data-save="${id}" aria-label="حفظ">${saved?I.bookmarkOn:I.bookmark}</button>
        <button class="icon-btn" data-share="${id}" aria-label="مشاركة">${I.share}</button>
      </div></div>
      <article class="reader"><div class="col">
        <div class="cat-row"><span class="chip">${catName(t.cat)}</span>${t.en?`<span class="en">${esc(t.en)}</span>`:''}</div>
        <h1>${esc(t.title)}</h1>
        ${t.subtitle?`<p class="sub">${esc(t.subtitle)}</p>`:''}
        <div class="meta"><span>${I.clock}${t.minutes} دقائق</span><span>${I.book}${t.track==='cyber'?'أمن سيبراني':'معرفة عامة'}</span></div>
        <div class="rt">${renderBody(t.body)}</div>
        ${kp}${terms}${quiz}${reflect}${refs}
        <div class="ratebar">
          <button class="rate yes ${rv==='yes'?'on':''}" data-rate="${id}|yes">${I.up} مفيد</button>
          <button class="rate no ${rv==='no'?'on':''}" data-rate="${id}|no">${I.down} غير مهتم</button>
        </div>
        <button class="nextbtn" data-nextfrom="${id}">${I.next} موضوع آخر</button>
      </div></article>`;
  }
  function quizHtml(t){
    const chosen=S().quiz[t.id];
    const answered=chosen!=null;
    const opts=t.quiz.options.map((o,i)=>{
      let cls=''; if(answered){ if(i===t.quiz.answer) cls='correct'; else if(i===chosen) cls='wrong'; }
      const mk=answered&&i===t.quiz.answer?I.check:(answered&&i===chosen?'✕':String.fromCharCode(1632+i));
      return `<button class="opt ${cls}" data-opt="${t.id}|${i}" ${answered?'disabled':''}><span class="mk">${mk}</span><span>${esc(o)}</span></button>`;
    }).join('');
    return `<div class="panel ${t.track==='cyber'?'cy':''} quiz" data-quiz="${t.id}"><div class="ph">${I.check} اختبر فهمك</div>
      <p class="q">${esc(t.quiz.q)}</p>
      <div class="opts">${opts}</div>
      <div class="explain ${answered?'show':''}">${esc(t.quiz.explain)}</div></div>`;
  }

  function emptyBox(msg){ return `<div class="empty">${I.seed}<p>${esc(msg)}</p></div>`; }

  /* ---------- شريط التنقّل السفلي ---------- */
  function renderNav(active){
    const items=[['home','الرئيسية',I.home],['lib','المكتبة',I.grid],['saved','المحفوظات',I.bookmark],['stats','رحلتك',I.chart]];
    nav.innerHTML=`<div class="inner">${items.map(([k,l,ic])=>`<button class="${active===k?'on':''}" data-go="${k}">${ic}<span>${l}</span></button>`).join('')}</div>`;
    nav.style.display = active==='reader' ? 'none' : '';
  }

  /* ================= التوجيه ================= */
  function route(){
    applyTheme();
    const h=location.hash||'#/home';
    const parts=h.replace(/^#\//,'').split('/');
    const page=parts[0]||'home';
    window.scrollTo(0,0);
    if(page==='read'){ app.innerHTML=viewReader(decodeURIComponent(parts[1]||'')); renderNav('reader'); attachReader(); return; }
    if(page==='today'){
      const d=Zad.today(); const t=parts[1]==='general'?d.general:d.cyber;
      if(t){ location.replace('#/read/'+encodeURIComponent(t.id)); return; }
      location.replace('#/home'); return;
    }
    const map={home:viewHome,lib:viewLib,saved:viewSaved,stats:viewStats,settings:viewSettings};
    app.innerHTML=(map[page]||viewHome)();
    renderNav(page==='settings'?'':page);
    if(page==='settings') attachSettings();
  }

  /* ---------- أحداث القارئ ---------- */
  function attachReader(){
    const prog=document.getElementById('prog');
    const onScroll=()=>{ const sc=document.documentElement.scrollHeight-window.innerHeight; prog.style.width=sc>0?(window.scrollY/sc*100)+'%':'0'; };
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  }

  /* ---------- النقرات العامة ---------- */
  document.addEventListener('click', e=>{
    const go=e.target.closest('[data-go]'); if(go){ location.hash='#/'+go.dataset.go; return; }
    const back=e.target.closest('[data-back]'); if(back){ if(history.length>1) history.back(); else location.hash='#/home'; return; }
    const read=e.target.closest('[data-read]'); if(read){ location.hash='#/read/'+encodeURIComponent(read.dataset.read); return; }

    const opt=e.target.closest('[data-opt]'); if(opt){ const [id,i]=opt.dataset.opt.split('|'); Zad.setQuiz(id,+i);
      const q=opt.closest('[data-quiz]'); const t=Zad.byId(id);
      q.querySelectorAll('.opt').forEach((b,bi)=>{ b.disabled=true; b.querySelector('.mk').textContent='';
        if(bi===t.quiz.answer){ b.classList.add('correct'); b.querySelector('.mk').innerHTML=I.check; }
        else if(bi===+i){ b.classList.add('wrong'); b.querySelector('.mk').textContent='✕'; }
        else b.querySelector('.mk').textContent=String.fromCharCode(1632+bi); });
      q.querySelector('.explain').classList.add('show'); return; }

    const save=e.target.closest('[data-save]'); if(save){ const on=Zad.toggleSave(save.dataset.save);
      save.innerHTML=on?I.bookmarkOn:I.bookmark; toast(on?'أُضيف إلى المحفوظات':'أُزيل من المحفوظات'); return; }

    const share=e.target.closest('[data-share]'); if(share){ const t=Zad.byId(share.dataset.share);
      const txt=`${t.title}\n${t.subtitle||''}\n\n— من تطبيق زاد`;
      if(navigator.share) navigator.share({title:t.title,text:txt}).catch(()=>{});
      else { try{navigator.clipboard.writeText(txt);}catch(e){} toast('نُسخ العنوان'); } return; }

    const rate=e.target.closest('[data-rate]'); if(rate){ const [id,v]=rate.dataset.rate.split('|'); Zad.rate(id,v);
      const bar=rate.parentElement; bar.querySelectorAll('.rate').forEach(b=>b.classList.remove('on'));
      if(S().rated[id]) rate.classList.add('on');
      toast(S().rated[id]==='no'?'لن نُظهر هذا النوع كثيراً':S().rated[id]==='yes'?'شكراً، سنُظهر المزيد مثله':'أُلغي التقييم'); return; }

    const nf=e.target.closest('[data-nextfrom]'); if(nf){ nextTopic(nf.dataset.nextfrom); return; }
  });

  document.addEventListener('input', e=>{
    const note=e.target.closest('[data-note]'); if(note){ Zad.note(note.dataset.note, note.value);
      const tip=document.querySelector(`[data-notetip="${note.dataset.note}"]`); if(tip){ tip.textContent='حُفظت خاطرتك ✓'; clearTimeout(tip._t); tip._t=setTimeout(()=>tip.textContent='',1500);} }
  });

  function nextTopic(fromId){
    const from=Zad.byId(fromId);
    let list=Zad.pool().filter(t=>!S().read[t.id]&&!S().hidden[t.id]&&t.id!==fromId);
    if(from){ const same=list.filter(t=>t.track===from.track); if(same.length) list=same; }
    if(!list.length){ toast('قرأت كل المواضيع المتاحة!'); location.hash='#/home'; return; }
    const t=list[Math.floor(Math.random()*list.length)];
    location.hash='#/read/'+encodeURIComponent(t.id);
  }

  /* ---------- المكتبة: الفلاتر ---------- */
  document.addEventListener('click', e=>{
    const tr=e.target.closest('[data-track]'); if(tr){ libTrack=tr.dataset.track; libCat='all'; app.innerHTML=viewLib(); return; }
    const ct=e.target.closest('[data-cat]'); if(ct){ libCat=ct.dataset.cat; app.innerHTML=viewLib(); return; }
    const md=e.target.closest('[data-mode]'); if(md){ libMode=md.dataset.mode; app.innerHTML=viewLib(); return; }
  });

  window.addEventListener('hashchange', route);

  /* إتاحة الإعدادات والثيم للملف الآخر */
  window.ZadUI={ route, applyTheme, toast, syncAlarms, S, greeting };
  document.addEventListener('DOMContentLoaded', ()=>{ applyTheme(); syncAlarms(); route(); });
  if(document.readyState!=='loading'){ applyTheme(); syncAlarms(); route(); }
})();
