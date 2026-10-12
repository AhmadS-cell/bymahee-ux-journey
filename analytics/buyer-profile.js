'use strict';
const BP=D.buyer_profile;
const buyerDimensions={cities:'المدن',devices:'نوع الجهاز',operating_systems:'نظام التشغيل',browsers:'المتصفح',models:'موديل الجهاز'};
const buyerLabels={Riyadh:'الرياض',Jeddah:'جدة',Dammam:'الدمام',Madinah:'المدينة المنورة',Abha:'أبها',Buraydah:'بريدة',Makkah:'مكة المكرمة','Al Khobar':'الخبر','Al Jubail':'الجبيل',Yanbu:'ينبع',Doha:'الدوحة',Cairo:'القاهرة',Jazan:'جازان',mobile:'الموبايل',desktop:'الكمبيوتر',tablet:'التابلت','(not set)':'غير محدد'};
const buyerLabel=name=>buyerLabels[name]||name;
const buyerEligible=r=>r.name!=='(not set)'&&r.users>=BP.thresholds.min_traffic&&r.buyers>=BP.thresholds.min_purchases_for_positive_ranking;
const buyerChannels=D.sources.map(r=>({...r,eligible:r.sessions>=BP.thresholds.min_traffic&&r.purchases>=BP.thresholds.min_purchases_for_positive_ranking}));
const bestSource=buyerChannels.filter(r=>r.eligible).sort((a,b)=>b.session_purchase_rate-a.session_purchase_rate)[0];
const bestCity=BP.dimensions.cities.filter(buyerEligible).sort((a,b)=>b.user_purchase_rate-a.user_purchase_rate)[0];
const mobileBuyers=BP.dimensions.devices.find(r=>r.name==='mobile');
$('buyer-summary').innerHTML=`<article><span class="pill">أعلى نسبة مرصودة للقنوات المؤهلة</span><h3>${sourceIdentity(bestSource.name,true)}</h3><strong>${fmt(bestSource.session_purchase_rate,2)}%</strong><p>من ${n(fmt(bestSource.sessions))} جلسة؛ ${n(fmt(bestSource.purchases))} عملية شراء مسجّلة.</p><small>تخص الروابط الموسومة وحدها. نسبة شراء الجلسات من GA4.</small></article><article><span class="pill">أعلى نسبة مرصودة للمدن المؤهلة</span><h3>${esc(buyerLabel(bestCity.name))}</h3><strong>${fmt(bestCity.user_purchase_rate,2)}%</strong><p>${n(fmt(bestCity.buyers))} مشتريًا من ${n(fmt(bestCity.users))} مستخدمًا نشطًا.</p><small>نسبة الأشخاص الذين اشتروا، وليست نسبة الجلسات. الحكم أولي.</small></article><article><span class="pill">أين يتركز المشترون؟</span><h3>الموبايل</h3><strong>${fmt(mobileBuyers.buyers/BP.total_buyers*100,1)}%</strong><p>${n(fmt(mobileBuyers.buyers))} من ${n(fmt(BP.total_buyers))} مشتريًا مسجّلًا.</p><small>هذه حصة من المشترين؛ نسبة شراء مستخدمي الموبايل ${fmt(mobileBuyers.user_purchase_rate,2)}%.</small></article>`;
let buyerDimension='cities',buyerLimit=12;
function buyerEvidence(r){if(r.name==='(not set)')return ['unknown','غير محدد؛ لا يدخل ترتيب الأفضل'];if(r.users<BP.thresholds.min_traffic)return ['small','عينة صغيرة؛ لا يدخل ترتيب الأفضل'];if(!r.buyers)return ['low','ترافيك كافٍ للفحص؛ لا شراء مسجّل'];if(r.buyers<BP.thresholds.min_purchases_for_positive_ranking)return ['low','ترافيك كافٍ للفحص؛ عدد المشترين قليل'];return ['eligible','حجم يدعم مقارنة أولية؛ لا يثبت الأفضل دائمًا']}
function buyerRow(r,max){const [status,label]=buyerEvidence(r);return `<article class="buyer-row" data-evidence="${status}"><div class="buyer-row-heading"><h4>${esc(buyerLabel(r.name))}</h4><span class="buyer-rate">${r.user_purchase_rate===null?'غير متاحة':fmt(r.user_purchase_rate,2)+'%'}<small>نسبة الأشخاص الذين اشتروا</small></span></div><div class="buyer-row-stats"><span><b>${fmt(r.users)}</b>مستخدمون نشطون</span><span><b>${fmt(r.buyers)}</b>مستخدمون اشتروا</span><span><b>${fmt(r.purchases)}</b>عمليات شراء</span></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${max?100*r.user_purchase_rate/max:0}%"></div></div><small class="buyer-status">${esc(label)}</small><details><summary>الإيراد وجودة الزيارة والتفاصيل</summary><p>الإيراد المسجّل: ${n(fmt(r.revenue,2))} ريال. متوسط التفاعل لكل مستخدم نشط: ${timeArabic(r.time)}. نسبة الجلسات المتفاعلة: ${n(fmt(r.engagement,2))}%؛ هذه النسبة لا تعني شراءً.</p><p>${r.users?`النسبة هنا = ${n(fmt(r.buyers))} مستخدمًا ظهر لهم purchase ÷ ${n(fmt(r.users))} مستخدمًا نشطًا للصف نفسه خلال الفترة.`:'لا يوجد مستخدمون نشطون في هذا الصف لحساب نسبة الشراء.'} ${r.name==='iPhone'?'الاسم عام؛ لا يحدد إصدار iPhone.':''}</p></details></article>`}
function renderBuyerProfile(){
  const query=$('buyer-search').value.trim().toLowerCase();
  const scope=$('buyer-sample').value;
  let rr=BP.dimensions[buyerDimension].filter(r=>buyerLabel(r.name).toLowerCase().includes(query)||r.name.toLowerCase().includes(query));
  if(scope==='traffic')rr=rr.filter(r=>r.name!=='(not set)'&&r.users>=BP.thresholds.min_traffic);
  if(scope==='eligible')rr=rr.filter(buyerEligible);
  const sort=$('buyer-sort').value;rr.sort((a,b)=>sort==='rate'?b.user_purchase_rate-a.user_purchase_rate:b[sort]-a[sort]);
  const max=Math.max(0,...rr.map(r=>r.user_purchase_rate));
  $('buyer-dimension-title').textContent=buyerDimensions[buyerDimension]+' · الشراء مقارنة بحجم الجمهور';
  $('buyer-count').textContent=`${fmt(rr.length)} نتيجة · عرض ${fmt(Math.min(buyerLimit,rr.length))} · إجمالي الصفوف المتاحة ${fmt(BP.dimensions[buyerDimension].length)}`;
  $('buyer-results').innerHTML=rr.slice(0,buyerLimit).map(r=>buyerRow(r,max)).join('')||'<p class="note">لا توجد نتائج لهذا الاختيار. جرّب عرض كل العينات أو تغيير البحث.</p>';
  $('buyer-more').hidden=buyerLimit>=rr.length;
  $('buyer-download').href=`buyer-${buyerDimension}.csv`;
  $('buyer-limit-note').textContent=buyerDimension==='models'?'كثير من الأجهزة تظهر باسم iPhone العام. نسب الموديلات المحددة مرتفعة أحيانًا من عدد قليل جدًا من الأشخاص؛ لا نبني استهدافًا أو حكمًا على نوع الهاتف منها.':buyerDimension==='cities'?'المدينة موقع تقديري في GA4، وليست عنوان الشحن. صف المدينة غير المحددة فيه 1,692 مستخدمًا نشطًا (21% من الإجمالي)؛ استبعدناه من ترتيب المدن. مجموع المشترين في صفوف المدن 117 مقابل 114 في الإجمالي، لذلك لا نجمع الصفوف كعملاء مختلفين.':'قد يظهر المستخدم في أكثر من جهاز أو متصفح أو نظام. لا نجمع صفوف المستخدمين كأشخاص مختلفين، ولا نستنتج أن خصائص الأقسام المختلفة تخص الشخص نفسه.';
  document.querySelectorAll('[data-buyer-dimension]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.buyerDimension===buyerDimension)));
}
document.querySelectorAll('[data-buyer-dimension]').forEach(b=>b.addEventListener('click',()=>{buyerDimension=b.dataset.buyerDimension;buyerLimit=12;$('buyer-search').value='';renderBuyerProfile()}));
for(const id of ['buyer-search','buyer-sample','buyer-sort'])$(id).addEventListener(id==='buyer-search'?'input':'change',()=>{buyerLimit=12;renderBuyerProfile()});
$('buyer-more').addEventListener('click',()=>{buyerLimit+=12;renderBuyerProfile()});
renderBuyerProfile();
function renderBuyerChannels(){
  const all=$('buyer-channel-small').checked;
  const rr=buyerChannels.filter(r=>all||r.sessions>=BP.thresholds.min_traffic).sort((a,b)=>b.session_purchase_rate-a.session_purchase_rate);
  $('buyer-channel-results').innerHTML=rr.map(r=>`<article class="buyer-row" data-evidence="${r.sessions<BP.thresholds.min_traffic?'small':r.eligible?'eligible':'low'}"><div class="buyer-row-heading"><h4>${sourceIdentity(r.name,true)}</h4><span class="buyer-rate">${fmt(r.session_purchase_rate,2)}%<small>نسبة الجلسات التي اشترت</small></span></div><div class="buyer-row-stats"><span><b>${fmt(r.sessions)}</b>جلسة</span><span><b>${fmt(r.purchases)}</b>عمليات شراء</span><span><b>${fmt(r.revenue,0)}</b>ريال إيراد مسجّل</span></div><small class="buyer-status">${r.sessions<BP.thresholds.min_traffic?'عينة صغيرة؛ لا يدخل ترتيب الأفضل':r.eligible?'حجم يدعم مقارنة أولية':'ترافيك كبير؛ شراء قليل أو غير مسجّل'}</small><details><summary>افهم جودة هذه الزيارات</summary><p>متوسط التفاعل لكل جلسة: ${timeArabic(r.time)}؛ نسبة الجلسات المتفاعلة ${fmt(r.engagement,2)}%. المصدر الأصلي: <bdi>${esc(r.name)}</bdi>.</p></details></article>`).join('');
}
$('buyer-channel-small').addEventListener('change',renderBuyerChannels);renderBuyerChannels();
for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
