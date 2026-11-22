const { chromium } = require('playwright');
(async () => {
  const [,, o, d1, d2, extra, tag] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({locale:'pt-BR'});
  const q = `Flights from ${o} to FOR on ${d1} through ${d2}${extra||''}`;
  await p.goto(`https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&hl=pt-BR&curr=BRL&gl=BR`,{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForFunction(()=>document.body.innerText.includes("ida e volta"),null,{timeout:40000}).catch(()=>{});
  await p.waitForTimeout(3000);
  require('fs').writeFileSync(`txt/${o}_${d1}_${d2}${tag||''}.txt`, await p.innerText('body'));
  await b.close();
})();
