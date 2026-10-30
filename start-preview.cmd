@echo off
cd /d "%~dp0"
echo Preview: http://localhost:4321/
echo Contact mode is configured in .env. Live email requires a Resend API key.
echo Press Ctrl+C to stop.
node server.mjs
pause
