// Channel colors are an illustrative legend, never a channel-by-step cohort join.
let renderFunnelVisual;
(()=>{
  const host=$('funnel-visual'),groups=D.channel_motion.groups;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),vertical=matchMedia('(max-width:800px)');
  const icons=['<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 8h18m-12 5h6m-3-3v6"/>','<path d="m5 7 7-4 7 4v11l-7 3-7-3Z"/><path d="m5 7 7 4 7-4m-7 4v10"/>','<path d="M2 4h3l3 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/>','<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="m9 11 2 2 4-4"/>'];
  const person='<svg viewBox="0 0 18 23" aria-hidden="true"><circle cx="9" cy="4" r="3" fill="currentColor" stroke="white" stroke-width="1"/><path d="M5 9h8l1 7h-3v6H7v-6H4Z" fill="currentColor" stroke="white" stroke-width=".7"/></svg>';
  const neutral='<span class="ff-neutral" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/></svg></span>';
  let frame=0,onScreen=false,paused=false,matched=false,selected=null;
  $('ff-store-summary').innerHTML=`<span>إجمالي المتجر · 90 يومًا</span><span><b>${fmt(T.sessions)}</b> جلسة</span><span><b>${fmt(T.purchases)}</b> شراء مسجّل</span><span><b>${fmt(T.purchase_revenue,2)}</b> ريال إيراد</span><span>متوسط قيمة الشراء <b>${fmt(T.aov,2)}</b> ريال</span>`;
  renderFunnelVisual=(steps,labels,open,reach=false)=>{
    matched=!reach&&!open;
    const numbers=reach?[T.sessions,...steps.slice(1)]:steps,names=['زيارة المتجر','مشاهدة المنتج','السلة','بدء إتمام الطلب','الشراء'];
    host.innerHTML='<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div>'+`<div class="ff-sources"><div class="ff-column-heading"><b>مصادر الزيارات</b><small>90 يومًا</small></div>${groups.map(g=>`<button class="ff-source" type="button" data-source="${esc(g.key)}" aria-pressed="${selected===g.key}" aria-controls="ff-channel-detail" style="--source-color:${g.color}"><span class="ff-source-title">${g.brand?logo(g.brand):neutral}<b>${esc(g.name)}</b></span><span class="ff-source-stats"><span><b>${fmt(g.sessions)}</b> جلسة</span><span><b>${fmt(g.purchases)}</b> شراء</span></span>${g.key==='google'?'<span class="ff-source-subtitle">Organic · بحث غير مدفوع</span>':''}</button>`).join('')}</div><div class="ff-stages"><div class="ff-column-heading"><b>مراحل الرحلة</b><small>${reach?'90':'60'} يومًا · ${matched?'تسلسل مسجّل':'ربط ناقص'}</small></div>${numbers.map((count,i)=>`<article class="ff-node" data-index="${i}"><span class="ff-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[i]}</svg></span><h4>${names[i]}</h4><strong>${fmt(count)}</strong><span class="ff-unit">${reach&&i===0?'جلسة':'مستخدمًا'} · ${reach?'90':'60'} يومًا</span><span class="ff-rate ${i&&!matched?'unknown':''}">${i?matched?`<b>${fmt(100*steps[i]/steps[i-1],2)}%</b><span>من المرحلة السابقة</span>`:'<b>الانتقال غير موثّق</b>':`<b>بداية الرحلة</b><span>${reach?'كل الجلسات':'جزء من الفترة'}</span>`}</span></article>`).join('')}</div>`;
    host.querySelectorAll('[data-source]').forEach(card=>card.addEventListener('click',()=>{selected=selected===card.dataset.source?null:card.dataset.source;select();detail()}));
    $('ff-rate-summary').hidden=matched;
    detail();connect();
  };
  function rect(el,origin){const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,x:(r.left+r.right)/2-origin.left,y:(r.top+r.bottom)/2-origin.top}}
  function connect(){
    if(!host.querySelector('.ff-stages'))return;
    const sources=host.querySelector('.ff-sources'),stages=host.querySelector('.ff-stages');
    host.style.height=vertical.matches?'auto':Math.max(650,sources.offsetHeight+36,stages.offsetHeight+36)+'px';
    const origin=host.getBoundingClientRect(),nodes=[...host.querySelectorAll('.ff-node')],edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers'),first=rect(nodes[0],origin);
    edgeSvg.setAttribute('viewBox',`0 0 ${origin.width} ${origin.height}`);
    const sourcePaths=groups.map(g=>{
      const source=rect(host.querySelector(`[data-source="${g.key}"]`),origin);
      const d=vertical.matches?`M ${source.left} ${source.y} C 10 ${source.y},10 ${first.top-22},${first.x} ${first.top-3}`:`M ${source.left-2} ${source.y} C ${source.left-55} ${source.y},${first.right+65} ${first.y},${first.right+3} ${first.y}`;
      return {key:g.key,color:g.color,d};
    });
    const stagePaths=nodes.slice(0,-1).map((node,i)=>{const a=rect(node,origin),b=rect(nodes[i+1],origin),x=vertical.matches?10:a.left-22;return {d:`M ${a.x} ${a.bottom+3} C ${x} ${a.bottom+9},${x} ${b.top-9},${b.x} ${b.top-3}`,arrow:`M ${b.x-4} ${b.top-9} L ${b.x} ${b.top-3} L ${b.x+4} ${b.top-9}`}});
    edgeSvg.innerHTML=sourcePaths.map(p=>`<path class="ff-line" data-platform="${p.key}" style="--edge-color:${p.color}" d="${p.d}"/>`).join('')+stagePaths.map(p=>`<path class="ff-line stage-line ${matched?'':'unknown'}" style="--edge-color:#807b61" d="${p.d}"/><path class="ff-arrow" style="--edge-color:#807b61" d="${p.arrow}"/>`).join('');
    const traveler=(p,key,color,delay,duration)=>`<span class="motion-person" data-platform="${key}" style="--edge-color:${color};offset-path:path('${p}');--duration:${duration}s;--delay:${delay}s">${person}</span>`;
    travelers.innerHTML=sourcePaths.map((p,i)=>traveler(p.d,p.key,p.color,-i*.72,6.2)).join('')+stagePaths.map((p,i)=>groups.map((g,j)=>traveler(p.d,g.key,g.color,-(j*.55+i*.28),3.6)).join('')).join('');
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
  new ResizeObserver(schedule).observe(host);addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',sync);vertical.addEventListener('change',schedule);document.fonts.ready.then(schedule);
  const initialMode=new URLSearchParams(location.search).get('funnel');if(['closed','open','reach_90'].includes(initialMode))$('funnel-mode').value=initialMode;
  funnel();requestAnimationFrame(updateVisibility);for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
})();
