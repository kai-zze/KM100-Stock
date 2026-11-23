$env:Path += ";C:\Program Files\nodejs"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\frontend"
cmd /c npm run dev -- --host
