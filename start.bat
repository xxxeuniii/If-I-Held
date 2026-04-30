@echo off
setlocal

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is not available. Please reinstall Node.js.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
  )
)

echo [INFO] Starting Vite dev server...
call npm run dev

if errorlevel 1 (
  echo [ERROR] Failed to start dev server.
  pause
  exit /b 1
)

endlocal
