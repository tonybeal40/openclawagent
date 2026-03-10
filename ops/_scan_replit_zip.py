import zipfile,sys,os
zpaths=[r'G:\My Drive\openclaw-workspace-main\openclaw_backup_20260304_1536.zip',r'G:\My Drive\openclaw-full-main\workspace\openclaw_backup_20260304_1536.zip',r'G:\My Drive\openclaw_backup_20260304_1536.zip']
out=r'C:\Users\tonyb\.openclaw\workspace\ops\REPLIT_ZIP_MATCHES_20260309-1645.txt'
with open(out,'w',encoding='utf-8') as f:
    for zp in zpaths:
        f.write(f'## {zp}\n')
        if not os.path.exists(zp):
            f.write('MISSING\n\n'); continue
        try:
            with zipfile.ZipFile(zp) as z:
                hits=[n for n in z.namelist() if 'replit' in n.lower()]
                if not hits:
                    f.write('NO_MATCHES\n\n')
                else:
                    for h in hits[:5000]:
                        f.write(h+'\n')
                    f.write(f'TOTAL_MATCHES={len(hits)}\n\n')
        except Exception as e:
            f.write('ERROR:'+str(e)+'\n\n')
print(out)
