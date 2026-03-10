$src = "C:\Users\tonyb\.openclaw\workspace"
$drive = "G:\My Drive\openclaw-workspace-main"
$log = "C:\Users\tonyb\.openclaw\workspace\sync-monitor.log"

function Get-Count($path, $recurse=$false){
  if(!(Test-Path $path)){ return -1 }
  if($recurse){ return (Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object).Count }
  else { return (Get-ChildItem $path -Force -ErrorAction SilentlyContinue | Measure-Object).Count }
}

"[$(Get-Date -Format s)] monitor started" | Out-File -FilePath $log -Encoding utf8 -Append

for($i=0; $i -lt 72; $i++){
  if(!(Test-Path $drive)){
    "[$(Get-Date -Format s)] drive not found" | Out-File -FilePath $log -Append
    Start-Sleep -Seconds 60
    continue
  }

  # keep pushing latest desktop workspace to Drive (except active large zip)
  robocopy $src $drive /MIR /XF openclaw_backup_20260304_1536.zip /R:1 /W:1 /NFL /NDL /NP /NJH /NJS | Out-Null

  $sTop = Get-Count $src $false
  $sRec = Get-Count $src $true
  $dTop = Get-Count $drive $false
  $dRec = Get-Count $drive $true

  "[$(Get-Date -Format s)] src($sTop/$sRec) drive($dTop/$dRec)" | Out-File -FilePath $log -Append

  # consider hydrated when counts are close/equal to source
  if($dTop -ge $sTop -and $dRec -ge $sRec){
    # final mirror from Drive back to workspace to normalize
    robocopy $drive $src /MIR /R:1 /W:1 /NFL /NDL /NP /NJH /NJS | Out-Null
    $fTop = Get-Count $src $false
    $fRec = Get-Count $src $true
    "[$(Get-Date -Format s)] FINALIZED workspace($fTop/$fRec)" | Out-File -FilePath $log -Append
    break
  }

  Start-Sleep -Seconds 60
}

"[$(Get-Date -Format s)] monitor exit" | Out-File -FilePath $log -Append
