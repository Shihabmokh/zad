/* ============ زاد — الإعدادات ============ */
function viewSettings(){
  const S=Zad.s;
  const themes=[['auto','تلقائي','linear-gradient(90deg,#f5f2ea 50%,#13151c 50%)'],
                ['day','نهاري','#f5f2ea'],['night','ليلي','#13151c'],['sepia','ورقي','#ece0c8']];
  const fonts=[['amiri','أميري (نسخ كلاسيكي)'],['tajawal','تجوّل (حديث)'],['plex','بلكس (واضح)']];
  const gcats=Zad.catsOf('general');
  const interests=S.interests;
  const pills=gcats.map(c=>`<button class="pill ${(!interests||interests.includes(c))?'on':''}" data-int="${c}">${catName(c)}</button>`).join('');
  const ai=S.ai;
  return `<header class="topbar"><div class="wrap">
      <button class="icon-btn" data-back aria-label="رجوع">${I.back}</button>
      <div class="brand" style="font-size:20px">الإعدادات</div><div class="spacer"></div>
    </div></header>
  <main class="wrap">

    <div class="set-group"><div class="gh">الحساب</div>
      <div class="set-row"><div class="lbl"><b>اسمك</b><small>يظهر في التحية</small></div>
        <input type="text" id="setName" value="${esc(S.name)}" placeholder="شهاب" maxlength="24"></div>
    </div>

    <div class="set-group"><div class="gh">المظهر</div>
      <div class="swatches">${themes.map(([k,l,bg])=>`<button class="sw ${S.theme===k?'on':''}" data-theme="${k}"><div class="prev" style="background:${bg}"></div>${l}</button>`).join('')}</div>
    </div>

    <div class="set-group"><div class="gh">القراءة</div>
      <div class="set-row"><div class="lbl"><b>الخط</b></div>
        <select id="setFont">${fonts.map(([k,l])=>`<option value="${k}" ${S.font===k?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="set-row" style="display:block"><div class="lbl" style="margin-bottom:8px"><b>حجم النص</b> <small>(${S.fontSize}px)</small></div>
        <input class="slider" type="range" id="setSize" min="16" max="24" step="1" value="${S.fontSize}"></div>
      <div class="set-row" style="display:block"><div class="lbl" style="margin-bottom:8px"><b>تباعد الأسطر</b></div>
        <input class="slider" type="range" id="setLh" min="1.7" max="2.4" step="0.05" value="${S.lineH}"></div>
      <div class="set-row" style="display:block"><div class="lbl" style="margin-bottom:8px"><b>عرض النص</b></div>
        <input class="slider" type="range" id="setW" min="32" max="52" step="1" value="${S.readW}"></div>
      <div class="rt" style="padding:4px 16px 16px;font-size:var(--read-size);line-height:var(--read-lh)"><p style="margin:0">معاينة: العلم زادُ الرحلة، والقراءة نورُها. كل يومٍ صفحةٌ جديدة.</p></div>
    </div>

    <div class="set-group"><div class="gh">التنبيهات اليومية</div>
      <div class="set-row"><div class="lbl"><b>موضوع الأمن السيبراني</b><small>صباحاً</small></div>
        <input type="time" id="setMorning" value="${S.morning}"></div>
      <div class="set-row"><div class="lbl"><b>موضوع المعرفة العامة</b><small>مساءً</small></div>
        <input type="time" id="setEvening" value="${S.evening}"></div>
      <div class="hint">يذكّرك التطبيق في هذين الموعدين بموضوع اليوم. إن لم تصلك التنبيهات، فعّل إذن الإشعارات وأوقف توفير البطارية لـ«زاد» من إعدادات النظام.</div>
    </div>

    <div class="set-group"><div class="gh">الاهتمامات (المعرفة العامة)</div>
      <div class="hint" style="padding-top:12px">اختر الفئات التي تريد أن يختار منها موضوع المساء. غير المختار لن يظهر في زاد اليوم.</div>
      <div class="pillset">${pills}</div>
    </div>

    <div class="set-group"><div class="gh">توليد الأمن السيبراني بالذكاء الاصطناعي</div>
      <div class="set-row"><div class="lbl"><b>تفعيل التوليد اليومي</b><small>موضوع جديد كل يوم بمفتاحك</small></div>
        <input type="checkbox" id="aiEnabled" ${ai.enabled?'checked':''} style="width:22px;height:22px;accent-color:var(--gold)"></div>
      <div class="set-row"><div class="lbl"><b>المزوّد</b></div>
        <select id="aiProvider">
          <option value="anthropic" ${ai.provider==='anthropic'?'selected':''}>Anthropic (Claude)</option>
          <option value="openai" ${ai.provider==='openai'?'selected':''}>OpenAI متوافق</option>
        </select></div>
      <div class="set-row"><div class="lbl"><b>المفتاح (API Key)</b><small>يُحفظ على جهازك فقط</small></div>
        <input type="password" id="aiKey" value="${esc(ai.key)}" placeholder="sk-..."></div>
      <div class="set-row"><div class="lbl"><b>النموذج</b></div>
        <input type="text" id="aiModel" value="${esc(ai.model)}" placeholder="claude-opus-4-8"></div>
      <div class="set-row" id="aiBaseRow" style="${ai.provider==='openai'?'':'display:none'}"><div class="lbl"><b>عنوان الخادم</b><small>لمزوّد متوافق</small></div>
        <input type="text" id="aiBase" value="${esc(ai.base)}" placeholder="https://api.openai.com/v1"></div>
      <button class="btn-line" id="aiTest">توليد موضوع تجريبي الآن ←</button>
      <div class="hint">يُستخدم مفتاحك للاتصال المباشر بالمزوّد من جهازك، ولا يُرسل لأي طرف آخر. قد يترتب على الاستخدام رسوم من المزوّد.</div>
    </div>

    <div class="set-group"><div class="gh">استيراد مواضيع</div>
      <button class="btn-line" id="impBtn">استيراد من ملف JSON ←</button>
      <input type="file" id="impFile" accept="application/json,.json" style="display:none">
      <div class="hint">ملف JSON يحوي كائن موضوع واحد أو مصفوفة مواضيع (بنفس حقول: title, subtitle, body, keyPoints, quiz, reading ...). استخدم «توليد تجريبي» لمعرفة الشكل.</div>
    </div>

    <div class="set-group"><div class="gh">عام</div>
      <button class="btn-line danger" id="resetBtn">إعادة ضبط التطبيق ومسح بياناتي</button>
    </div>
    <p class="hint" style="text-align:center">زاد · رفيقك اليومي للمعرفة</p>
  </main>`;
}

function attachSettings(){
  const S=Zad.s, U=window.ZadUI;
  const bind=(id,ev,fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); };

  bind('setName','input',e=>{ Zad.set({name:e.target.value.trim()}); });
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{
    Zad.set({theme:b.dataset.theme}); U.applyTheme();
    document.querySelectorAll('.sw').forEach(x=>x.classList.toggle('on',x===b));
  }));
  bind('setFont','change',e=>{ Zad.set({font:e.target.value}); U.applyTheme(); });
  bind('setSize','input',e=>{ Zad.set({fontSize:+e.target.value}); U.applyTheme(); e.target.previousElementSibling&&(e.target.previousElementSibling.querySelector('small').textContent='('+e.target.value+'px)'); });
  bind('setLh','input',e=>{ Zad.set({lineH:+e.target.value}); U.applyTheme(); });
  bind('setW','input',e=>{ Zad.set({readW:+e.target.value}); U.applyTheme(); });

  bind('setMorning','change',e=>{ Zad.set({morning:e.target.value}); U.syncAlarms(); U.toast('حُدّث موعد الصباح'); });
  bind('setEvening','change',e=>{ Zad.set({evening:e.target.value}); U.syncAlarms(); U.toast('حُدّث موعد المساء'); });

  document.querySelectorAll('[data-int]').forEach(b=>b.addEventListener('click',()=>{
    const gcats=Zad.catsOf('general');
    let cur=Array.isArray(S.interests)?[...S.interests]:[...gcats];
    const c=b.dataset.int;
    if(cur.includes(c)) cur=cur.filter(x=>x!==c); else cur.push(c);
    if(!cur.length){ U.toast('اختر فئة واحدة على الأقل'); return; }
    Zad.set({interests: cur.length===gcats.length? null : cur});
    b.classList.toggle('on');
  }));

  // AI
  bind('aiEnabled','change',e=>Zad.set({ai:{...S.ai,enabled:e.target.checked}}));
  bind('aiProvider','change',e=>{ Zad.set({ai:{...S.ai,provider:e.target.value}}); const r=document.getElementById('aiBaseRow'); if(r) r.style.display=e.target.value==='openai'?'':'none'; });
  bind('aiKey','input',e=>Zad.set({ai:{...S.ai,key:e.target.value.trim()}}));
  bind('aiModel','input',e=>Zad.set({ai:{...S.ai,model:e.target.value.trim()}}));
  bind('aiBase','input',e=>Zad.set({ai:{...S.ai,base:e.target.value.trim()}}));
  bind('aiTest','click',async e=>{
    const btn=e.target; btn.textContent='جارٍ التوليد… قد يستغرق دقيقة'; btn.disabled=true;
    try{ const t=await AI.generate(''); Zad.addGenerated(t); Zad.setDailyCyber(t.id);
      U.toast('تم توليد موضوع جديد!'); location.hash='#/read/'+encodeURIComponent(t.id);
    }catch(err){ U.toast('تعذّر التوليد: '+err.message); btn.textContent='توليد موضوع تجريبي الآن ←'; btn.disabled=false; }
  });

  // Import
  bind('impBtn','click',()=>document.getElementById('impFile').click());
  bind('impFile','change',e=>{ const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ const n=AI.importText(r.result); U.toast('استُورد '+n+' موضوعاً'); }catch(err){ U.toast('ملف غير صالح: '+err.message); } }; r.readAsText(f);
  });

  bind('resetBtn','click',()=>{ if(confirm('سيُمسح كل تقدّمك ومحفوظاتك وإعداداتك. متابعة؟')){ Zad.reset(); U.applyTheme(); location.hash='#/home'; U.route(); U.toast('أُعيد الضبط'); } });
}
