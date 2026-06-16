# 3.3 Interpretación de Métricas SonarQube

La evaluación realizada mediante SonarQube permitió identificar diversos problemas relacionados con la calidad, seguridad y mantenibilidad del sistema. El análisis de las métricas obtenidas proporcionó información objetiva para determinar el estado inicial del proyecto y establecer las acciones de mejora necesarias.

---

## Vulnerabilities

Las vulnerabilidades representan fallos de seguridad que pueden ser explotados por atacantes para comprometer la confidencialidad, integridad o disponibilidad del sistema.

### Resultado Inicial

- Vulnerabilities: **23**

### Interpretación

La presencia de 23 vulnerabilidades evidenciaba un nivel de riesgo elevado para la aplicación. Estas incidencias podían estar asociadas a prácticas inseguras de programación, validaciones insuficientes, manejo incorrecto de datos sensibles o configuraciones vulnerables.

La existencia de este número de vulnerabilidades indicaba la necesidad de aplicar medidas correctivas inmediatas para reducir la superficie de ataque del sistema y mejorar su nivel de protección frente a amenazas externas.

### Resultado Posterior

- Vulnerabilities: **0**

### Interpretación de la Mejora

La eliminación total de las vulnerabilidades demuestra que las medidas de mitigación implementadas fueron efectivas y permitieron fortalecer significativamente la seguridad del sistema.

---

## Reliability Issues (Bugs)

Los problemas de fiabilidad corresponden a errores que pueden provocar comportamientos inesperados, fallos durante la ejecución o resultados incorrectos.

### Resultado Inicial

- Reliability Issues: **173**

### Interpretación

La cantidad de incidencias detectadas reflejaba una alta probabilidad de errores funcionales dentro del sistema. Entre los problemas identificados se encontraban posibles excepciones no controladas, variables sin uso, condiciones lógicas inconsistentes y estructuras susceptibles de producir fallos en tiempo de ejecución.

Estos problemas afectaban directamente la estabilidad y confiabilidad de la aplicación.

### Resultado Posterior

- Reliability Issues: **27**

### Interpretación de la Mejora

La reducción de los errores de fiabilidad evidencia una mejora considerable en la estabilidad del sistema. La refactorización y corrección de los componentes críticos permitieron disminuir significativamente el riesgo de fallos operativos.

### Porcentaje de Mejora

\[
\frac{173 - 27}{173} \times 100 = 84.4\%
\]

**Mejora obtenida: 84.4 %**

---

## Maintainability Issues (Code Smells)

Los problemas de mantenibilidad representan malas prácticas de desarrollo que dificultan la comprensión, modificación y evolución del software.

### Resultado Inicial

- Maintainability Issues: **297**

### Interpretación

La elevada cantidad de Code Smells evidenciaba una deuda técnica significativa dentro del proyecto. Se detectaron métodos extensos, duplicación de lógica, complejidad innecesaria, dependencias poco optimizadas y problemas de organización del código.

Aunque estos problemas no generan fallos inmediatos, incrementan los costos de mantenimiento y dificultan la escalabilidad del sistema.

### Resultado Posterior

- Maintainability Issues: **18**

### Interpretación de la Mejora

Las actividades de refactorización permitieron simplificar la estructura del código y mejorar su organización. Como resultado, se redujo considerablemente la deuda técnica acumulada.

### Porcentaje de Mejora

\[
\frac{297 - 18}{297} \times 100 = 93.9\%
\]

**Mejora obtenida: 93.9 %**

---

## Security Hotspots

Los Security Hotspots representan fragmentos de código que requieren revisión manual debido a que podrían contener riesgos de seguridad potenciales.

### Resultado Inicial

- Security Hotspots: **14**

### Interpretación

La cantidad de hotspots detectados indicaba la existencia de múltiples áreas sensibles que requerían análisis detallado por parte del equipo de desarrollo para descartar posibles vulnerabilidades.

Estos elementos suelen estar relacionados con autenticación, autorización, manejo de sesiones, validaciones y acceso a recursos críticos.

### Resultado Posterior

- Security Hotspots: **1**

### Interpretación de la Mejora

La reducción de los Security Hotspots demuestra que se revisaron y corrigieron los puntos de riesgo identificados durante la auditoría inicial.

### Porcentaje de Mejora

\[
\frac{14 - 1}{14} \times 100 = 92.8\%
\]

**Mejora obtenida: 92.8 %**

---

## Coverage

La cobertura de pruebas mide el porcentaje del código fuente que es ejecutado durante la ejecución de pruebas automatizadas.

### Resultado Inicial

- Coverage: **16.0 %**

### Interpretación

La cobertura inicial era insuficiente para garantizar la correcta validación del comportamiento del sistema. Un porcentaje reducido implica que gran parte de la lógica de negocio no estaba siendo evaluada mediante pruebas automatizadas.

Esta situación incrementa el riesgo de introducir errores durante futuras modificaciones o despliegues.

### Resultado Posterior

- Coverage: **38.0 %**

### Interpretación de la Mejora

El aumento de cobertura evidencia la incorporación de nuevas pruebas automatizadas, permitiendo validar una mayor proporción del sistema y reduciendo el riesgo de regresiones.

### Porcentaje de Incremento

\[
\frac{38 - 16}{16} \times 100 = 137.5\%
\]

**Incremento obtenido: 137.5 %**

---

## Duplications

La duplicación de código representa el porcentaje de bloques de código repetidos dentro del proyecto.

### Resultado Inicial

- Duplications: **8.5 %**

### Interpretación

La duplicación detectada indicaba la existencia de lógica repetida en distintos componentes del sistema. Esta situación incrementa la complejidad de mantenimiento y dificulta la evolución del software, ya que cualquier cambio debe realizarse en múltiples ubicaciones.

### Resultado Posterior

- Duplications: **5.9 %**

### Interpretación de la Mejora

La reducción de código duplicado demuestra que se realizaron actividades de refactorización orientadas a reutilizar componentes y centralizar funcionalidades comunes.

### Porcentaje de Mejora

\[
\frac{8.5 - 5.9}{8.5} \times 100 = 30.5\%
\]

**Mejora obtenida: 30.5 %**

---

## Evaluación Global de las Métricas

El análisis comparativo evidencia una mejora sustancial en todos los indicadores evaluados por SonarQube. Los resultados obtenidos demuestran una reducción significativa de riesgos de seguridad, errores de fiabilidad y problemas de mantenibilidad, así como un incremento importante en la cobertura de pruebas.

La eliminación total de vulnerabilidades y la reducción superior al 90 % de los problemas de mantenibilidad constituyen indicadores claros de que las acciones correctivas implementadas tuvieron un impacto positivo en la calidad técnica del sistema.

En términos generales, el proyecto evolucionó desde un escenario con riesgos técnicos considerables hacia una solución con mejores niveles de seguridad, estabilidad, mantenibilidad y capacidad de validación, alineándose con las buenas prácticas de ingeniería de software promovidas por SonarQube.
