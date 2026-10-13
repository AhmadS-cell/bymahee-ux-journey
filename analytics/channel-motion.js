(() => {
  'use strict';
  const host=$('channel-flow'),data=D.channel_motion;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen=matchMedia('(max-width: 800px)');
  let selected=null,userPaused=false,onScreen=false,frame=0;
  const symbol=(kind)=>`<span class="motion-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${kind==='direct'?'<path d="M12 3l8 8-8 10-8-10 8-8Z"/><path d="M9 13l6-4-2 6-4-2Z"/>':'<path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z"/>'}</svg></span>`;
  const receipt='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>';
  const person='<svg viewBox="0 0 18 23" aria-hidden="true"><circle cx="9" cy="5" r="3.1" fill="currentColor" stroke="white" stroke-width="1.2"/><path d="M4 13a5 5 0 0110 0v4H4v-4Z" fill="currentColor" stroke="white" stroke-width="1.2"/><path d="M7 17v4m4-4v4" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>';
  host.innerHTML=`<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div><div class="motion-sources">${data.groups.map(g=>`<button type="button" class="motion-source" data-flow-source="${esc(g.key)}" style="--source-color:${g.color}" aria-pressed="false" aria-controls="motion-detail"><span class="motion-source-heading">${g.brand?logo(g.brand):symbol(g.key)}<span><b>${esc(g.name)}</b><small>${esc(g.subtitle)}</small></span></span><span class="motion-source-metrics"><span><b>${fmt(g.sessions)}</b>جلسة</span><span><b>${fmt(g.purchases)}</b>شراء</span></span><span class="motion-source-revenue">${fmt(g.revenue,2)} ريال إيراد مسجّل</span></button>`).join('')}</div><article class="motion-hub"><img src="assets/mahee-logo.webp" alt="MAHEE" width="74" height="41"><h4>إجمالي زيارات المتجر</h4><strong>${fmt(T.sessions)}</strong><small>جلسة · قد يزور الشخص أكثر من مرة</small><small>صفوف المصادر: ${fmt(data.source_sessions)} جلسة</small></article><article class="motion-order"><span class="order-icon">${receipt}</span><h4>إجمالي الشراء المسجّل</h4><strong>${fmt(T.purchases)}</strong><small>عملية شراء من ${fmt(T.purchasers)} مستخدمًا</small><p class="order-revenue">${fmt(T.purchase_revenue,2)} ريال</p><small class="order-aov">متوسط قيمة الشراء <b>${fmt(T.aov,2)} ريال</b></small></article>`;
  const edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers');
  const hub=host.querySelector('.motion-hub'),order=host.querySelector('.motion-order'),sources=host.querySelector('.motion-sources');
  const cards=[...host.querySelectorAll('[data-flow-source]')];
  function relativeRect(el,origin){const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,x:(r.left+r.right)/2-origin.left,y:(r.top+r.bottom)/2-origin.top}}
  function applySelection(){
    host.classList.toggle('has-selection',!!selected);
    cards.forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.flowSource===selected)));
    host.querySelectorAll('[data-edge]').forEach(el=>el.classList.toggle('edge-picked',el.dataset.edge===selected||el.dataset.edge==='purchase'));
  }
  function connect(){
    if(smallScreen.matches)host.style.height='auto';else host.style.height=Math.max(700,sources.offsetHeight+36)+'px';
    const origin=host.getBoundingClientRect(),h=relativeRect(hub,origin),o=relativeRect(order,origin);
    const width=origin.width,height=origin.height;
    if(!width||!height)return;
    edgeSvg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const paths=data.groups.map(g=>{
      const c=relativeRect(cards.find(el=>el.dataset.flowSource===g.key),origin);
      let d;
      if(smallScreen.matches){const gutter=16;d=`M ${c.left} ${c.y} C ${gutter} ${c.y},${gutter} ${h.top-30},${h.x} ${h.top}`;}
      else{const gap=c.left-h.right;d=`M ${c.left} ${c.y} C ${c.left-gap*.55} ${c.y},${h.right+gap*.45} ${h.y},${h.right} ${h.y}`;}
      return {key:g.key,color:g.color,d,sessions:g.sessions};
    });
    paths.push({key:'purchase',color:'#67622a',d:smallScreen.matches?`M ${h.x} ${h.bottom} C ${h.x} ${h.bottom+25},${o.x} ${o.top-25},${o.x} ${o.top}`:`M ${h.left} ${h.y} C ${h.left-45} ${h.y},${o.right+45} ${o.y},${o.right} ${o.y}`,sessions:null});
    edgeSvg.innerHTML=paths.map(p=>`<path class="edge-base" d="${p.d}"/><path class="edge-track" data-edge="${p.key}" style="--edge-color:${p.color}" d="${p.d}"/>`).join('');
    for(const p of paths){
      if(p.sessions===null||smallScreen.matches)continue;
      const el=edgeSvg.querySelector(`[data-edge="${p.key}"]`),point=el.getPointAtLength(el.getTotalLength()*.3);
      const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('class','motion-edge-label');group.setAttribute('transform',`translate(${point.x},${point.y})`);group.innerHTML=`<rect x="-38" y="-12" width="76" height="24" rx="12"/><text y="4">${fmt(p.sessions)} جلسة</text>`;edgeSvg.append(group);
    }
    travelers.innerHTML=paths.map((p,i)=>[0,1].map(k=>`<span class="motion-person" data-edge="${p.key}" style="--edge-color:${p.color};offset-path:path('${p.d}');--delay:${-(i*.37+k*2.6)}s;--duration:${p.key==='purchase'?3.4:5.8}s">${person}</span>`).join('')).join('');
    applySelection();syncMotion();
  }
  function detail(){
    const g=data.groups.find(x=>x.key===selected);
    if(!g){$('motion-detail').innerHTML='<h4>كل القنوات في صورة واحدة</h4><p>كل بطاقة تجمع مصادرها المسجّلة فقط. اضغط على قناة لرؤية تفصيل الزيارات والشراء ونسب التحويل المتاحة. بطاقة الزيارات وبطاقة الشراء في وسط الخريطة تعرضان إجمالي المتجر.</p>';return;}
    const rows=g.source_names.map(key=>D.sources.find(r=>r.name===key));
    $('motion-detail').innerHTML=`<h4>${g.brand?`<span class="inline-brand">${logo(g.brand)}${esc(g.name)}</span>`:esc(g.name)}</h4><div class="motion-detail-stats"><span><b>${fmt(g.sessions)}</b>جلسة مسجّلة</span><span><b>${fmt(g.purchases)}</b>شراء مسجّل</span><span><b>${fmt(g.revenue,2)}</b>ريال إيراد</span></div><p>${esc(g.detail)}</p><ul class="motion-rate-list">${rows.map(r=>`<li><bdi>${esc(r.name)}</bdi> · ${fmt(r.sessions)} جلسة · ${fmt(r.purchases)} شراء · <b>${fmt(r.session_purchase_rate,2)}%</b> من الجلسات تضمنت شراءً${r.sessions<200?' · عينة صغيرة للحكم':''}</li>`).join('')}</ul><button class="small-button" id="motion-show-all" type="button">ارجع إلى كل القنوات</button>`;
    $('motion-show-all').addEventListener('click',()=>{select(null);cards.find(c=>c.dataset.flowSource===g.key)?.focus()});
  }
  function select(key){selected=key;applySelection();detail();if(key&&smallScreen.matches)$('motion-detail').scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'})}
  cards.forEach(card=>card.addEventListener('click',()=>select(selected===card.dataset.flowSource?null:card.dataset.flowSource)));
  function syncMotion(){
    host.classList.toggle('motion-running',onScreen&&!reduced.matches);
    host.classList.toggle('motion-paused',userPaused||!onScreen);
    $('motion-toggle').setAttribute('aria-pressed',String(userPaused));
    $('motion-toggle').textContent=reduced.matches?'الحركة مخففة':userPaused?'شغّل الحركة':'أوقف الحركة';
    $('motion-toggle').disabled=reduced.matches;
    $('motion-replay').disabled=reduced.matches;
    $('motion-state').textContent=reduced.matches?'الحركة مخففة حسب إعدادات جهازك؛ كل الأرقام ظاهرة.':userPaused?'الحركة متوقفة؛ الأرقام والتفاصيل ما زالت متاحة.':'حركة توضيحية؛ الأرقام ثابتة، وتتوقف الحركة خارج الشاشة.';
  }
  $('motion-toggle').addEventListener('click',()=>{userPaused=!userPaused;syncMotion()});
  $('motion-replay').addEventListener('click',()=>{userPaused=false;host.classList.remove('motion-running');requestAnimationFrame(()=>requestAnimationFrame(()=>{connect()}))});
  new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;syncMotion()},{threshold:.1}).observe(host);
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(connect)};
  new ResizeObserver(schedule).observe(sources);
  addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',syncMotion);smallScreen.addEventListener('change',schedule);
  document.fonts.ready.then(schedule);detail();connect();
  for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
})();
