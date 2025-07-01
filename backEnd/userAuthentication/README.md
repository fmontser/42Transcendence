# Servicio: Userauthentication

*   Autor: nombre
*   Contacto: @user en *Slack*

Este directorio contiene el código fuente y la configuración para el servicio **Userauthentication** del proyecto Trascendence.

`src/userauthentication.ts`: Archivo main.

`src/other.ts`: Otros archivos.

## Documentación del Servicio

*   **Propósito del Servicio:** Descripcion...

---

*   **API:**
    *   Explicacion de uso del servicio. Ejemplos de codigo de ser necesario.

    ```typescript
    function sampleFunction(): void { 

        let text: string = "text";
        let number: number = 1;
    }
    ```
---
*   **API (Endpoints):**
    *   Para cada endpoint expuesto para el servicio intentar dar la informacion mas completa posible:
        *   Método HTTP (GET, POST, PUT, DELETE, etc.).
        *   Ruta (path).
        *   Descripción de lo que hace el endpoint.
        *   Parámetros de ruta (si los hay).
        *   Parámetros de consulta (query parameters, si los hay).
        *   Cuerpo de la petición esperado (request body), incluyendo formato y campos obligatorios/opcionales.
        *   Ejemplos de peticiones.
        *   Respuestas posibles (códigos de estado HTTP y cuerpo de la respuesta esperado para cada caso, incluyendo errores).
        *   Ejemplos de respuestas.
        
        **EndPoint para crear un user**  
        * PATH:   "/userauthentication/front/post/create"  
        METHOD: POST  
        ARG:    'name' and 'pass' in body  
        RETURN: Nada

        **EndPoint para log in**  
        * PATH:   "/userauthentication/front/post/login"  
        METHOD: POST  
        ARG:    'name' and 'pass' in body  
        RETURN: Nada

        **EndPoint para log in con Google Auth**  
        * PATH:   "/userauthentication/front/post/google_connect"  
        METHOD: POST  
        ARG:    response.credential (de la API google) en el body
        RETURN: Nada

        **EndPoint para log out**  
        * PATH:   "/userauthentication/front/post/logout"  
        METHOD: POST  
        ARG:    Nada  
        RETURN: Nada

        **EndPoint para ver si el usuario esta connectado**  
        * PATH:   "/userauthentication/front/get/profile_session"  
        METHOD: GET  
        ARG:    'user'  
        RETURN: 'id' del user
---

*   **Dependencias:** Descripcion de dependencias inter-servicios.
*   **Variables de Entorno:**
    *   Nombre del container: **userauthentication**
    *   Archivo **.env**:
        *   **SAMPLE_ENV_VAR**: Descricion de variables **.env**
    
*   **Notas Adicionales:**
    *   Notas

`¡Mantén esta documentación actualizada a medida que el servicio evoluciona!` Una buena documentación es clave para el éxito del proyecto y la colaboración en equipo.

