@echo off
setlocal
echo ==========================================
echo Importando Base de Datos: sima_db
echo ==========================================

:: Nombre del archivo de respaldo
set BACKUP_FILE=sima_db_backup.sql

if not exist %BACKUP_FILE% (
    echo [ERROR] No se encuentra el archivo %BACKUP_FILE%
    echo Asegurate de haber ejecutado primero 'exportar_db.bat' en la otra PC.
    pause
    exit /b
)

:: Crear la base de datos si no existe e importar
echo Creando base de datos 'sima_db' (si no existe)...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS sima_db;"

echo Importando datos...
mysql -u root sima_db < %BACKUP_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo [EXITO] Base de datos importada correctamente.
    echo Ahora puedes ejecutar: python manage.py runserver
) else (
    echo.
    echo [ERROR] No se pudo importar la base de datos.
    echo Asegurate de que MySQL este encendido y que el usuario 'root' no tenga contraseña.
    pause
)

endlocal
pause
