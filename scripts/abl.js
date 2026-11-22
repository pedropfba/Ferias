const { chromium } = require('playwright');
const refs = {cumbuco:[-3.6262681,-38.7281547], flecheiras:[-3.2208935,-39.2738956], guajiru:[-3.238731,-39.2321065]};
function km(a,b){const R=6371,r=x=>x*Math.PI/180;const d1=r(b[0]-a[0]),d2=r(b[1]-a[1]);const h=Math.sin(d1/2)**2+Math.cos(r(a[0]))*Math.cos(r(b[0]))*Math.sin(d2/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
(async () => {
  const [,, ref, ...ids] = process.argv;
  const b = await chromium.launch(); const ctx = await b.newContext({locale:'pt-BR', userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'});
  let i=0; const out=[];
  await Promise.all([0,1,2,3].map(async()=>{ const p=await ctx.newPage(); while(i<ids.length){ const id=ids[i++];
    try{ await p.goto('https://www.airbnb.com.br/rooms/'+id+'?adults=6&check_in=2027-06-16&check_out=2027-06-30',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForTimeout(3000);
      const h=await p.content(); const m=h.match(/"lat":(-?\d+\.\d+),"lng":(-?\d+\.\d+)/)||h.match(/"latitude":(-?\d+\.\d+),"longitude":(-?\d+\.\d+)/);
      const title=await p.title(); const rev=(h.match(/"reviewCount":(\d+)/)||[])[1]; const guests=(h.match(/(\d+) hóspedes/)||[])[1];
      out.push(`${id} | ${m?km(refs[ref],[+m[1],+m[2]]).toFixed(1)+' km do centro':'?'} | ${rev||'?'} aval | ${guests||'?'} hósp | ${title.slice(0,70)}`);
    }catch(e){out.push(id+' ERR');} } await p.close(); }));
  console.log(out.join('\n')); await b.close();
})();
