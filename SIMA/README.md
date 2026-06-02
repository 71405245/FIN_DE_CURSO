# SIMA — Sistema Integral de Matrícula Académica 🎓

Este repositorio contiene la versión modernizada y de alto rendimiento de la plataforma **SIMA**, desarrollada bajo un stack tecnológico moderno y eficiente: **React (Vite) en el Frontend, Node.js (Express) en el Backend y MongoDB como Base de Datos**.

Sigue esta guía paso a paso para clonar, configurar e iniciar el sistema en cualquier computadora desde cero.

---

## 💻 Requisitos del Sistema (Prerrequisitos)

Antes de comenzar, asegúrate de tener instalado lo siguiente en la nueva PC:

1. **Node.js (LTS):** Versión `18.x`, `20.x` o superior. [Descargar Node.js](https://nodejs.org/).
2. **MongoDB Community Server:** Instancia de base de datos local corriendo en el puerto por defecto `27017`. [Descargar MongoDB](https://www.mongodb.com/try/download/community).
3. **MongoDB Compass (Recomendado):** Interfaz gráfica para gestionar y visualizar las colecciones. [Descargar Compass](https://www.mongodb.com/try/download/compass).
4. **Git (Opcional):** Para control de versiones o clonar la carpeta.

---

## 🛠️ Instalación y Configuración Inicial

### 1. Descargar o Copiar el Proyecto
Copia la carpeta completa del proyecto `SIMA` en tu nueva PC.

### 2. Configurar el Backend (Servidor)
Abre una terminal en la raíz del proyecto y sigue estos comandos:

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar todas las dependencias
npm install
```

#### Crear Archivo de Variables de Entorno (`.env`)
Dentro de la carpeta `backend`, crea un archivo llamado `.env` y copia lo siguiente:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sima_db
```

### 3. Configurar el Frontend (Cliente)
Abre otra terminal o navega de vuelta a la raíz y dirígete al frontend:

```bash
# Navegar a la carpeta del frontend
cd ../frontend

# Instalar todas las dependencias
npm install
```

---

## ⚡ Carga Masiva y Sembrado de Datos (Seeders)

Para que el sistema esté completamente operativo con miles de datos académicos reales, hemos diseñado un conjunto de scripts de siembra automatizada en el backend. 

Abre una terminal en la carpeta `backend` y ejecuta los siguientes comandos en orden:

### Paso 1: Importar Alumnos (3,000 Estudiantes)
Importa masivamente a los 3,000 estudiantes del archivo CSV resolviendo inteligentemente sus respectivas carreras:
```bash
node seeders/importarEstudiantes.js --limpiar
```

### Paso 2: Importar Docentes (80 Profesores Especializados)
Importa masivamente a los 80 docentes del archivo CSV asignándoles especialidades cruzadas inteligentes basadas en su área profesional:
```bash
node seeders/importarDocentes.js --limpiar
```

### Paso 3: Generar Horarios, Aulas y Secciones (1,000 Clases)
Genera 1,000 salones/secciones sin conflictos en 250 aulas físicas (desde A101 a J505) en turnos consecutivos de 1.5h a 3h (Lunes a Domingo, de 7 AM a 10 PM):
```bash
node seeders/generarHorariosYSalones.js --limpiar
```

---

## 🚀 Iniciar la Aplicación en Modo de Desarrollo

Una vez instaladas las dependencias y sembrada la base de datos, inicia ambos servidores:

### 1. Iniciar Servidor Backend (Puerto 5000)
En la terminal de `backend`:
```bash
npm run dev
```

### 2. Iniciar Servidor Frontend (Puerto 5173)
En la terminal de `frontend`:
```bash
npm run dev
```

### 3. Acceder al Sistema
Abre tu navegador web e ingresa a:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Credenciales de Acceso Administrador

Para acceder al Panel de Control administrativo completo con estadísticas en tiempo real:

* **Correo Electrónico:** `admin@sima.com`
* **Contraseña:** `123456789`

---

## 📂 Estructura Principal del Proyecto

* **`/backend`:** Servidor Node.js/Express, modelos de Mongoose, controladores y scripts seeders (`/seeders`).
* **`/frontend`:** Cliente React/Vite, componentes administrativos premium y dashboards en tiempo real.
* **`/legacy_django`:** Respaldos del sistema heredado antiguo en Django.
