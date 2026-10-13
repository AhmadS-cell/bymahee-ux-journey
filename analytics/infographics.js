// Keep shared section links aligned after local fonts and assets settle.
const openingHash=location.hash;let readerMoved=false;
['wheel','touchstart','keydown'].forEach(event=>addEventListener(event,()=>readerMoved=true,{once:true,passive:true}));
if(openingHash)Promise.all([document.fonts.ready,new Promise(resolve=>{if(document.readyState==='complete')resolve();else addEventListener('load',resolve,{once:true})})]).then(()=>{if(!readerMoved&&location.hash===openingHash)document.getElementById(openingHash.slice(1))?.scrollIntoView({block:'start',behavior:'instant'})});
