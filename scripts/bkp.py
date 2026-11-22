import re,sys
for f in sys.argv[1:]:
    rows=[];hdr=''
    for l in open(f):
        if l.startswith('##'): hdr=l.strip(); continue
        if not l.startswith('- '): continue
        p=l[2:].split(' | ')
        m=re.search(r'Preço atual: R\$\s*([\d.]+)',p[2]) or re.search(r'Preço: R\$\s*([\d.]+)',p[2])
        tot=int(m.group(1).replace('.','')) if m else None
        sc=re.search(r'(\d+,\d|10) \S+ ([\d.]+) avalia',p[1]); 
        rows.append((tot or 10**9,p[0][:48],sc.group(1)+f' ({sc.group(2)})' if sc else '-',p[3],p[4][23:110] if len(p)>4 else ''))
    print(hdr)
    for r in sorted(rows): print(f"  R$ {r[0]:>7,}".replace(',','.') if r[0]<10**9 else '  sem preço', '|',r[1],'|',r[2],'|',r[3],'|',r[4].strip())
