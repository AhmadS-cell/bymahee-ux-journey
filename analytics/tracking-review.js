'use strict';
// Same-period user counts are diagnostic comparisons, never session drop-off estimates.
const tracking=D.tracking_review;
const recentPurchase=D.funnel_period_events.find(row=>row.name==='purchase');
$('match-recorded-users').textContent=fmt(recentPurchase.users);
$('match-sequential-users').textContent=fmt(D.funnel_closed.steps[4]);
const matchedKeys=['view_item','add_to_cart','begin_checkout','purchase'];
const matchedLabels=['مشاهدة منتج','إضافة للسلة','بدء إتمام الطلب','شراء'];
$('journey-match-body').innerHTML=matchedKeys.map((key,i)=>{
  const recorded=D.funnel_period_events.find(row=>row.name===key).users;
  return `<tr><th scope="row">${esc(matchedLabels[i])}</th><td>${n(fmt(recorded))}</td><td>${n(fmt(D.funnel_closed.steps[i+1]))}</td></tr>`;
}).join('');
$('investigation-cards').innerHTML=tracking.checkpoints.map((point,i)=>`<article class="investigation-card"><span class="pill">${esc(point.priority)}</span><h4>${esc(point.title)}</h4><p class="checkpoint-proof"><b>الدليل المسجّل:</b> ${esc(point.evidence)}</p><p><b>ما لم نحسمه:</b> ${esc(point.unknown)}</p><details><summary>ماذا نفحص وكيف نتحقق؟</summary><p>${esc(point.test)}</p><p><b>علامة نجاح الفحص:</b> ${esc(point.acceptance)}</p><a class="small-button" href="${esc(point.link)}">${esc(point.link_label)}</a></details></article>`).join('');
$('tracking-plan-steps').innerHTML=tracking.repair_plan.map(step=>`<li><b>${esc(step.title)}</b><p>${esc(step.action)}</p><p class="muted"><b>المسؤول:</b> ${esc(step.owner)}</p></li>`).join('');
$('tracking-acceptance').textContent=tracking.acceptance;
brandify($('journey-match'));
brandify($('investigation-cards'));
brandify($('tracking-plan'));
for(const item of sectionIndex)item.text=document.getElementById(item.id).textContent;
