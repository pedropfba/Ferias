import re,glob,os
for f in sorted(glob.glob('txt/*.txt')):
    t=open(f).read().replace('\xa0',' ').replace('\u2013','-').replace('\u202f',' ')
    name=os.path.basename(f)[:-4]
    m=re.search(r'Os preços estão[^\n]*',t); info=m.group(0) if m else ''
    lines=t.split('\n'); fl=[]
    for i,l in enumerate(lines):
        if l.strip()=='ida e volta' and lines[i-1].startswith('R$'):
            # walk back to find time block start
            j=i-1
            while j>0 and not re.fullmatch(r'\d\d:\d\d',lines[j].strip()): j-=1
            j2=j-2 if j>=2 and re.fullmatch(r'\d\d:\d\d',lines[j-2].strip()) else j
            blk=[x.strip() for x in lines[j2:i]]
            price=int(re.sub(r'\D','',lines[i-1]))
            stops=next((x for x in blk if 'escala' in x or 'parada' in x),'')
            idx=blk.index(stops) if stops in blk else 0
            via=blk[idx+1] if stops!='Sem escalas' and idx+1<len(blk) else ''
            fl.append((price,f"{blk[0]}-{blk[2] if len(blk)>2 else ''} {blk[3].split('Operado')[0] if len(blk)>3 else ''} {blk[4] if len(blk)>4 else ''} {stops} {via}"))
    fl=sorted(set(fl))
    print(f"== {name} | min R${fl[0][0] if fl else '-'} | {info}")
    for p,d in fl[:3]: print(f"     R${p}  {d}")
