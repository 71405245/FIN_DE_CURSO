@echo off
setlocal
echo ==========================================
echo Restaurando Base de Datos MongoDB: sima_db
echo ==========================================

:: Directorio del respaldo
set BACKUP_DIR=sima_db_backup\sima_db

if not exist "%BACKUP_DIR%" (
    echo [ERROR] No se encontro la carpeta de respaldo en: %BACKUP_DIR%
    echo Asegurate de que el respaldo exportado este en esa ubicacion.
    pause
    exit /b 1
)

:: Intenta ejecutar mongorestore
mongorestore --db sima_db --drop "%BACKUP_DIR%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [EXITO] Base de datos restaurada correctamente desde el respaldo.
) else (
    echo.
    echo [ERROR] No se pudo restaurar la base de datos.
    echo Asegurate de que MongoDB este instalado y sus herramientas de comando ^(mongorestore^) esten en las variables de entorno.
    echo.
)

endlocal
pause
