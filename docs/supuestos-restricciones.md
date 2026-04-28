## 4. Registro de supuestos y restricciones

| ID | Categoría | Restricción / Supuesto | Estado | Comentarios | Impacto |
|----|-----------|------------------------|--------|--------------|---------|
| R1 | Académico | Existencia de cruces de horarios entre cursos | Activo | Problema principal que el sistema busca resolver. Los estudiantes no pueden matricular cursos con horarios superpuestos | Alto |
| R2 | Académico | Restricciones por secuencia de cursos (prerrequisitos no aprobados) | Activo | Limita la selección de cursos. No se permite matricular un curso sin haber aprobado su prerrequisito | Alto |
| R3 | Académico | Límite de créditos permitidos por ciclo | Activo | Restricción institucional. Máximo de 24 créditos por ciclo académico según normativa universitaria | Medio |
| R4 | Académico | Disponibilidad limitada de secciones | Activo | Puede afectar la generación de horarios. Cada curso tiene un número limitado de secciones y cupos | Alto |
| R5 | Académico | Jalarse un curso implica un aumento de 1 crédito | Activo | Restricción institucional. El estudiante debe pagar crédito adicional al repetir un curso. Afecta el cálculo de carga académica | Bajo |
| R6 | Datos | No se cuenta con acceso a datos reales de la universidad | Activo | Uso de datos simulados. Se generarán datos sintéticos que representen el comportamiento real | Medio |
| S1 | Datos | Se utilizarán datos simulados de cursos y horarios | Activo | No se cuenta con acceso a datos reales. Los datos simulados incluyen: cursos (40), horarios (8-10 por curso), docentes y aulas | Medio |
| S2 | Usuarios | Los estudiantes tienen acceso a internet | Activo | Necesario para el uso del sistema. Se asume conectividad básica (mínimo 2 Mbps) para acceder a la plataforma web | Alto |
| S3 | Tecnología | El sistema será utilizado en navegadores modernos | Activo | Compatible con Chrome (90+), Edge (90+) y Firefox (88+). No soporta Internet Explorer. Se recomienda mantener actualizado | Bajo |
| S4 | Uso | Los usuarios tienen conocimientos básicos de uso web | Activo | Facilita la interacción. Se asume que los estudiantes saben navegar entre páginas, hacer clic en botones y llenar formularios básicos | Bajo |
