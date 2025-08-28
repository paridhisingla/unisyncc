@echo off
echo Starting UniSync Campus Management System...
echo.

echo Starting MongoDB (if not running)...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 3

echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo All servers are starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
