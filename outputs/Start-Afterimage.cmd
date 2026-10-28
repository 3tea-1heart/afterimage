@echo off
cd /d "%~dp0"
if exist "E:\NodeJS\node.exe" (
  "E:\NodeJS\node.exe" "%~dp0local-server.cjs"
) else (
  node "%~dp0local-server.cjs"
)
pause
