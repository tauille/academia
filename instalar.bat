@echo off
chcp 65001 >nul
title Instalador itrainer
echo ============================================
echo   Instalador do projeto itrainer
echo ============================================
echo.
echo Criando pastas e arquivos...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
echo.
pause