// Arrival routes are observed session counts. Landing-to-cart joins remain unknown.
let renderFunnelVisual;
(()=>{
  const host=$('funnel-visual'),routes=D.channel_entry_routes;
  const groups=D.channel_motion.groups.map(g=>({...g,...routes.groups.find(r=>r.key===g.key)}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),wide=matchMedia('(min-width:1201px)');
  const entryTypes=[{key:'home',name:'الصفحة الرئيسية'},{key:'collection',name:'قسم / Collection'},{key:'product',name:'صفحة المنتج'},{key:'other',name:'أخرى / غير محددة'}];
  const icons=['<path d="M2 4h3l3 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/>','<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="m9 11 2 2 4-4"/>'];
  const person='<svg viewBox="0 0 18 23" aria-hidden="true"><circle cx="9" cy="4" r="3" fill="currentColor" stroke="white" stroke-width="1"/><path d="M5 9h8l1 7h-3v6H7v-6H4Z" fill="currentColor" stroke="white" stroke-width=".7"/></svg>';
  const neutral='<span class="ff-neutral" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/></svg></span>';
  let frame=0,onScreen=false,paused=false,matched=false,selected=null,modeArgs=null;
  const count=(g,key)=>key==='other'?g.entry_sessions.other+g.entry_sessions.unknown:g.entry_sessions[key];
  $('ff-store-summary').innerHTML=`<span>إجمالي المتجر في التقرير الأصلي · 90 يومًا</span><span><b>${fmt(T.sessions)}</b> جلسة</span><span><b>${fmt(T.purchases)}</b> شراء مسجّل</span><span><b>${fmt(T.purchase_revenue,2)}</b> ريال إيراد</span><span>متوسط قيمة الشراء <b>${fmt(T.aov,2)}</b> ريال</span>`;
  $('ff-entry-evidence').innerHTML='<b>ما الذي تثبته الخطوط؟</b><span>الخط الملوّن: القناة وصفحة بداية الجلسة كما ظهرت في GA4. الخط المتقطّع إلى السلة: مسار ممكن، وعدد الأشخاص الذين سلكوه غير مطابق بعد. لا نُجبر زائر الرئيسية أو القسم على فتح صفحة المنتج قبل السلة.</span><small>أزرار الإضافة للسلة ظاهرة في بطاقات الرئيسية والقسم في فحص 13 أكتوبر؛ لم ننفّذ الإضافة ولم نقس نجاح هذه المسارات. بعض المنتجات قد تطلب اختيار خياراتها.</small>';
  renderFunnelVisual=(steps,labels,open,reach=false)=>{
    modeArgs=[steps,labels,open,reach];matched=!reach&&!open;
    const shown=selected?groups.filter(g=>g.key===selected):groups;
    const entryCount=key=>shown.reduce((sum,g)=>sum+count(g,key),0);
    const stageCounts=reach?['add_to_cart','begin_checkout','purchase'].map(key=>D.events.find(r=>r.name===key).users):steps.slice(2);
    const rates=matched?steps.slice(2).map((n,j)=>100*n/steps[j+1]):[];
    const heading=selected?groups.find(g=>g.key===selected).name:'كل القنوات';
    host.innerHTML='<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div>'+`<div class="ff-sources"><div class="ff-column-heading"><b>القنوات</b><small>90 يومًا</small></div>${groups.map(g=>`<button class="ff-source" type="button" data-source="${g.key}" aria-pressed="${selected===g.key}" aria-controls="ff-channel-detail" style="--source-color:${g.color}"><span class="ff-source-title">${g.brand?logo(g.brand):neutral}<b>${esc(g.name)}</b></span><span class="ff-source-stats"><span><b>${fmt(g.native_landing_sessions)}</b> جلسة</span><span><b>${fmt(g.purchases)}</b> شراء</span></span></button>`).join('')}</div><div class="ff-landings"><div class="ff-column-heading"><b>أول صفحة دخلها الزائر</b></div><p class="ff-entry-scope">${esc(heading)} · 90 يومًا</p>${entryTypes.map(e=>`<article class="ff-landing" data-landing="${e.key}"><h4>${e.name}</h4><span><b>${fmt(entryCount(e.key))}</b> جلسة بدأت هنا</span></article>`).join('')}<small class="ff-entry-other">بدائل للدخول؛ ليست خطوات يمر بها الجميع بالترتيب.</small></div><div class="ff-stages"><div class="ff-column-heading"><b>شراء المتجر كله</b><small>${reach?'90':'60'} يومًا</small></div>${stageCounts.map((n,j)=>`<article class="ff-node" data-index="${j}"><span class="ff-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[j]}</svg></span><h4>${['أضافوا للسلة','بدأوا إتمام الطلب','سجّلوا شراءً'][j]}</h4><strong>${fmt(n)}</strong><span class="ff-unit">مستخدمًا · ${reach?'90':'60'} يومًا</span><span class="ff-rate ${matched?'':'unknown'}">${matched?`<b>${fmt(rates[j],2)}%</b><span>${j===0?'من مشاهدي المنتج بالتسلسل':'من الخطوة السابقة'}</span>`:'<b>الانتقال غير موثّق</b>'}</span></article>`).join('')}</div>`;
    host.querySelectorAll('[data-source]').forEach(card=>card.addEventListener('click',()=>{const key=card.dataset.source;selected=selected===key?null:key;renderFunnelVisual(...modeArgs);host.querySelector(`[data-source="${key}"]`)?.focus({preventScroll:true})}));
    $('ff-rate-summary').hidden=matched;detail();connect();
  };
  function rect(el,origin){const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,x:(r.left+r.right)/2-origin.left,y:(r.top+r.bottom)/2-origin.top}}
  function connect(){
    if(!host.querySelector('.ff-stages'))return;
    const sources=host.querySelector('.ff-sources'),stages=host.querySelector('.ff-stages'),landings=host.querySelector('.ff-landings');
    host.style.height=wide.matches?Math.max(480,sources.offsetHeight+36,stages.offsetHeight+36,landings.offsetHeight+36)+'px':'auto';
    const origin=host.getBoundingClientRect(),nodes=[...host.querySelectorAll('.ff-node')],edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers');
    edgeSvg.setAttribute('viewBox',`0 0 ${origin.width} ${origin.height}`);
    const connectRects=(a,b)=>wide.matches?`M ${a.left-2} ${a.y} C ${a.left-45} ${a.y},${b.right+45} ${b.y},${b.right+2} ${b.y}`:`M ${a.left} ${a.y} C 9 ${a.y},9 ${b.top-18},${b.x} ${b.top-2}`;
    const observed=[];
    for(const g of groups){const source=rect(host.querySelector(`[data-source="${g.key}"]`),origin);for(const e of entryTypes){const n=count(g,e.key);if(!n)continue;const target=rect(host.querySelector(`[data-landing="${e.key}"]`),origin);observed.push({key:g.key,entry:e.key,count:n,color:g.color,d:connectRects(source,target)})}}
    const cart=rect(nodes[0],origin);
    const possible=entryTypes.filter(e=>e.key!=='other').map(e=>({key:e.key,d:connectRects(rect(host.querySelector(`[data-landing="${e.key}"]`),origin),cart)}));
    const sequence=nodes.slice(0,-1).map((node,j)=>{const a=rect(node,origin),b=rect(nodes[j+1],origin);return {d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,arrow:`M ${b.x-4} ${b.top-8} L ${b.x} ${b.top-2} L ${b.x+4} ${b.top-8}`}});
    edgeSvg.innerHTML=observed.map(p=>`<path class="ff-line observed-entry" data-platform="${p.key}" data-entry="${p.entry}" data-entry-sessions="${p.count}" style="--edge-color:${p.color}" d="${p.d}"/>`).join('')+possible.map(p=>`<path class="ff-line possible-entry" data-cart-from="${p.key}" style="--edge-color:#9c987e" d="${p.d}"/>`).join('')+sequence.map(p=>`<path class="ff-line stage-line ${matched?'':'unknown'}" style="--edge-color:#807b61" d="${p.d}"/><path class="ff-arrow" style="--edge-color:#807b61" d="${p.arrow}"/>`).join('');
    // Source-colored icons stop at the verified arrival. No unknown journey is animated.
    travelers.innerHTML=observed.map((p,i)=>`<span class="motion-person" data-platform="${p.key}" data-entry="${p.entry}" style="--edge-color:${p.color};offset-path:path('${p.d}');--duration:12s;--delay:${-i*.55}s">${person}</span>`).join('')+(matched?sequence.map((p,i)=>`<span class="motion-person ff-picked" data-platform="journey" style="--edge-color:#807b61;offset-path:path('${p.d}');--duration:4s;--delay:${-i*1.4}s">${person}</span>`).join(''):'');
    select();sync();
  }
  function select(){host.classList.toggle('has-selection',!!selected);host.querySelectorAll('[data-platform]').forEach(e=>e.classList.toggle('ff-picked',e.dataset.platform===selected||e.dataset.platform==='journey'))}
  function detail(){
    const g=groups.find(g=>g.key===selected);
    if(!g){$('ff-channel-detail').innerHTML='<p><b>اختر قناة لترى أين تبدأ زياراتها.</b> تتغيّر أعداد صفحات الدخول للقناة المختارة. الأيقونات الملوّنة تتوقف عند صفحة البداية؛ لا نعرف أيًّا منها أكمل إلى السلة أو الشراء.</p>';return;}
    $('ff-channel-detail').innerHTML=`<p><b>${g.brand?`<span class="inline-brand">${logo(g.brand)}${esc(g.name)}</span>`:esc(g.name)}</b> · تقرير الدخول: ${fmt(g.native_landing_sessions)} جلسة · 90 يومًا</p><p>الرئيسية ${fmt(count(g,'home'))}؛ الأقسام ${fmt(count(g,'collection'))}؛ المنتجات ${fmt(count(g,'product'))}؛ أخرى أو غير محددة ${fmt(count(g,'other'))}.</p><p>مجموع صفوف الدخول ${fmt(g.mapped_rows_sessions)}، والإجمالي الذي يعرضه التقرير ${fmt(g.native_landing_sessions)}، مقابل ${fmt(g.native_acquisition_sessions)} في تقرير المصادر الأصلي. لا نوزّع الفارق على صفحة تخمينية.</p><button id="ff-clear-channel" class="small-button" type="button">اعرض كل القنوات</button>`;
    $('ff-clear-channel').addEventListener('click',()=>{const old=selected;selected=null;renderFunnelVisual(...modeArgs);host.querySelector(`[data-source="${old}"]`)?.focus({preventScroll:true})});
  }
  function sync(){host.classList.toggle('motion-running',onScreen&&!reduced.matches);host.classList.toggle('motion-paused',paused||!onScreen);$('pause-funnel').setAttribute('aria-pressed',String(paused));$('pause-funnel').textContent=paused?'شغّل الحركة':'أوقف الحركة';$('pause-funnel').disabled=$('replay-funnel').disabled=reduced.matches;$('ff-motion-state').textContent=reduced.matches?'الحركة مخففة حسب إعدادات الجهاز.':paused?'الحركة متوقفة؛ كل الأرقام ظاهرة.':'حركة القناة تنتهي عند صفحة الدخول المثبتة؛ الخطوط المتقطّعة للسلة مسارات ممكنة غير مطابقة.'}
  $('pause-funnel').addEventListener('click',()=>{paused=!paused;sync()});$('replay-funnel').addEventListener('click',()=>{paused=false;host.classList.remove('motion-running');requestAnimationFrame(()=>requestAnimationFrame(connect))});
  $('ff-show-rates').addEventListener('click',()=>{$('funnel-mode').value='closed';funnel();$('channel-map').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'})});
  const updateVisibility=()=>{const r=host.getBoundingClientRect();onScreen=r.bottom>0&&r.top<innerHeight;sync()};new IntersectionObserver(updateVisibility,{threshold:.1}).observe(host);addEventListener('scroll',updateVisibility,{passive:true});
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(connect)};new ResizeObserver(schedule).observe(host);addEventListener('resize',schedule,{passive:true});wide.addEventListener('change',schedule);reduced.addEventListener('change',sync);document.fonts.ready.then(schedule);
  $('ff-entry-reconciliation').innerHTML=groups.map(g=>`<tr><th>${esc(g.name)}</th><td>${fmt(g.native_acquisition_sessions)}</td><td>${fmt(g.native_landing_sessions)}</td><td>${fmt(g.mapped_rows_sessions)}</td></tr>`).join('');
  const initialChannel=new URLSearchParams(location.search).get('channel');if(groups.some(g=>g.key===initialChannel))selected=initialChannel;
  const initialMode=new URLSearchParams(location.search).get('funnel');if(['closed','open','reach_90'].includes(initialMode))$('funnel-mode').value=initialMode;
  funnel();requestAnimationFrame(updateVisibility);for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
})();
