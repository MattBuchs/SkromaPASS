# Script pour packager l'extension MemKeyPass
# Crée un fichier ZIP prêt pour la publication

Write-Host "📦 Packaging de l'extension MemKeyPass..." -ForegroundColor Green
Write-Host ""

$extensionPath = "extension"
$outputPath = "memkeypass-extension.zip"

# Vérifier que le dossier extension existe
if (-not (Test-Path $extensionPath)) {
    Write-Host "❌ Erreur: Le dossier 'extension' n'existe pas" -ForegroundColor Red
    exit 1
}

# Vérifier que les icônes existent
$iconsPath = Join-Path $extensionPath "icons"
$requiredIcons = @("icon16.png", "icon32.png", "icon48.png", "icon128.png")
$missingIcons = @()

foreach ($icon in $requiredIcons) {
    $iconPath = Join-Path $iconsPath $icon
    if (-not (Test-Path $iconPath)) {
        $missingIcons += $icon
    }
}

if ($missingIcons.Count -gt 0) {
    Write-Host "⚠️  Attention: Icônes manquantes:" -ForegroundColor Yellow
    foreach ($icon in $missingIcons) {
        Write-Host "   - $icon" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "💡 Ouvrez extension/generate-icons.html pour les générer" -ForegroundColor Cyan
    Write-Host ""
    
    $continue = Read-Host "Continuer quand même? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        exit 0
    }
}

# Supprimer l'ancien ZIP s'il existe
if (Test-Path $outputPath) {
    Remove-Item $outputPath
    Write-Host "🗑️  Ancien package supprimé" -ForegroundColor Gray
}

# Fichiers à inclure
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "icons/*"
)

# Créer le ZIP
Write-Host "📁 Création de l'archive..." -ForegroundColor Cyan

try {
    # Créer un dossier temporaire
    $tempFolder = "temp_extension_package"
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempFolder | Out-Null

    # Copier les fichiers nécessaires
    foreach ($pattern in $filesToInclude) {
        $sourcePath = Join-Path $extensionPath $pattern
        
        if ($pattern -match '\*') {
            # C'est un pattern avec wildcard
            $folderName = Split-Path $pattern -Parent
            if ($folderName) {
                $destFolder = Join-Path $tempFolder $folderName
                if (-not (Test-Path $destFolder)) {
                    New-Item -ItemType Directory -Path $destFolder | Out-Null
                }
                $files = Get-ChildItem -Path (Join-Path $extensionPath $folderName) -File
                foreach ($file in $files) {
                    Copy-Item $file.FullName -Destination $destFolder
                }
            }
        } else {
            # Fichier unique
            if (Test-Path $sourcePath) {
                Copy-Item $sourcePath -Destination $tempFolder
            }
        }
    }

    # Créer le ZIP
    Compress-Archive -Path "$tempFolder\*" -DestinationPath $outputPath -Force

    # Nettoyer
    Remove-Item $tempFolder -Recurse -Force

    Write-Host ""
    Write-Host "✅ Package créé avec succès!" -ForegroundColor Green
    Write-Host "📦 Fichier: $outputPath" -ForegroundColor White
    
    # Afficher la taille
    $fileSize = (Get-Item $outputPath).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "📊 Taille: $fileSizeKB KB" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Testez l'extension localement" -ForegroundColor White
    Write-Host "   2. Uploadez sur Chrome Web Store Developer Dashboard" -ForegroundColor White
    Write-Host "   3. Remplissez les informations requises" -ForegroundColor White
    Write-Host "   4. Soumettez pour review" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Chrome Web Store: https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "❌ Erreur lors de la création du package: $_" -ForegroundColor Red
    exit 1
}
