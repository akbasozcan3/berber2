@echo off
title New Life Kuafor - Site
cd /d "%~dp0"

echo.
echo  =======================================
echo   New Life Erkek Kuaförü
echo  =======================================
echo.
echo  Gelistirme modu baslatiliyor...
echo  (npm run build KULLANILMIYOR — bilgisayari yormaz)
echo.
echo  Tarayicida acin: http://localhost:3000
echo  Admin panel:     http://localhost:3000/admin
echo.
echo  Durdurmak icin bu pencereyi kapatin veya Ctrl+C basin.
echo.

npm run dev
pause
