# setup-windows.ps1
# Windows 11 ZBook Automated Setup Script for Agentic Web Compiler

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 Initializing Agentic Web Compiler workspace on Windows 11" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Create Required Directory Structure
$directories = @("briefs", "output", "config", "prompts")

foreach ($dir in $directories) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "📁 Created directory: .\$dir" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Directory exists: .\$dir" -ForegroundColor Gray
    }
}

# 2. Create Sample Client Brief JSON Files
$sampleBriefs = @{
    "briefs\ondriv-mobility.json" = @{
        name = "Ondriv Mobility"
        vertical = "tech"
        brief = "Create a smart tech landing page for Ondriv Mobility brand identity"
        palette = "#030303,#26A58A"
        output = "ondriv-mobility.html"
    }
    "briefs\roobinium-fashion.json" = @{
        name = "Roobinium Wear"
        vertical = "fashion"
        brief = "Create a modern fashion e-commerce landing page with clothing rail navigation"
        palette = "#E2DED2,#6D5C91"
        output = "roobinium-fashion.html"
    }
    "briefs\solitaire-jewelry.json" = @{
        name = "Solitaire Atelier"
        vertical = "jewelry"
        brief = "Create a luxury jewelry landing page for fine rings and artisanal collections"
        palette = "#140B06,#5E4130"
        output = "solitaire-jewelry.html"
    }
    "briefs\artist-portfolio.json" = @{
        name = "Alex Vance Portfolio"
        vertical = "portfolio"
        brief = "Create an actress and creative performer resume portfolio"
        palette = "#0F172A,#38BDF8"
        output = "artist-portfolio.html"
    }
    "briefs\wedding-celebration.json" = @{
        name = "Matrimonial Celebration"
        vertical = "wedding"
        brief = "Create a wedding event landing page with RSVP collection and schedule"
        palette = "#FFFDF7,#D4AF37"
        output = "wedding-celebration.html"
    }
}

foreach ($filePath in $sampleBriefs.Keys) {
    if (-not (Test-Path -Path $filePath)) {
        $sampleBriefs[$filePath] | ConvertTo-Json -Depth 4 | Set-Content -Path $filePath -Encoding UTF8
        Write-Host "📝 Created sample brief: $filePath" -ForegroundColor Green
    }
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "✨ Setup complete! Next steps for your Windows 11 ZBook:" -ForegroundColor Green
Write-Host "1. Start real-time watcher: node watch-briefs.js" -ForegroundColor White
Write-Host "2. Or run Docker build:      docker compose up --build" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
