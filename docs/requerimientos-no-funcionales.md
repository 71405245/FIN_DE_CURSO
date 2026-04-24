#Especificación de Requerimientos No Funcionales (SMART)

| ID | Nombre del Requerimiento | Descripción Técnica | Criterio de Aceptación |
|----|--------------------------|--------------------|------------------------|
| RNF-01 | Tiempo de respuesta / Latencia | El sistema debe responder a las solicitudes del usuario en tiempos mínimos para garantizar fluidez. | Dado que el usuario realiza una acción, cuando el sistema procesa la solicitud, entonces responde en ≤ 2 segundos. |
| RNF-02 | Usabilidad | El sistema debe ser intuitivo y fácil de usar para el usuario. | Dado un usuario nuevo, cuando utiliza el sistema, entonces completa el proceso en ≤ 3 minutos sin errores. |
| RNF-03 | Compatibilidad | El sistema debe funcionar correctamente en navegadores modernos. | Dado acceso desde Chrome, Edge o Firefox, cuando se utiliza, entonces funciona sin fallos. |
| RNF-04 | Rendimiento | El sistema debe manejar múltiples solicitudes sin degradar su desempeño. | Dado múltiples usuarios simultáneos, cuando el sistema está en uso, entonces mantiene tiempos de respuesta estables. |
| RNF-05 | Escalabilidad | El sistema debe poder adaptarse al incremento de usuarios sin afectar su funcionamiento. | Dado un aumento de usuarios, cuando el sistema escala, entonces mantiene su rendimiento. |
| RNF-06 | Mantenibilidad | El sistema debe ser fácil de mantener y modificar. | Dado una actualización del sistema, cuando se realizan cambios, entonces el código puede modificarse sin afectar otras funcionalidades. |
