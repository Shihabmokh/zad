/* ============ زاد — توليد موضوع الأمن السيبراني بالذكاء الاصطناعي + الاستيراد ============ */
const AI = (() => {

  const SCHEMA_HINT = `أعد كائن JSON واحداً فقط (بدون أي نص قبله أو بعده، وبدون علامات code block) بهذا الشكل بالضبط:
{
 "title":"عنوان جذاب بالعربية",
 "subtitle":"سطر توضيحي واحد",
 "en":"English term/name of the topic",
 "minutes": 7,
 "body":"النص الكامل. استخدم الصيغة التالية: '## ' لعنوان فرعي، '- ' لنقطة في قائمة، '> ' لاقتباس، سطر فارغ يفصل الفقرات. للمصطلح التقني الإنجليزي ضعه بين قوسين مزدوجين هكذا [[SIEM]]. لكتلة أوامر/كود ضع سطر ~~~ قبلها وبعدها. اكتب 4 إلى 6 أقسام غنية ودقيقة.",
 "keyPoints":["نقطة 1","نقطة 2","نقطة 3"],
 "terms":[{"en":"English Term","ar":"المقابل العربي"}],
 "quiz":{"q":"سؤال","options":["أ","ب","ج","د"],"answer":1,"explain":"شرح الإجابة"},
 "reflect":"سؤال تأمل واحد يربط الموضوع بحياة الطالب أو عمله",
 "reading":[{"type":"كتاب","title":"...","author":"...","note":"لماذا يُنصح به"}]
}`;

  const SYS = `أنت معلّم خبير في الأمن السيبراني تكتب للطالب "شهاب"، طالب أمن سيبراني في سنته الأخيرة، هدفه أن يصبح محلل SOC ومهندس كشف. اكتب موضوعاً يومياً عميقاً ودقيقاً وممتعاً باللغة العربية الفصحى، بنبرة تشرح "لماذا" لا "ماذا" فقط، وتربط المفهوم بالعمل الدفاعي الواقعي. ركّز على الجانب الدفاعي والمفاهيمي والتحليلي (الفرق الزرقاء، الكشف، الاستجابة، التشفير، الهوية، أساسيات الشبكات والأنظمة). لا تعطِ تعليمات تشغيلية لمهاجمة أنظمة حقيقية. ضع المصطلحات الإنجليزية المهمة بين [[ ]]. التزم بصيغة JSON المطلوبة حرفياً.`;

  function topicsSeenList(){
    return Zad.pool().filter(t=>t.track==='cyber').map(t=>t.title).slice(0,60);
  }

  async function generate(userHint){
    const ai = Zad.s.ai;
    if(!ai.key) throw new Error('لا يوجد مفتاح API. أضفه من الإعدادات.');
    const seen = topicsSeenList();
    const prompt = `اكتب موضوع اليوم في الأمن السيبراني.${userHint?(' ركّز على: '+userHint+'.'):''}
تجنّب تكرار هذه المواضيع التي سبق تناولها: ${seen.join(' | ')}.
${SCHEMA_HINT}`;

    let raw;
    if(ai.provider==='anthropic'){
      raw = await callAnthropic(ai, prompt);
    } else {
      raw = await callOpenAICompat(ai, prompt);
    }
    const obj = parseJSON(raw);
    return normalize(obj);
  }

  async function callAnthropic(ai, prompt){
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'content-type':'application/json',
        'x-api-key':ai.key,
        'anthropic-version':'2023-06-01',
        'anthropic-dangerous-direct-browser-access':'true'
      },
      body:JSON.stringify({
        model: ai.model || 'claude-opus-4-8',
        max_tokens: 3000,
        system: SYS,
        messages:[{role:'user',content:prompt}]
      })
    });
    if(!r.ok){ throw new Error('فشل الاتصال ('+r.status+'): '+(await r.text()).slice(0,180)); }
    const j = await r.json();
    return (j.content && j.content[0] && j.content[0].text) || '';
  }

  async function callOpenAICompat(ai, prompt){
    const base = (ai.base || 'https://api.openai.com/v1').replace(/\/$/,'');
    const r = await fetch(base+'/chat/completions', {
      method:'POST',
      headers:{ 'content-type':'application/json', 'authorization':'Bearer '+ai.key },
      body:JSON.stringify({
        model: ai.model || 'gpt-4o',
        temperature:0.7,
        messages:[{role:'system',content:SYS},{role:'user',content:prompt}]
      })
    });
    if(!r.ok){ throw new Error('فشل الاتصال ('+r.status+'): '+(await r.text()).slice(0,180)); }
    const j = await r.json();
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  }

  function parseJSON(raw){
    let t = String(raw||'').trim();
    t = t.replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
    const a=t.indexOf('{'), b=t.lastIndexOf('}');
    if(a>=0 && b>a) t=t.slice(a,b+1);
    return JSON.parse(t);
  }

  function normalize(o){
    if(!o || !o.title || !o.body) throw new Error('المحتوى المُستلم ناقص.');
    return {
      id:'ai-'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),
      track:'cyber', cat: o.cat || 'core', generated:true,
      title:String(o.title), subtitle:o.subtitle?String(o.subtitle):'',
      en:o.en?String(o.en):'', minutes: Number(o.minutes)||7,
      body:String(o.body),
      keyPoints: Array.isArray(o.keyPoints)?o.keyPoints.map(String).slice(0,6):[],
      terms: Array.isArray(o.terms)?o.terms.filter(x=>x&&x.en).map(x=>({en:String(x.en),ar:String(x.ar||'')})).slice(0,8):[],
      quiz: (o.quiz&&o.quiz.q&&Array.isArray(o.quiz.options))?{
        q:String(o.quiz.q), options:o.quiz.options.map(String),
        answer:Number(o.quiz.answer)||0, explain:String(o.quiz.explain||'')
      }:null,
      reflect:o.reflect?String(o.reflect):'',
      reading: Array.isArray(o.reading)?o.reading.map(r=>({type:String(r.type||'مرجع'),title:String(r.title||''),author:String(r.author||''),note:String(r.note||'')})).slice(0,6):[]
    };
  }

  /* استيراد مواضيع من ملف JSON (كائن واحد أو مصفوفة) */
  function importText(text){
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    let n=0;
    arr.forEach(o=>{ try{ const t=normalizeImport(o); Zad.addGenerated(t); n++; }catch(e){} });
    if(!n) throw new Error('لم يُعثر على مواضيع صالحة في الملف.');
    return n;
  }
  function normalizeImport(o){
    if(!o.title || !o.body) throw new Error('bad');
    const t = normalize(o);
    t.track = (o.track==='general')?'general':'cyber';
    t.id = o.id || t.id;
    return t;
  }

  return { generate, importText };
})();
