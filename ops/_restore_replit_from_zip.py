import zipfile, os, shutil
zip_path=r'G:\My Drive\openclaw_backup_20260304_1536.zip'
ws=r'C:\Users\tonyb\.openclaw\workspace'
out_report=r'C:\Users\tonyb\.openclaw\workspace\ops\REPLIT_ZIP_RESTORE_20260309-1647.txt'
extract_root=os.path.join(ws,'_tmp_replit_restore_20260309-1647')
proj=os.path.join(ws,'projects')
os.makedirs(extract_root,exist_ok=True)
entries=[
 'openclaw_backup_20260304_1536/workspace/replit-standalone/',
 'openclaw_backup_20260304_1536/workspace/replit-standalone-ui/'
]
with open(out_report,'w',encoding='utf-8') as rep:
    if not os.path.exists(zip_path):
        rep.write('ZIP_MISSING\n'); print(out_report); raise SystemExit
    with zipfile.ZipFile(zip_path) as z:
        names=z.namelist()
        matched=[n for n in names if n.startswith(entries[0]) or n.startswith(entries[1])]
        rep.write(f'MATCHED_ENTRIES={len(matched)}\n')
        if not matched:
            print(out_report); raise SystemExit
        for n in matched:
            z.extract(n,extract_root)
    src1=os.path.join(extract_root,'openclaw_backup_20260304_1536','workspace','replit-standalone')
    src2=os.path.join(extract_root,'openclaw_backup_20260304_1536','workspace','replit-standalone-ui')
    dst1=os.path.join(proj,'replit-standalone')
    dst2=os.path.join(proj,'replit-standalone-ui')
    def copytree_contents(src,dst):
        os.makedirs(dst,exist_ok=True)
        count=0
        for root,dirs,files in os.walk(src):
            rel=os.path.relpath(root,src)
            dstd=os.path.join(dst,rel) if rel!='.' else dst
            os.makedirs(dstd,exist_ok=True)
            for f in files:
                s=os.path.join(root,f); d=os.path.join(dstd,f)
                shutil.copy2(s,d); count+=1
        return count
    c1=copytree_contents(src1,dst1) if os.path.exists(src1) else -1
    c2=copytree_contents(src2,dst2) if os.path.exists(src2) else -1
    rep.write(f'COPIED_replit-standalone={c1}\n')
    rep.write(f'COPIED_replit-standalone-ui={c2}\n')
print(out_report)
