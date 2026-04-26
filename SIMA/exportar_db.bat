@echo off
setlocal
echo ==========================================
echo Exportando Base de Datos: sima_db
echo ==========================================

:: Nombre del archivo de respaldo
set BACKUP_FILE=sima_db_backup.sql

:: Intenta ejecutar mysqldump
mysqldump -u root sima_db > %BACKUP_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo [EXITO] Respaldo creado correctamente: %BACKUP_FILE%
    echo Copia este archivo a tu otra PC junto con el resto del proyecto.
) else (
    echo.
    echo [ERROR] No se pudo exportar la base de datos.
    echo Asegurate de que MySQL (XAMPP/WAMP) este encendido y que 'mysqldump' este en tu PATH.
    echo.
    pause
)

endlocal
pause
