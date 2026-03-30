
# 🏗 Arquitectura

El sistema está basado en el patrón **MVC (Modelo - Vista - Controlador)** implementado con Django.

---

## 🔹 Capas del sistema

### 📦 Modelos (Models)

- Usuario
- Curso
- Ciclo
- Sección
- Matrícula
- Prerrequisitos

---

### 🎨 Vistas (Templates)

- Login
- Dashboard
- Cursos
- Horario
- Panel Admin

---

### ⚙️ Controladores (Views)

- Gestión de login
- Lógica de matrícula
- Validaciones
- Generación de PDF

---

## 🔹 Flujo de datos

Usuario → Vista → View → Modelo → Base de datos

---

## 🔹 Características

- Arquitectura modular
- Separación de responsabilidades
- Escalable
- Basado en Django ORM