```mermaid
erDiagram

    PROYECTO {
        int id_proyecto PK
        string nombre
        string descripcion
        date fecha_inicio
        date fecha_fin
    }

    EQUIPO {
        int id_equipo PK
        string nombre
        int id_proyecto FK
    }

    INTEGRANTE {
        int id_integrante PK
        string nombre
        string email
        int id_equipo FK
        int id_rol FK
    }

    ROL {
        int id_rol PK
        string nombre
    }

    SPRINT {
        int id_sprint PK
        string nombre
        date fecha_inicio
        date fecha_fin
        int id_proyecto FK
    }

    BACKLOG_PRODUCTO {
        int id_backlog PK
        string descripcion
        string prioridad
        int id_proyecto FK
    }

    HISTORIA_USUARIO {
        int id_historia PK
        string titulo
        string descripcion
        string prioridad
        string estado
        int id_sprint FK
        int id_backlog FK
    }

    TAREA {
        int id_tarea PK
        string descripcion
        string estado
        int id_historia FK
        int id_integrante FK
    }

    RIESGO {
        int id_riesgo PK
        string descripcion
        string impacto
        string probabilidad
        string plan_mitigacion
        int id_proyecto FK
    }

    IMPEDIMENTO {
        int id_impedimento PK
        string descripcion
        string estado
        int id_sprint FK
    }

    REUNION {
        int id_reunion PK
        date fecha
        string tipo
        int id_proyecto FK
    }

    ACTA {
        int id_acta PK
        string resumen
        string acuerdos
        int id_reunion FK
    }

    PROYECTO ||--o{ EQUIPO : tiene
    EQUIPO ||--o{ INTEGRANTE : incluye
    ROL ||--o{ INTEGRANTE : asigna

    PROYECTO ||--o{ SPRINT : contiene
    SPRINT ||--o{ HISTORIA_USUARIO : incluye
    BACKLOG_PRODUCTO ||--o{ HISTORIA_USUARIO : agrupa

    HISTORIA_USUARIO ||--o{ TAREA : se_divide
    INTEGRANTE ||--o{ TAREA : realiza

    PROYECTO ||--o{ RIESGO : gestiona
    SPRINT ||--o{ IMPEDIMENTO : tiene

    PROYECTO ||--o{ REUNION : organiza
    REUNION ||--|| ACTA : genera
