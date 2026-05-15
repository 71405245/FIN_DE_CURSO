# Guía de Migración del Proyecto SIMA

Para llevar el proyecto a otra computadora y que funcione con todos tus datos, sigue estos pasos:

## 1. En la PC Original (Donde está el proyecto ahora)

1.  Asegúrate de que **MySQL** esté encendido (en XAMPP, WAMP, etc.).
2.  Haz doble clic en el archivo `exportar_db.bat`.
3.  Se creará un archivo llamado `sima_db_backup.sql`.
4.  Copia **toda la carpeta del proyecto** (incluyendo el archivo `.sql`) a una memoria USB o súbelo a la nube.

## 2. En la Nueva PC

### Requisitos Previos
1.  Instala **Python** (recomendado 3.10 o superior).
2.  Instala **MySQL** (puedes usar [XAMPP](https://www.apachefriends.org/es/index.html)).
3.  Asegúrate de que MySQL esté encendido.

### Pasos de Instalación
1.  Pega la carpeta del proyecto en la nueva PC.
2.  Abre una terminal (CMD o PowerShell) en la carpeta del proyecto.
3.  Crea un entorno virtual e instala las librerías:
    ```bash
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```
4.  **Importar la Base de Datos**:
    - Haz doble clic en `importar_db.bat`. Esto creará la base de datos `sima_db` y cargará tus datos.
5.  **Ejecutar el Proyecto**:
    - En la terminal (con el entorno activado):
    ```bash
    python manage.py runserver
    ```

---

## Solución de Problemas
- **Error "mysql no se reconoce como un comando interno"**: Debes agregar la carpeta `bin` de MySQL (ejemplo: `C:\xampp\mysql\bin`) a las Variables de Entorno (PATH) de Windows.
- **Configuración de DB**: Si en la nueva PC usas una contraseña para el usuario `root`, deberás actualizarla en `core/settings.py`.
