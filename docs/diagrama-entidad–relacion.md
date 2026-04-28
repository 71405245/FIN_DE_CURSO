```mermaid
erDiagram

    ESTUDIANTE {
        int id_estudiante PK
        string nombre
        string apellido
        string dni
        string email
    }

 
    CURSO {
        int id_curso PK
        string nombre
        int creditos
    }

    CICLO {
        int id_ciclo PK
        string nombre
        int anio
    }

    SECCION {
        int id_seccion PK
        string nombre
        int id_curso FK
        int id_docente FK
        int id_ciclo FK
    }

    MATRICULA {
        int id_matricula PK
        date fecha
        int id_estudiante FK
    }

    DETALLE_MATRICULA {
        int id_detalle PK
        int id_matricula FK
        int id_seccion FK
        string estado
    }

    NOTA {
        int id_nota PK
        float nota_final
        int id_detalle FK
    }

    ASISTENCIA {
        int id_asistencia PK
        date fecha
        string estado
        int id_detalle FK
    }

    %% RELACIONES

    ESTUDIANTE ||--o{ MATRICULA : realiza
    MATRICULA ||--o{ DETALLE_MATRICULA : contiene

    SECCION ||--o{ DETALLE_MATRICULA : incluye

    CURSO ||--o{ SECCION : tiene
    CICLO ||--o{ SECCION : pertenece

    DETALLE_MATRICULA ||--|| NOTA : genera
    DETALLE_MATRICULA ||--o{ ASISTENCIA : registra
