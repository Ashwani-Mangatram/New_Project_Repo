@echo off
setlocal
cd /d "%~dp0"

echo Starting local server from:
echo %cd%
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  py launch_server.py
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python launch_server.py
  goto :eof
)

echo Python is not installed or not on PATH.
echo Install Python from https://www.python.org/downloads/
pause
