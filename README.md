# 🎓 SIMA — Sistema Inteligente de Matrícula Académica

> Plataforma web inteligente que optimiza la gestión académica universitaria mediante inteligencia artificial, generando horarios personalizados, planificando eficientemente las aulas y apoyando la asignación docente considerando restricciones académicas, operativas y criterios de sostenibilidad.

---

## 📋 Tabla de Contenido

1. [Nombre del Proyecto](#1-nombre-del-proyecto)
2. [Integrantes del Equipo](#2-integrantes-del-equipo)
3. [Problemática Abordada](#3-problemática-abordada)
4. [Justificación del PMV](#4-justificación-del-pmv)
5. [Tecnologías Utilizadas](#5-tecnologías-utilizadas)
6. [Arquitectura del Sistema](#6-arquitectura-del-sistema)
7. [Instrucciones de Instalación](#7-instrucciones-de-instalación)
8. [Instrucciones de Build y Despliegue](#8-instrucciones-de-build-y-despliegue)
9. [Documentación del Proyecto](#9-documentación-del-proyecto)

---

## 1. Nombre del Proyecto

**SIMA — Sistema Inteligente de Matrícula Académica**

Sistema web full-stack (MERN) diseñado para simplificar y optimizar el proceso de matrícula universitaria mediante un motor de inteligencia artificial que genera horarios óptimos sin cruces, adapta la carga académica según el rendimiento del estudiante y monitorea los recursos del servidor en tiempo real.

---

## 2. Integrantes del Equipo

<div align="center">
<table>
<tr>

<td align="center">
<img src="docs/inicio/img/kevin.jpg" width="150px" alt="Kevin Cornejo" /><br/>
<b>Kevin Sebastian Cornejo Garcia</b><br/>
DNI: 73144637<br/>
<a href="mailto:73144637@continental.edu.pe">73144637@continental.edu.pe</a><br/>
🔧 Scrum Master
</td>

<td align="center">
<img src="docs/inicio/img/jordan.jpg" width="150px" alt="Jordan Acevedo" /><br/>
<b>Jordan Smith Acevedo Ura</b><br/>
DNI: 71405245<br/>
<a href="mailto:71405245@continental.edu.pe">71405245@continental.edu.pe</a><br/>
💻 Developer
</td>

<td align="center">
<img src="docs/inicio/img/liand.jpg" width="150px" alt="Liand Mejia" /><br/>
<b>Liand Anthuane Mejia Poma</b><br/>
DNI: 72455406<br/>
<a href="mailto:72455406@continental.edu.pe">72455406@continental.edu.pe</a><br/>
📋 Product Owner
</td>

</tr>
</table>
</div>

📄 Ver ficha completa del equipo: [docs/inicio/equipo-proyecto.md](docs/inicio/equipo-proyecto.md)

---

## 3. Problemática Abordada

El proceso de matrícula académica en entornos universitarios es crítico pero suele estar gestionado con sistemas poco inteligentes. Los estudiantes enfrentan superposición de horarios, desconocimiento de prerrequisitos y falta de recomendaciones personalizadas, generando retrasos en su progreso académico y estrés innecesario.

Las instituciones, por su parte, carecen de herramientas que integren la planificación docente, la capacidad de aulas y las preferencias del alumno en un único flujo automatizado.

**Problema central:** ¿Cómo optimizar el proceso de planificación de matrícula académica mediante un sistema inteligente que genere y recomiende horarios adecuados, respetando restricciones académicas y operativas?

📄 Detalle completo: [docs/inicio/Problema.md](docs/inicio/Problema.md)

---

## 4. Justificación del PMV

El **Producto Mínimo Viable (PMV) v1.0.0** de SIMA entrega las funcionalidades esenciales que validan la propuesta de valor del sistema:

- **Motor de IA funcional:** Algoritmo de Búsqueda en Profundidad (DFS) con Backtracking que genera hasta 5 alternativas de horario óptimas sin cruces en menos de 1 segundo.
- **Tres portales de usuario:** Dashboards diferenciados para Administrador, Docente y Estudiante, con autenticación basada en roles (JWT).
- **Gestión académica completa:** CRUD de Carreras, Cursos, Secciones, Docentes y Estudiantes con importación masiva desde CSV.
- **Calidad y seguridad validadas:** Análisis SonarQube (0 vulnerabilidades, calificación A), cumplimiento OWASP Top 10, accesibilidad WCAG 2.1 AA y usabilidad SUS score 85.75/100.
- **Sostenibilidad:** Optimizaciones de Green Code que reducen el tráfico de peticiones en un 66.6% y suspenden el polling cuando la pestaña está inactiva.

📄 Detalle completo: [docs/inicio/vision.md](docs/inicio/vision.md) | [docs/inicio/enfoque-proyecto.md](docs/inicio/enfoque-proyecto.md)

---

## 5. Tecnologías Utilizadas

### Stack Principal (MERN)

| Capa | Tecnología | Propósito |
|---|---|---|
| **Frontend** | React + Vite | Interfaz de usuario reactiva y modular |
| **Backend** | Node.js + Express | Servidor HTTP y API REST |
| **Base de Datos** | MongoDB + Mongoose | Persistencia NoSQL con ODM |
| **Estilos** | Vanilla CSS | Diseño personalizado sin frameworks |

### Calidad, Seguridad y Sostenibilidad

| Herramienta | Propósito |
|---|---|
| JWT + Bcryptjs | Autenticación y encriptación de contraseñas |
| Helmet + express-rate-limit | Seguridad HTTP y protección contra fuerza bruta |
| SonarQube v10.7 | Análisis estático de código (calificación A, 0 vulnerabilidades) |
| Jest + Vitest | Pruebas unitarias (backend y frontend) |
| Cypress + Playwright | Pruebas E2E |
| Green Software | Optimizaciones de sostenibilidad y reducción de CO₂ |

### Estándares Aplicados

![OWASP](https://img.shields.io/badge/Seguridad-OWASP%20Top%2010-red)
![SonarQube](https://img.shields.io/badge/Calidad-SonarQube-orange)
![WCAG](https://img.shields.io/badge/Accesibilidad-WCAG%202.1%20AA-blue)
![SUS](https://img.shields.io/badge/Usabilidad-SUS%2085.75%2F100-purple)
![Green](https://img.shields.io/badge/Software-Green%20Code-success)
![ISO](https://img.shields.io/badge/Estándar-ISO%2025010-lightgrey)

---

## 6. Arquitectura del Sistema

SIMA sigue una **arquitectura por capas** separada en dos aplicaciones independientes:

```
frontend/           ← Capa de Presentación (React + Vite, puerto 5173)
│   src/
│   ├── components/ ← Componentes reutilizables (admin, paneles)
│   ├── pages/      ← Vistas por rol (Login, AdminDashboard, etc.)
│   └── tests/      ← Pruebas unitarias y E2E

backend/            ← Capa de Lógica de Negocio y Acceso a Datos (Node.js, puerto 5000)
│   ├── controllers/ ← Lógica de negocio por módulo
│   ├── models/      ← Esquemas Mongoose (User, Curso, Seccion, etc.)
│   ├── routes/      ← Definición de endpoints REST
│   ├── middleware/  ← Autenticación JWT y captura de errores
│   ├── services/    ← Motor de IA (schedulerService.js — DFS + Backtracking)
│   └── tests/       ← Suite de 50 pruebas unitarias (Jest)
```

**Flujo de comunicación:**
```
Navegador → React (Vite) → Axios → Express API → Mongoose → MongoDB
```

📄 Documento completo de arquitectura: [docs/ejecucion/arquitectura.md](docs/ejecucion/arquitectura.md)
📄 Diagrama entidad-relación: [docs/ejecucion/diagrama-entidad–relacion.md](docs/ejecucion/diagrama-entidad–relacion.md)

---

## 7. Instrucciones de Instalación

### Prerrequisitos

- **Node.js** v18.x o superior → [nodejs.org](https://nodejs.org/)
- **MongoDB Community Server** v6.0+ corriendo en `localhost:27017` → [mongodb.com](https://www.mongodb.com/try/download/community)
- **Git** → [git-scm.com](https://git-scm.com/)

### Clonar el repositorio

```bash
git clone https://github.com/71405245/FIN_DE_CURSO.git
cd FIN_DE_CURSO
```

### Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
# En la raíz del proyecto
copy .env.example backend/.env
```

Editar `backend/.env` con los valores reales:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sima_db
MONGODB_URI=mongodb://localhost:27017/sima_db
JWT_SECRET=tu_secreto_seguro_aqui
NODE_ENV=development
```

### Instalar dependencias del Backend

```bash
cd backend
npm install
```

### Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

📄 Guía completa de instalación: [docs/ejecucion/installation.md](docs/ejecucion/installation.md)

---

## 8. Instrucciones de Build y Despliegue

### Modo desarrollo (recomendado para evaluación)

Abrir **dos terminales** desde la raíz del proyecto:

**Terminal 1 — Backend (puerto 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (puerto 5173):**
```bash
cd frontend
npm run dev
```

Acceder desde el navegador a: **[http://localhost:5173](http://localhost:5173)**

**Credenciales de administrador:**
- Correo: `admin@sima.com`
- Contraseña: `123456789`

### Sembrado inicial de datos (opcional)

Para poblar la base de datos con datos de prueba reales (3,000 estudiantes, 80 docentes, 1,000 secciones):

```bash
cd backend
node seeders/importarEstudiantes.js --limpiar
node seeders/importarDocentes.js --limpiar
node seeders/generarHorariosYSalones.js --limpiar
```

### Ejecutar pruebas

```bash
# Pruebas backend (Jest — 50 pruebas)
cd backend && npm test

# Pruebas frontend (Vitest)
cd frontend && npm test

# Pruebas E2E (Playwright)
cd frontend && npx playwright test
```

### Build de producción

```bash
cd frontend
npm run build
# Los archivos estáticos se generan en frontend/dist/
```

### 🎥 Video explicativo del proyecto

[![Ver video demostrativo](https://img.shields.io/badge/▶_Ver_Demo-YouTube-red)](PEGAR_URL_AQUI)

> Video demostrativo (máximo 5 minutos) mostrando el funcionamiento completo de SIMA v1.0.0.

---

## 9. Documentación del Proyecto

La documentación completa está organizada en la carpeta [`docs/`](docs/) siguiendo las áreas de conocimiento del **PMBOK**:

| Área PMBOK | Carpeta | Contenido Principal |
|---|---|---|
| 🚀 **Inicio** | [`docs/inicio/`](docs/inicio/) | Acta de Constitución, Project Charter, Visión, Problemática, Equipo |
| 📅 **Planificación** | [`docs/planificacion/`](docs/planificacion/) | Requerimientos, Backlogs, Cronograma, Riesgos, Presupuesto |
| 💻 **Ejecución** | [`docs/ejecucion/`](docs/ejecucion/) | Arquitectura, API, Algoritmos de IA, Minutas, Informes de Estado |
| 🔍 **Seguimiento y Control** | [`docs/seguimiento_control/`](docs/seguimiento_control/) | Pruebas, SonarQube, OWASP, WCAG, SUS, Métricas de Calidad |
| 🏁 **Cierre** | [`docs/cierre/`](docs/cierre/) | Informe Final, Lecciones Aprendidas, SOW |
| 📂 **Otros** | [`docs/otros/`](docs/otros/) | Agentes, Mejoras, Guías adicionales |
