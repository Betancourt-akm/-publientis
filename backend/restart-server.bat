@echo off
echo ========================================
echo REINICIANDO SERVIDOR BACKEND
echo ========================================
echo.

echo [1/3] Deteniendo procesos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Limpiando puertos...
FOR /F "tokens=5" %%A IN ('netstat -aon ^| findstr ":8070.*LISTENING"') DO (
    echo Liberando proceso %%A en puerto 8070...
    taskkill /F /PID %%A >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo Servidor iniciando en puerto 8070...
echo Presiona Ctrl+C para detener
echo ========================================
echo.

npm start

pause
