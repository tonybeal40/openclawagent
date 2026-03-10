while ($true) {

cd C:\Users\tonyb\.openclaw

git add .

git commit -m "Auto backup $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

git push origin main

Start-Sleep -Seconds 3600

}