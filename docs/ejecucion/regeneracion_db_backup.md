# Guía de Respaldos de Base de Datos (MongoDB)

Este documento detalla el procedimiento para exportar e importar la base de datos `sima_db` del sistema **SIMA** utilizando los scripts provistos en el repositorio.

---

## ⚠️ Políticas de Control de Versiones (Git)

Para cumplir con las buenas prácticas de desarrollo:
- **La carpeta `otros/sima_db_backup/` está excluida del repositorio (añadida a `.gitignore`)**.
- Los volcados de bases de datos de desarrollo contienen datos masivos (como la carga de 3,000 estudiantes y sus calificaciones) y archivos binarios pesados que inflarían el repositorio de Git permanentemente.
- No se deben versionar datos reales o sensibles de usuarios (como correos y contraseñas hasheadas) por razones de seguridad de la información.

---

## 🛠️ Requisitos Previos

Para ejecutar los scripts de respaldo, debes contar con **MongoDB Database Tools** instalado y configurado en las variables de entorno (`PATH`) de tu sistema operativo.
- Estas herramientas incluyen `mongodump` y `mongorestore`.
- Puedes descargarlas desde el sitio oficial de MongoDB: [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools).

---

## 📥 Exportar la Base de Datos (Backup)

Para generar una copia de seguridad actual de la base de datos local `sima_db` (MongoDB):

1. Abre una terminal o explorador de archivos y navega a la carpeta `otros/` en la raíz del proyecto.
2. Ejecuta el script:
   - En Windows: ejecuta [exportar_db.bat](file:///d:/FIN_DE_CURSO/otros/exportar_db.bat) haciendo doble clic o desde PowerShell/CMD:
     ```cmd
     cd otros
     exportar_db.bat
     ```
3. El script creará (o actualizará) la carpeta local `otros/sima_db_backup/sima_db/` conteniendo los archivos en formato BSON y JSON correspondientes a las colecciones.

---

## 📤 Importar la Base de Datos (Restauración)

Para restaurar una copia de seguridad previamente generada e inicializar tu instancia local de MongoDB con la estructura y datos maestros de SIMA:

1. Asegúrate de tener la carpeta `sima_db_backup/sima_db` dentro del directorio `otros/`.
2. Ejecuta el script:
   - En Windows: ejecuta [importar_db.bat](file:///d:/FIN_DE_CURSO/otros/importar_db.bat) haciendo doble clic o desde PowerShell/CMD:
     ```cmd
     cd otros
     importar_db.bat
     ```
3. El script usará `mongorestore` con la bandera `--drop`, lo que **eliminará las colecciones existentes en tu base de datos local `sima_db` antes de restaurar** para evitar conflictos de claves primarias o datos duplicados.
