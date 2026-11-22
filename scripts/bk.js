const { chromium } = require('playwright');
(async () => {
  const [,, ss, d1, d2, rooms, adults] = process.argv;
  const b = await chromium.launch(); const ctx = await b.newContext({locale:'pt-BR', viewport:{width:1400,height:1000}, userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'});
  const p = await ctx.newPage();
  await p.goto(`https://www.booking.com/searchresults.pt-br.html?ss=${encodeURIComponent(ss)}&checkin=${d1}&checkout=${d2}&group_adults=${adults}&no_rooms=${rooms}&group_children=0&selected_currency=BRL&lang=pt-br`,{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForSelector('[data-testid="property-card"]',{timeout:40000}).catch(async()=>console.log('nocards', (await p.innerText('body')).slice(0,300)));
  await p.waitForTimeout(3000);
  const cards = await p.$$eval('[data-testid="property-card"]', els => els.map(e=>{
    const g=s=>(e.querySelector(s)||{}).innerText||''; const all=e.innerText.replace(/\n/g,' '); const pr=(all.match(/Preço atual: R\$\s*[\d.]+/)||all.match(/Preço: R\$\s*[\d.]+/)||[''])[0]; return [g('[data-testid="title"]'), g('[data-testid="review-score"]').replace(/\n/g,' '), pr, g('[data-testid="distance"]'), g('[data-testid="recommended-units"]').replace(/\n/g,' ').slice(0,90)].join(' | ');}));
  console.log('##',ss,d1,d2,rooms+'q',adults+'ad'); cards.forEach(c=>console.log('-',c));
  await b.close();
})();
