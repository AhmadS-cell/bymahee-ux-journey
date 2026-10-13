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
  $('ff-entry-evidence').innerHTML=`<span class="inline-brand">${logo('google')}<b>Google Organic ← صفحة المنتج مباشرة</b></span><span><b>${fmt(googleProductEntries)}</b> جلسة بدأت بصفحات منتجات من أصل 593 · 90 يومًا. بقية 443 جلسة بدأت بصفحات أخرى أو غير محددة.</span><small>السهم يوضح صفحة الوصول؛ لا يلغي بدء الجلسة ولا يربط هؤلاء الأشخاص بعدادات الفانل. لم نثبت مسار المنتج لكل منصة أو مصدر واتساب مستقل.</small><a href="#organic">راجع صفحات الوصول من البحث ←</a>`;
  $('ff-store-summary').innerHTML=`<span>إجمالي المتجر · 90 يومًا</span><span><b>${fmt(T.sessions)}</b> جلسة</span><span><b>${fmt(T.purchases)}</b> شراء مسجّل</span><span><b>${fmt(T.purchase_revenue,2)}</b> ريال إيراد</span><span>متوسط قيمة الشراء <b>${fmt(T.aov,2)}</b> ريال</span>`;
  renderFunnelVisual=(steps,labels,open,reach=false)=>{
    matched=!reach&&!open;
    const numbers=reach?[T.sessions,...steps.slice(1)]:steps,names=['بدء زيارة','صفحة المنتج','السلة','إتمام الطلب','الشراء'];
    host.innerHTML='<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div>'+`<div class="ff-sources"><div class="ff-column-heading"><b>مصادر الزيارات</b><small>90 يومًا</small></div>${groups.map(g=>`<button class="ff-source" type="button" data-source="${esc(g.key)}" aria-pressed="${selected===g.key}" aria-controls="ff-channel-detail" style="--source-color:${g.color}"><span class="ff-source-title">${g.brand?logo(g.brand):neutral}<b>${esc(g.name)}</b></span><span class="ff-source-stats"><span><b>${fmt(g.sessions)}</b> جلسة</span><span><b>${fmt(g.purchases)}</b> شراء</span></span>${g.key==='google'?`<span class="ff-source-subtitle">Organic · ${fmt(googleProductEntries)} للمنتجات مباشرة</span>`:''}</button>`).join('')}</div><div class="ff-stages"><div class="ff-column-heading"><b>مراحل الرحلة</b><small>${reach?'90':'60'} يومًا · ${matched?'تسلسل مسجّل':'ربط ناقص'}</small></div>${numbers.map((count,i)=>`<article class="ff-node" data-index="${i}"><span class="ff-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[i]}</svg></span><h4><small class="ff-step-index">${i+1}</small>${names[i]}</h4><strong>${fmt(count)}</strong><span class="ff-unit">${reach&&i===0?'جلسة':i===1?'مستخدم شاهد منتجًا':'مستخدمًا'} · ${reach?'90':'60'} يومًا</span><span class="ff-rate ${i&&!matched?'unknown':''}">${i?matched?`<b>${fmt(100*steps[i]/steps[i-1],2)}%</b><span>من المرحلة السابقة</span>`:'<b>الانتقال غير موثّق</b>':`<b>بداية الرحلة</b><span>${reach?'كل الجلسات':'جزء من الفترة'}</span>`}</span></article>`).join('')}</div>`;
    host.querySelectorAll('[data-source]').forEach(card=>card.addEventListener('click',()=>{selected=selected===card.dataset.source?null:card.dataset.source;select();detail()}));
    $('ff-rate-summary').hidden=matched;
    detail();connect();
  };
  function rect(el,origin){const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,x:(r.left+r.right)/2-origin.left,y:(r.top+r.bottom)/2-origin.top}}
  function connect(){
    if(!host.querySelector('.ff-stages'))return;
    const sources=host.querySelector('.ff-sources'),stages=host.querySelector('.ff-stages');
    host.style.height=vertical.matches||wide.matches?'auto':Math.max(510,sources.offsetHeight+28,stages.offsetHeight+28)+'px';
    const origin=host.getBoundingClientRect(),nodes=[...host.querySelectorAll('.ff-node')],edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers'),first=rect(nodes[0],origin);
    edgeSvg.setAttribute('viewBox',`0 0 ${origin.width} ${origin.height}`);
    // Only Google's product landing split is known across all product pages.
    // Other sources reach "start visit", which can be any landing page.
    const specs=groups.flatMap(g=>g.key==='google'?[{g,to:0,count:g.sessions-googleProductEntries},{g,to:1,count:googleProductEntries,directProduct:true}]:[{g,to:0,count:g.sessions}]);
    const sourcePaths=specs.map(spec=>{
      const g=spec.g,source=rect(host.querySelector(`[data-source="${g.key}"]`),origin),target=rect(nodes[spec.to],origin);
      let d;
      if(wide.matches){const x=spec.directProduct?source.x-9:source.x+3;d=`M ${x} ${source.bottom+2} C ${x} ${source.bottom+35},${target.x} ${target.top-35},${target.x} ${target.top-2} L ${target.x} ${target.y}`;}
      else if(vertical.matches)d=`M ${source.left} ${source.y} C 9 ${source.y},9 ${target.top-18},${target.x} ${target.top-2} L ${target.x} ${target.y}`;
      else d=`M ${source.left-2} ${source.y} C ${source.left-45} ${source.y},${target.right+48} ${target.y},${target.right+2} ${target.y} L ${target.x} ${target.y}`;
      return {...spec,key:g.key,color:g.color,d};
    });
    const stagePaths=nodes.slice(0,-1).map((node,i)=>{const a=rect(node,origin),b=rect(nodes[i+1],origin);return {d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,arrow:wide.matches?`M ${b.right+8} ${b.y-4} L ${b.right+2} ${b.y} L ${b.right+8} ${b.y+4}`:`M ${b.x-4} ${b.top-8} L ${b.x} ${b.top-2} L ${b.x+4} ${b.top-8}`}});
    edgeSvg.innerHTML=sourcePaths.map(p=>`<path class="ff-line ${p.directProduct?'product-entry-line':''}" data-platform="${p.key}" data-entry="${p.directProduct?'product':'visit'}" data-entry-sessions="${p.count}" style="--edge-color:${p.color}" d="${p.d}"/>`).join('')+stagePaths.map(p=>`<path class="ff-line stage-line ${matched?'':'unknown'}" style="--edge-color:#807b61" d="${p.d}"/><path class="ff-arrow" style="--edge-color:#807b61" d="${p.arrow}"/>`).join('');
    // One continuous route per icon; the same icon passes through successive cards.
    // Cards conceal the route while an icon is inside a stage.
    const complete=p=>p.d+nodes.slice(p.to+1).map(node=>{const r=rect(node,origin);return ` L ${r.x} ${r.y}`}).join('');
    travelers.innerHTML=sourcePaths.map((p,i)=>[0,1].map(k=>`<span class="motion-person" data-platform="${p.key}" data-entry="${p.directProduct?'product':'visit'}" style="--edge-color:${p.color};offset-path:path('${complete(p)}');--duration:18s;--delay:${-(i*1.5+k*9)}s">${person}</span>`).join('')).join('');
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
