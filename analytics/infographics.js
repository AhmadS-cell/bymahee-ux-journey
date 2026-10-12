// SVG is intentionally schematic; the adjacent counts and percentages are exact.
function renderFunnelVisual(steps,labels,open,reach=false){
  if(reach){
    $('funnel-visual').innerHTML=`<div class="reach-rows">${steps.map((count,i)=>`<article class="reach-row" style="--order:${i}"><div class="reach-heading"><span><small>الخطوة ${i+1} · عدّ مستقل</small><b>${esc(labels[i])}</b></span><strong>${fmt(count)} <small>مستخدمًا</small></strong></div><div class="reach-track" aria-hidden="true"><span style="--reach:${count/T.total_users};background:${['#67622a','#77713a','#92875b','#a55369','#713047'][i]}"></span></div></article>`).join('')}</div>`;
    return;
  }
  const compact=window.matchMedia('(max-width: 650px)').matches;
  const spacing=compact?160:100,stageHeight=compact?148:88;
  const widths=open?[560,560,560,560,560]:[640,524,408,292,176],colors=['#67622a','#77713a','#ded8b7','#d6a9b2','#713047'];
  const alt=labels.map((label,i)=>`${label}: ${fmt(steps[i])} مستخدم`).join('؛ ');
  $('funnel-visual').innerHTML=`<svg class="funnel-svg" viewBox="0 0 720 ${compact?820:520}" role="img" aria-labelledby="funnel-svg-title funnel-svg-desc"><title id="funnel-svg-title">${open?'الدخول من أي مرحلة':'رحلة الشراء بالترتيب'}</title><desc id="funnel-svg-desc">${esc(alt)}. عرض الشكل مبسط وليس مقياسًا للأعداد.</desc>${steps.map((value,i)=>{const w=widths[i],bottom=open?w:w-62,x=(720-w)/2,y=12+i*spacing;return `<g class="funnel-slice" style="--order:${i};--text-color:${i===2||i===3?'#35351f':'#fff'}"><path d="M${x} ${y} H${x+w} L${x+(w+bottom)/2} ${y+stageHeight} H${x+(w-bottom)/2} Z" fill="${colors[i]}"/><text x="360" y="${y+(compact?54:33)}" text-anchor="middle" class="funnel-svg-label">${labels[i]}</text><text x="360" y="${y+(compact?122:68)}" text-anchor="middle" class="funnel-svg-number">${fmt(value)}</text></g>`}).join('')}</svg>`;
}
const sourcePurchases=key=>D.sources.find(source=>source.name===key)?.purchases||0;
const instagramMain=sourcePurchases('ig / social'),instagramReferral=sourcePurchases('l.instagram.com / referral');
const flowGroups=[
{name:'إنستجرام',brand:'instagram',count:instagramMain+instagramReferral,detail:`${fmt(instagramMain)} + ${fmt(instagramReferral)} من مصدرين`},
{name:'سناب المدفوع',brand:'snapchat',count:sourcePurchases('snapchat / paid'),detail:'إعلانات مدفوعة'},
{name:'بحث Google',brand:'google',count:sourcePurchases('google / organic'),detail:'بحث غير مدفوع'},
{name:'وصول مباشر',brand:null,count:sourcePurchases('(direct) / (none)'),detail:'مصدر التسويق غير ظاهر'}
];
flowGroups.push({name:'مصادر أخرى',brand:null,count:T.purchases-flowGroups.reduce((total,group)=>total+group.count,0),detail:'بقية المصادر المسجّلة'});
$('channel-flow').innerHTML=`<div class="flow-sources">${flowGroups.map((g,i)=>`<article class="flow-source" style="--order:${i}">${g.brand?logo(g.brand):'<span class="flow-neutral" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 18V9h4v9m2 0V5h4v13m2 0v-7h4v7M3 20h19"/></svg></span>'}<h4>${g.name}</h4><strong>${fmt(g.count)}</strong><span>${fmt(g.count/T.purchases*100,1)}% من الشراء</span><small>${g.detail}</small></article>`).join('')}</div><div class="flow-connector" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div><div class="flow-total"><span>الإجمالي المسجّل</span><strong>${fmt(T.purchases)}</strong><span>عملية شراء · ${fmt(T.purchase_revenue,2)} ريال</span></div>`;
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
const illustrations=document.querySelectorAll('.funnel-illustration,.channel-flow');
if(motion.matches)illustrations.forEach(el=>el.classList.add('illustration-visible'));
else{const animateObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('illustration-visible');animateObserver.unobserve(entry.target)}}),{threshold:.15});illustrations.forEach(el=>animateObserver.observe(el));}
$('replay-funnel').addEventListener('click',()=>{const host=document.querySelector('.funnel-illustration');host.classList.remove('illustration-visible');requestAnimationFrame(()=>requestAnimationFrame(()=>host.classList.add('illustration-visible')))});
motion.addEventListener('change',()=>{if(motion.matches)illustrations.forEach(el=>el.classList.add('illustration-visible'))});

// Draw the initial funnel after the main dashboard has initialized.
funnel();
window.matchMedia('(max-width: 650px)').addEventListener('change',()=>funnel());
// Keep shared section links aligned after local fonts and assets settle.
const openingHash=location.hash;let readerMoved=false;
['wheel','touchstart','keydown'].forEach(event=>addEventListener(event,()=>readerMoved=true,{once:true,passive:true}));
if(openingHash)Promise.all([document.fonts.ready,new Promise(resolve=>{if(document.readyState==='complete')resolve();else addEventListener('load',resolve,{once:true})})]).then(()=>{if(!readerMoved&&location.hash===openingHash)document.getElementById(openingHash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'})});
