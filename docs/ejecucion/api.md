# 🔌 API del Sistema SIMA

El sistema SIMA expone una **API REST construida con Node.js + Express**, la cual permite la comunicación entre el frontend (React + Vite) y el backend, gestionando la lógica de negocio del sistema académico.

---

## 🔹 1. Tipo de arquitectura API

- Arquitectura: **API REST**
- Backend: **Node.js + Express**
- Base de datos: **MongoDB**
- Comunicación: **JSON sobre HTTP**
- Uso: Interno entre frontend y backend

---

## 🔐 2. Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión del usuario |
| POST | `/api/auth/logout` | Cierre de sesión |
| GET | `/api/auth/me` | Obtener usuario autenticado |

---

## 📊 3. Dashboard

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/dashboard` | Obtener métricas generales del sistema |

---

## 📚 4. Gestión de cursos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/cursos` | Listar cursos disponibles |
| POST | `/api/cursos` | Crear nuevo curso |
| PUT | `/api/cursos/:id` | Actualizar curso |
| DELETE | `/api/cursos/:id` | Eliminar curso |

---

## 🧾 5. Matrícula académica

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/matricula` | Registrar matrícula |
| GET | `/api/matricula/:estudianteId` | Obtener matrículas por estudiante |
| GET | `/api/matricula` | Listar todas las matrículas |

---

## 📅 6. Horarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/horarios` | Obtener horarios generados |
| POST | `/api/horarios/generar` | Generar horario con IA |
| GET | `/api/horarios/descargar/:id` | Descargar horario en PDF |

---

## 🛠 7. Administración del sistema

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/usuarios` | Listar usuarios del sistema |
| POST | `/api/admin/estudiantes` | Crear estudiante |
| GET | `/api/admin/reportes` | Generar reportes administrativos |

---

## 📌 8. Observación técnica

El sistema sigue una arquitectura **RESTful desacoplada**, donde:

- El frontend en React consume la API mediante HTTP.
- El backend en Express centraliza la lógica de negocio.
- MongoDB gestiona la persistencia de datos mediante esquemas (Mongoose).

---

## ⚠️ Nota importante

En versiones iniciales del proyecto se consideró una arquitectura basada en frameworks como Django con vistas tradicionales. Sin embargo, el sistema final implementado corresponde a una **arquitectura moderna MERN basada en API REST**, lo cual reemplaza completamente nuestro enfoque anterior.
