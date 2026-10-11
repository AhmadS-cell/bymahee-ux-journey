const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const normalize=s=>s.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u065F]/g,'');
const dialog=$('#image-dialog');let previousFocus;
function showImage(button){previousFocus=document.activeElement;$('#image-full').src=button.dataset.image;$('#image-full').alt=button.dataset.caption||'لقطة من رحلة العميلة';$('#image-title').textContent=button.dataset.caption||'دليل مصوّر';$('#image-original').href=button.dataset.image;dialog.showModal();dialog.scrollTop=0;}
$$('[data-image]').forEach(button=>button.addEventListener('click',()=>showImage(button)));
$('#image-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>previousFocus?.focus());
$('#nav-toggle').addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');$('#nav-toggle').setAttribute('aria-expanded',open);});
function closeNav(){document.body.classList.remove('nav-open');$('#nav-toggle').setAttribute('aria-expanded','false');}
$('#sidebar').addEventListener('click',event=>{if(event.target.closest('a'))closeNav();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeNav();});
const sections=$$('main section[data-title]');
const observer=new IntersectionObserver(entries=>{const current=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(current){$$('#sidebar nav a').forEach(a=>{const active=a.hash==='#'+current.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-100px 0px -65% 0px',threshold:0});sections.forEach(s=>observer.observe(s));
let activeFilter='all';
function filterFindings(){const query=normalize($('#finding-search').value.trim());let count=0;$$('.finding').forEach(f=>{const show=(activeFilter==='all'||f.dataset.priority===activeFilter)&&normalize(f.textContent).includes(query);f.hidden=!show;if(show)count++;});$('#finding-count').textContent=count+' ملاحظة';$('#no-findings').hidden=count!==0;}
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button));filterFindings();}));
$('#finding-search').addEventListener('input',filterFindings);
function revealHash(){const el=document.getElementById(location.hash.slice(1));if(el?.classList.contains('finding')){activeFilter='all';$('#finding-search').value='';$$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter==='all'));filterFindings();requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'instant'}));}}
addEventListener('hashchange',revealHash);revealHash();
const searchable=[...sections.map(s=>({id:s.id,title:s.dataset.title,text:normalize(s.textContent)})),...$$('.finding').map(f=>({id:f.id,title:'ملاحظة '+f.dataset.number+' · '+f.querySelector('h3').textContent,text:normalize(f.textContent)}))];
$('#search').addEventListener('input',()=>{const q=normalize($('#search').value.trim());const results=$('#search-results');results.replaceChildren();if(!q)return;const matches=searchable.filter(x=>x.text.includes(q)).slice(0,12);const count=document.createElement('p');count.textContent=matches.length?'نتائج البحث':'لا توجد نتائج. جرّب كلمة أخرى.';results.append(count);matches.forEach(item=>{const a=document.createElement('a');a.href='#'+item.id;a.textContent=item.title;results.append(a);});});
const tasks=$$('[data-task]');const taskKey='bymahee-ux-report-v1.2-tasks';let checked={};try{const saved=localStorage.getItem(taskKey);if(saved){checked=JSON.parse(saved);}else{const old=JSON.parse(localStorage.getItem('bymahee-ux-report-v1-tasks')||'{}');const oldIds=['F02-F03','F01','F14','F04','F10','F11','F09','F06-F08','F12','F13','F07','F15'];tasks.forEach(t=>{checked[t.dataset.task]=!!old['task-'+(oldIds.indexOf(t.dataset.task)+1)];});}}catch{}
function updateTasks(save=true){tasks.forEach(t=>{t.checked=!!checked[t.dataset.task];t.closest('label').classList.toggle('done',t.checked);});$('#task-progress').textContent='عدد البنود المحددة: '+tasks.filter(t=>t.checked).length+' من '+tasks.length;if(save){try{localStorage.setItem(taskKey,JSON.stringify(checked));}catch{}}}
tasks.forEach(t=>t.addEventListener('change',()=>{checked[t.dataset.task]=t.checked;updateTasks();}));updateTasks(false);
$('#reset-tasks').addEventListener('click',()=>{checked={};updateTasks();});
let printState=[];let hiddenBefore=[];
addEventListener('beforeprint',()=>{printState=$$('details').map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);hiddenBefore=$$('.finding[hidden]');hiddenBefore.forEach(f=>f.hidden=false);});
addEventListener('afterprint',()=>{printState.forEach(([d,o])=>d.open=o);hiddenBefore.forEach(f=>f.hidden=true);});
$('#print').addEventListener('click',()=>window.print());
