// Only the closed, same-period user sequence supports adjacent continuation rates.
let renderFunnelVisual;
(()=>{
  const host=$('funnel-visual'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),vertical=matchMedia('(max-width:1250px)');
  const colors=['#67622a','#77713a','#92875b','#a55369','#713047'];
  const icons=['<rect x="3" y="4" width="18" height="15" rx="2"/><path d="M3 8h18m-12 5h6m-3-3v6"/>','<path d="m5 7 7-4 7 4v11l-7 3-7-3Z"/><path d="m5 7 7 4 7-4m-7 4v10"/>','<path d="M2 4h3l3 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>','<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-14 5h4"/>','<path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z"/><path d="m9 11 2 2 4-4"/>'];
  const person='<svg viewBox="0 0 18 24" aria-hidden="true"><circle cx="9" cy="4" r="3" fill="currentColor"/><path d="M5 9h8l1 7h-3v7H7v-7H4Z" fill="currentColor"/></svg>';
  $('ff-rate-grid').innerHTML=D.funnel_closed.steps.slice(1).map((n,i)=>`<span>${['الزيارة ← المنتج','المنتج ← السلة','السلة ← إتمام الطلب','إتمام الطلب ← الشراء'][i]}<b>${fmt(100*n/D.funnel_closed.steps[i],2)}%</b></span>`).join('');
  let frame=0,onScreen=false,paused=false,matched=false;
  renderFunnelVisual=(steps,labels,open,reach=false)=>{
    matched=!reach&&!open;
    const numbers=reach?[T.sessions,...steps.slice(1)]:steps;
    const names=['زيارة المتجر',...labels.slice(1)];
    host.innerHTML='<svg class="motion-edges" aria-hidden="true"></svg><div class="motion-travelers" aria-hidden="true"></div>'+numbers.map((n,i)=>{
      const note=reach?(i===0?`${fmt(steps[0])} مستخدمًا ظهر لهم بدء جلسة`:i===4?`${fmt(T.purchases)} حدث شراء · قد يتكرر للشخص نفسه`:i===3?'بدء إتمام الطلب؛ الدفع نفسه غير موثّق':'مستخدمون ظهر لهم الحدث، بعدّ مستقل'):(i===0?'مستخدمون دخلوا بداية هذا الفانل':i===3?'بدء إتمام الطلب؛ لا يثبت وصولهم للدفع':open?'يمكن الدخول من أي مرحلة':'مستخدمون ظهروا بعد الخطوات السابقة');
      const node=`<article class="ff-node" data-index="${i}" style="--stage-color:${colors[i]}"><span class="ff-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${icons[i]}</svg></span><h4>${esc(names[i])}</h4><span class="ff-status">${reach?'عدد مسجّل في GA4':'عدد في الفانل المسجّل'}</span><strong>${fmt(n)}</strong><small>${reach&&i===0?'جلسة · 90 يومًا':'مستخدمًا · '+(reach?'90':'60')+' يومًا'}</small><small class="ff-stage-note ${i===3?'gap':''}">${note}</small></article>`;
      if(i===4)return node;
      return node+`<div class="ff-transition ${matched?'':'unknown'}" data-index="${i}">${matched?`<b>${fmt(100*steps[i+1]/steps[i],2)}%</b><span>ظهروا في الخطوة التالية</span><small><bdi dir="ltr">${fmt(steps[i+1])} ÷ ${fmt(steps[i])}</bdi> مستخدمًا</small>`:'<b>الانتقال غير موثّق</b><small>'+ (reach?'عدادات مستقلة؛ لا نسبة تحويل':'يمكن دخول مستخدمين في الخطوة التالية')+'</small>'}</div>`;
    }).join('');
    $('ff-rate-summary').hidden=matched;
    $('ff-motion-state').textContent=matched?'الحركة توضيحية؛ عدد الأيقونات وسرعتها لا يمثلان عدد الناس أو زمن رحلتهم.':'الخطوط المتقطعة تمثل مراحل الرحلة فقط؛ لم نوثّق انتقال هؤلاء الأشخاص بينها.';
    connect();
  };
  function connect(){
    if(!host.children.length)return;
    const canvas=host.getBoundingClientRect(),nodes=[...host.querySelectorAll('.ff-node')],edgeSvg=host.querySelector('.motion-edges'),travelers=host.querySelector('.motion-travelers');
    edgeSvg.setAttribute('viewBox',`0 0 ${canvas.width} ${canvas.height}`);
    const paths=nodes.slice(0,-1).map((node,i)=>{
      const a=node.getBoundingClientRect(),b=nodes[i+1].getBoundingClientRect();
      const x=a.left+a.width/2-canvas.left,x2=b.left+b.width/2-canvas.left,y=a.bottom-canvas.top+3;
      const transition=host.querySelector(`.ff-transition[data-index="${i}"]`);
      let d;
      if(vertical.matches){const y2=b.top-canvas.top-3,gutter=10;d=`M ${x} ${y} C ${gutter} ${y+12},${gutter} ${y2-12},${x2} ${y2}`;}
      else{const y2=b.bottom-canvas.top+3;d=`M ${x} ${y} C ${x} ${y+132},${x2} ${y2+132},${x2} ${y2}`;transition.style.left=`${(x+x2)/2}px`;transition.style.top=`${Math.max(y,y2)+96}px`;}
      return {i,d,color:matched?colors[i+1]:'#a56627',arrow:vertical.matches?`M ${x2-4} ${b.top-canvas.top-9} L ${x2} ${b.top-canvas.top-3} L ${x2+4} ${b.top-canvas.top-9}`:`M ${x2-4} ${b.bottom-canvas.top+9} L ${x2} ${b.bottom-canvas.top+3} L ${x2+4} ${b.bottom-canvas.top+9}`};
    });
    edgeSvg.innerHTML=paths.map(p=>`<path class="ff-line ${matched?'':'unknown'}" style="--edge-color:${p.color}" d="${p.d}"/><path class="ff-arrow" style="--edge-color:${p.color}" d="${p.arrow}"/>`).join('');
    travelers.innerHTML=matched?paths.map(p=>[0,1].map(k=>`<span class="motion-person" style="--edge-color:${p.color};offset-path:path('${p.d}');--duration:4.8s;--delay:${-(p.i*.45+k*2.4)}s">${person}</span>`).join('')).join(''):'';
    sync();
  }
  function sync(){
    host.classList.toggle('motion-running',matched&&onScreen&&!reduced.matches);
    host.classList.toggle('motion-paused',paused||!onScreen);
    $('pause-funnel').setAttribute('aria-pressed',String(paused));
    $('pause-funnel').textContent=!matched?'الحركة في العرض المتسلسل':paused?'شغّل الحركة':'أوقف الحركة';
    $('pause-funnel').disabled=$('replay-funnel').disabled=!matched||reduced.matches;
    if(matched)$('ff-motion-state').textContent=reduced.matches?'الحركة مخففة حسب إعدادات جهازك؛ الأرقام والنسب ظاهرة.':paused?'الحركة متوقفة؛ الأرقام والنسب ثابتة.':'حركة توضيحية؛ الأيقونات لا تمثل عدد الناس أو زمن الرحلة، وتتوقف خارج الشاشة.';
  }
  $('pause-funnel').addEventListener('click',()=>{paused=!paused;sync()});
  $('replay-funnel').addEventListener('click',()=>{paused=false;host.classList.remove('motion-running');requestAnimationFrame(()=>requestAnimationFrame(connect))});
  $('ff-show-rates').addEventListener('click',()=>{$('funnel-mode').value='closed';funnel();$('funnel-motion').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'})});
  new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;sync()},{threshold:.1}).observe(host);
  const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(connect)};
  new ResizeObserver(schedule).observe(host);addEventListener('resize',schedule,{passive:true});
  reduced.addEventListener('change',sync);vertical.addEventListener('change',schedule);document.fonts.ready.then(schedule);
  const initialMode=new URLSearchParams(location.search).get('funnel');
  if(['closed','open','reach_90'].includes(initialMode))$('funnel-mode').value=initialMode;
  funnel();
  for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
})();
