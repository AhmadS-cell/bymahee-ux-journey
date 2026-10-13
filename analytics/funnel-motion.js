// Channel colors are an illustrative legend, never a channel-by-step cohort join.
let renderFunnelVisual;
(()=>{
  const host=$('funnel-visual'),groups=D.channel_motion.groups;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),vertical=matchMedia('(max-width:800px)'),wide=matchMedia('(min-width:1201px)');
  const googleProductEntries=D.organic_search.landing_groups.find(g=>g.name==='صفحات المنتجات').sessions;
  const icons=['<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 8h18m-12 5h6m-3-3v6"/>','<path d="m5 7 7-4 7 4v11l-7 3-7-3Z"/><path d="m5 7 7 4 7-4m-7 4v10"/>','<path d="M2 4h3l3 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/>','<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="m9 11 2 2 4-4"/>'];
  const person='<svg viewBox="0 0 18 23" aria-hidden="true"><circle cx="9" cy="4" r="3" fill="currentColor" stroke="white" stroke-width="1"/><path d="M5 9h8l1 7h-3v6H7v-6H4Z" fill="currentColor" stroke="white" stroke-width=".7"/></svg>';
  const neutral='<span class="ff-neutral" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/></svg></span>';
  let frame=0,onScreen=false,paused=false,matched=false,selected=null;
  $('ff-entry-evidence').innerHTML=`<span class="inline-brand">${logo('google')}<b>Google Organic ← صفحة المنتج مباشرة</b></span><span><b>${fmt(googleProductEntries)}</b> جلسة بدأت بصفحات منتجات من أصل 593 · 90 يومًا. بقية 443: 268 للرئيسية، و101 للأقسام، و74 لصفحات أخرى أو غير محددة.</span><small>السهم يوضح صفحة الوصول؛ لا يلغي بدء الجلسة ولا يربط هؤلاء الأشخاص بعدادات الفانل. لم نثبت مسار المنتج لكل منصة أو مصدر واتساب مستقل.</small><a href="#organic">راجع صفحات الوصول من البحث ←</a>`;
  $('ff-store-summary').innerHTML=`<span>إجمالي المتجر · 90 يومًا</span><span><b>${fmt(T.sessions)}</b> جلسة</span><span><b>${fmt(T.purchases)}</b> شراء مسجّل</span><span><b>${fmt(T.purchase_revenue,2)}</b> ريال إيراد</span><span>متوسط قيمة الشراء <b>${fmt(T.aov,2)}</b> ريال</span>`;
  renderFunnelVisual=(steps,labels,open,reach=false)=>{
    matched=!reach&&!open;
    const numbers=reach?[T.sessions,...steps.slice(1)]:steps,names=['بدء زيارة','مشاهدة المنتج','السلة','إتمام الطلب','الشراء'];
    const stage=(count,i)=>`<article class="ff-node" data-index="${i}"><span class="ff-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[i]}</svg></span><h4><small class="ff-step-index">${i+1}</small>${i===0?'المتجر · بدء زيارة':names[i]}</h4><strong>${fmt(count)}</strong><span class="ff-unit">${reach&&i===0?'جلسة':i===1?'مستخدم شاهد منتجًا':'مستخدمًا'} · ${reach?'90':'60'} يومًا</span><span class="ff-rate ${i&&!matched?'unknown':''}">${i?matched?`<b>${fmt(100*steps[i]/steps[i-1],2)}%</b><span>${i===1?'من بدء الزيارة':'من الخطوة السابقة'}</span>`:'<b>الانتقال غير موثّق</b>':`<b>بداية الزيارة</b><span>أي صفحة دخول</span>`}</span></article>`;
    host.innerHTML='<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div>'+`<div class="ff-sources"><div class="ff-column-heading"><b>القنوات</b><small>90 يومًا</small></div>${groups.map(g=>`<button class="ff-source" type="button" data-source="${esc(g.key)}" aria-pressed="${selected===g.key}" aria-controls="ff-channel-detail" style="--source-color:${g.color}"><span class="ff-source-title">${g.brand?logo(g.brand):neutral}<b>${esc(g.name)}</b></span><span class="ff-source-stats"><span><b>${fmt(g.sessions)}</b> جلسة</span><span><b>${fmt(g.purchases)}</b> شراء</span></span></button>`).join('')}</div><div class="ff-visit"><div class="ff-column-heading"><b>دخول الموقع</b></div>${stage(numbers[0],0)}</div><div class="ff-landings"><div class="ff-column-heading"><b>صفحة الدخول</b><small>بدائل</small></div><p class="ff-entry-scope">أرقام البحث فقط · 90 يومًا</p>${[{key:'home',name:'الصفحة الرئيسية',count:D.organic_search.landing_groups.find(r=>r.name==='الصفحة الرئيسية').sessions},{key:'collection',name:'قسم / Collection',count:D.organic_search.landing_groups.find(r=>r.name==='صفحات الأقسام').sessions},{key:'product',name:'صفحة المنتج',count:googleProductEntries}].map(e=>`<article class="ff-landing" data-landing="${e.key}"><small>أو</small><h4>${e.name}</h4><span>${logo('google')}<b>${fmt(e.count)}</b> جلسة من البحث</span></article>`).join('')}<small class="ff-entry-other">هناك صفحات أخرى أيضًا. لا نفترض المرور بكل هذه الصفحات.</small></div><div class="ff-stages"><div class="ff-column-heading"><b>خطوات الشراء</b><small>${reach?'90':'60'} يومًا</small></div>${numbers.slice(1).map((count,j)=>stage(count,j+1)).join('')}</div>`;
    host.querySelectorAll('[data-source]').forEach(card=>card.addEventListener('click',()=>{selected=selected===card.dataset.source?null:card.dataset.source;select();detail()}));
    $('ff-rate-summary').hidden=matched;
    detail();connect();
  };
  function rect(el,origin){const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,x:(r.left+r.right)/2-origin.left,y:(r.top+r.bottom)/2-origin.top}}
  function connect(){
    if(!host.querySelector('.ff-stages'))return;
    const sources=host.querySelector('.ff-sources'),stages=host.querySelector('.ff-stages');
    host.style.height=wide.matches?Math.max(480,sources.offsetHeight+36,stages.offsetHeight+36)+'px':'auto';
    const origin=host.getBoundingClientRect(),nodes=[...host.querySelectorAll('.ff-node')],edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers'),first=rect(nodes[0],origin);
    edgeSvg.setAttribute('viewBox',`0 0 ${origin.width} ${origin.height}`);
    const landingRows=D.organic_search.landing_groups;
    const homes=landingRows.find(r=>r.name==='الصفحة الرئيسية').sessions,collections=landingRows.find(r=>r.name==='صفحات الأقسام').sessions;
    const google=groups.find(g=>g.key==='google');
    const specs=groups.flatMap(g=>g.key==='google'?[{g,landing:'home',count:homes},{g,landing:'collection',count:collections},{g,landing:'product',count:googleProductEntries},{g,count:g.sessions-homes-collections-googleProductEntries}]:[{g,count:g.sessions}]);
    const product=rect(nodes[1],origin);
    const connectRects=(a,b)=>wide.matches?`M ${a.left-2} ${a.y} C ${a.left-28} ${a.y},${b.right+28} ${b.y},${b.right+2} ${b.y} L ${b.x} ${b.y}`:`M ${a.left} ${a.y} C 10 ${a.y},10 ${b.top-18},${b.x} ${b.top-2} L ${b.x} ${b.y}`;
    const sourcePaths=specs.map(spec=>{
      const source=rect(host.querySelector(`[data-source="${spec.g.key}"]`),origin),destination=spec.landing?rect(host.querySelector(`[data-landing="${spec.landing}"]`),origin):first;
      const d=connectRects(source,destination);
      // The subsequent continuation is illustrative; it is not a source/cohort join.
      const next=wide.matches?` L ${destination.left-14} ${destination.y} L ${product.right+12} ${product.y} L ${product.x} ${product.y}`:` L 12 ${destination.bottom+8} L 12 ${product.top-12} L ${product.x} ${product.top-2} L ${product.x} ${product.y}`;
      return {...spec,key:spec.g.key,color:spec.g.color,d,continued:d+next};
    });
    const entryPaths=[...host.querySelectorAll('.ff-landing')].map(el=>{const r=rect(el,origin);return {d:connectRects(first,r),next:connectRects(r,product)}});
    const stagePaths=nodes.slice(1,-1).map((node,j)=>{const a=rect(node,origin),b=rect(nodes[j+2],origin);return {d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,arrow:`M ${b.x-4} ${b.top-8} L ${b.x} ${b.top-2} L ${b.x+4} ${b.top-8}`}});
    edgeSvg.innerHTML=entryPaths.map(p=>`<path class="ff-line possible-entry" style="--edge-color:#bbb7a8" d="${p.d}"/><path class="ff-line possible-entry" style="--edge-color:#bbb7a8" d="${p.next}"/>`).join('')+sourcePaths.map(p=>`<path class="ff-line ${p.landing==='product'?'product-entry-line':''}" data-platform="${p.key}" data-entry="${p.landing||'other'}" data-entry-sessions="${p.count}" style="--edge-color:${p.color}" d="${p.d}"/>`).join('')+stagePaths.map(p=>`<path class="ff-line stage-line" style="--edge-color:#807b61" d="${p.d}"/><path class="ff-arrow" style="--edge-color:#807b61" d="${p.arrow}"/>`).join('');
    const complete=p=>p.continued+nodes.slice(2).map(node=>{const r=rect(node,origin);return ` L ${r.x} ${r.y}`}).join('');
    travelers.innerHTML=sourcePaths.map((p,i)=>`<span class="motion-person" data-platform="${p.key}" data-entry="${p.landing||'other'}" style="--edge-color:${p.color};offset-path:path('${complete(p)}');--duration:19s;--delay:${-i*2}s">${person}</span>`).join('');
    select();sync();
  }
  function select(){
    host.classList.toggle('has-selection',!!selected);
    host.querySelectorAll('[data-source]').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.source===selected)));
    host.querySelectorAll('[data-platform]').forEach(e=>e.classList.toggle('ff-picked',e.dataset.platform===selected));
  }
  function detail(){
    const g=groups.find(g=>g.key===selected);
    if(!g){$('ff-channel-detail').innerHTML='<p><b>اختر قناة لتشاهد لونها وأرقامها.</b> المصادر تعرض جلسات وشراء الـ90 يومًا. الأيقونات الملوّنة مفتاح للمنصات؛ ليست رحلات أفراد طابقناها داخل الفانل.</p>';return;}
    const rows=g.source_names.map(key=>D.sources.find(r=>r.name===key));
    $('ff-channel-detail').innerHTML=`<p><b>${g.brand?`<span class="inline-brand">${logo(g.brand)}${esc(g.name)}</span>`:esc(g.name)}</b> · ${fmt(g.sessions)} جلسة · ${fmt(g.purchases)} شراء · ${fmt(g.revenue,2)} ريال · 90 يومًا</p><p>${esc(g.detail)}</p><p>${rows.map(r=>`<bdi>${esc(r.name)}</bdi>: ${fmt(r.session_purchase_rate,2)}% من الجلسات تضمنت شراءً${r.sessions<200?' · عينة صغيرة':''}`).join('؛ ')}</p><p>لون القناة في باقي المسار توضيحي؛ لا توجد لدينا أعداد مراحل الفانل الخاصة بهذه القناة.</p><button id="ff-clear-channel" class="small-button" type="button">اعرض كل القنوات</button>`;
    $('ff-clear-channel').addEventListener('click',()=>{const old=selected;selected=null;select();detail();host.querySelector(`[data-source="${old}"]`)?.focus()});
  }
  function sync(){
    host.classList.toggle('motion-running',onScreen&&!reduced.matches);host.classList.toggle('motion-paused',paused||!onScreen);
    $('pause-funnel').setAttribute('aria-pressed',String(paused));$('pause-funnel').textContent=paused?'شغّل الحركة':'أوقف الحركة';
    $('pause-funnel').disabled=$('replay-funnel').disabled=reduced.matches;
    $('ff-motion-state').textContent=reduced.matches?'الحركة مخففة حسب إعدادات جهازك؛ الأرقام ظاهرة.':paused?'الحركة متوقفة؛ الأرقام ثابتة.':'الحركة والألوان توضيحية، وتتوقف خارج الشاشة؛ لا تثبت مصدر كل مستخدم داخل الرحلة.';
  }
  $('pause-funnel').addEventListener('click',()=>{paused=!paused;sync()});
  $('replay-funnel').addEventListener('click',()=>{paused=false;host.classList.remove('motion-running');requestAnimationFrame(()=>requestAnimationFrame(connect))});
  $('ff-show-rates').addEventListener('click',()=>{$('funnel-mode').value='closed';funnel();$('channel-map').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'})});
  const updateVisibility=()=>{const r=host.getBoundingClientRect();onScreen=r.bottom>0&&r.top<innerHeight;sync()};
  new IntersectionObserver(updateVisibility,{threshold:.1}).observe(host);
  addEventListener('scroll',updateVisibility,{passive:true});
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(connect)};
  new ResizeObserver(schedule).observe(host);addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',sync);vertical.addEventListener('change',schedule);wide.addEventListener('change',schedule);document.fonts.ready.then(schedule);
  const initialMode=new URLSearchParams(location.search).get('funnel');if(['closed','open','reach_90'].includes(initialMode))$('funnel-mode').value=initialMode;
  funnel();requestAnimationFrame(updateVisibility);for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
})();
