@echo off
setlocal
echo ==========================================
echo Exportando Base de Datos MongoDB: sima_db
echo ==========================================

:: Directorio donde se guardara el respaldo
set BACKUP_DIR=sima_db_backup

:: Intenta ejecutar mongodump
mongodump --db sima_db --out "%BACKUP_DIR%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [EXITO] Respaldo creado correctamente en la carpeta: %BACKUP_DIR%\sima_db
    echo Copia la carpeta "%BACKUP_DIR%" a tu otra PC junto con el resto del proyecto.
) else (
    echo.
    echo [ERROR] No se pudo exportar la base de datos.
    echo Asegurate de que MongoDB este instalado y sus herramientas de comando ^(mongodump^) esten en las variables de entorno.
    echo.
)

endlocal
pause
