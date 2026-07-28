@echo off
title New Life Kuafor - Site
cd /d "%~dp0"

echo.
echo  =======================================
echo   New Life Erkek Kuaförü
echo  =======================================
echo.

if not exist ".next\standalone\server.js" (
  echo  Ilk calistirma: site derleniyor, lutfen bekleyin...
  echo.
  call npm run build
  if errorlevel 1 (
    echo.
    echo  HATA: Derleme basarisiz. PostgreSQL calisiyor mu kontrol edin.
    pause
    exit /b 1
  )
  echo.
)

echo  Site baslatiliyor...
echo  Tarayicida acin: http://localhost:3000
echo  Admin panel:     http://localhost:3000/admin
echo.
echo  Yeniden derlemek icin once bu pencereyi kapatin (npm run build).
echo.
echo  Durdurmak icin bu pencereyi kapatin veya Ctrl+C basin.
echo.

npm run start
pause
