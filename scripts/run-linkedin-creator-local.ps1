param(
  [int]$Port = 8088
)
$root='C:\Users\tonyb\.openclaw\workspace\projects\_merged_staging\mission-control\products\linkedin-creator-os\frontend'
Set-Location $root
$py='C:\Users\tonyb\AppData\Local\Programs\Python\Python312\python.exe'
if(Test-Path $py){ & $py -m http.server $Port }
else { py -m http.server $Port }
