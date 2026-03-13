# Script pour packager l'extension MemKeyPass
# Usage : .\package-extension.ps1 -Browser chrome
#         .\package-extension.ps1 -Browser firefox

param(
    [ValidateSet("chrome", "firefox")]
    [string]$Browser = "chrome"
)

$extensionPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath      = Split-Path -Parent $extensionPath
$manifestSrc   = Join-Path $extensionPath "manifest.$Browser.json"
$outputZip     = Join-Path $rootPath "memkeypass-$Browser.zip"
$tempFolder    = Join-Path $rootPath "temp_extension_build"

Write-Host ""
Write-Host "Packaging MemKeyPass pour $Browser..." -ForegroundColor Cyan
Write-Host ""

# Verifications
if (-not (Test-Path $manifestSrc)) {
    Write-Host "Erreur : manifest.$Browser.json introuvable." -ForegroundColor Red
    exit 1
}

$requiredIcons = @("icon16.png", "icon32.png", "icon48.png", "icon128.png")
$missingIcons  = $requiredIcons | Where-Object { -not (Test-Path (Join-Path $extensionPath "icons\$_")) }
if ($missingIcons) {
    Write-Host "Attention : icones manquantes :" -ForegroundColor Yellow
    $missingIcons | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
    Write-Host "Ouvrez extension/generate-icons.html pour les generer." -ForegroundColor Cyan
    $continue = Read-Host "Continuer quand meme ? (o/N)"
    if ($continue -notin @("o", "O")) { exit 0 }
}

# Nettoyage
if (Test-Path $tempFolder) { Remove-Item $tempFolder -Recurse -Force }
if (Test-Path $outputZip)  { Remove-Item $outputZip  -Force }
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copie du manifest correct -> manifest.json
Copy-Item $manifestSrc (Join-Path $tempFolder "manifest.json")

# Fichiers et dossiers a copier
$items = @("background.js", "content.js", "popup.html", "popup.js", "icons", "src")
foreach ($item in $items) {
    $src  = Join-Path $extensionPath $item
    $dest = Join-Path $tempFolder    $item
    if (Test-Path $src) {
        Copy-Item $src $dest -Recurse
    } else {
        Write-Host "Avertissement : $item introuvable, ignore." -ForegroundColor Yellow
    }
}

# Creation du ZIP
Compress-Archive -Path "$tempFolder\*" -DestinationPath $outputZip -Force
Remove-Item $tempFolder -Recurse -Force

$sizeKB = [math]::Round((Get-Item $outputZip).Length / 1KB, 1)
Write-Host "Package cree : $outputZip ($sizeKB KB)" -ForegroundColor Green
if ($Browser -eq "chrome") {
    Write-Host "Chrome Web Store : https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
} else {
    Write-Host "Firefox Add-ons : https://addons.mozilla.org/developers/" -ForegroundColor Gray
}
Write-Host ""