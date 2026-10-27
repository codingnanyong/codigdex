@echo off
setlocal
cd /d "%~dp0"
if exist "mobile\.tmp-qa\runtime\node.exe" set "PATH=%~dp0mobile\.tmp-qa\runtime;%PATH%"
if exist "tools\node\node.exe" set "PATH=%~dp0tools\node;%PATH%"
node --version >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.x is required. Install it or place the portable runtime in tools\node.
  pause
  exit /b 1
)
node scripts\mobile-qa.mjs %*
if errorlevel 1 pause
