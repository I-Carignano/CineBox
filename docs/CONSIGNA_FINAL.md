# CONSIGNA — Trabajo Práctico Final (MDW, Turno Mañana, 2026)

> Transcripción fiel del PDF *TP-Final-MDW-2026* (docente: Tomás Arias Karle). **Esta es la fuente de verdad de lo que se corrige.** Las aclaraciones del docente para este trabajo están al final, en "Acuerdos con el docente".

## 1. Objetivo

Integrar los contenidos de la cursada construyendo una aplicación web full stack de temática libre, desplegada en la nube y desarrollada en equipo, aplicando prácticas profesionales de control de versiones, documentación y despliegue.

Cada integrante tiene que poder diseñar, implementar, desplegar y **defender oralmente** la porción del sistema bajo su responsabilidad, y entender el funcionamiento integral de la aplicación.

## 2. Modalidad

- Grupal (2 o 3 integrantes), **calificación individual**.
- Cada integrante es responsable de **un (1) modelo de datos con su CRUD completo**, en backend y frontend.
- Los modelos requeridos por la autenticación (usuarios, sesiones, cuentas, verificaciones) **no cuentan** como modelos propios.
- Cada alumno se evalúa sobre su modelo, sobre los opcionales que implementó y sobre su desempeño en el coloquio.

## 3. Stack

Tecnologías libres, respetando la arquitectura **API REST**. Obligatorio:

- Base de datos **NoSQL** (MongoDB, Firestore, DynamoDB, CouchDB…).
- Lenguaje **tipado** en backend y frontend (TypeScript u otro con tipado estático). **No se acepta JavaScript sin tipar.**

Stack recomendado (el de clase): Node.js, Express, TypeScript, Mongoose, Zod · MongoDB Atlas · Better Auth · React, Vite, TypeScript, React Router, React Hook Form, Zod · Redux Toolkit y RTK Query · Render o Vercel.

## 4. Requisitos obligatorios

Cumplir **todos** da el **4**. Si falta cualquiera, el integrante desaprueba.

### 4.1 Repositorio y metodología

- Repo en GitHub (monorepo `backend/` + `frontend/`, o dos repos), con todos los integrantes como colaboradores.
- **Todo cambio entra por Pull Request a `main`**, con descripción: qué se agregó o modificó y **cómo verificarlo**. **No se admiten commits directos sobre `main`.**
- Historial de commits **granular** con mensajes descriptivos. No se acepta un único commit final.
- Cada integrante tiene **PRs propios** que abarquen backend y frontend de su modelo.
- **Ningún secreto versionado** (`.env`, claves de API, cadenas de conexión con credenciales), **ni en commits anteriores**.
- `.env.example` con **todas** las variables, sin valores reales.

### 4.2 README profesional

Redactado con criterio profesional, buena ortografía y formato consistente; un tercero tiene que poder **comprender, ejecutar y evaluar** el proyecto sin ayuda. Mínimo:

- Nombre del proyecto y descripción funcional.
- Integrantes y modelo a cargo de cada uno.
- Stack y breve descripción de la arquitectura.
- Requisitos previos e instrucciones de instalación y ejecución local.
- Descripción de las variables de entorno.

### 4.3 Backend

- Un modelo por integrante, con **mínimo 4 atributos de al menos 3 tipos** distintos (texto, número, fecha, booleano, etc.).
- API RESTful con CRUD completo por modelo:

| Acción | Método | Ruta |
|---|---|---|
| Listar | GET / QUERY | `/api/<recurso>` |
| Obtener por id | GET | `/api/<recurso>/:id` |
| Crear | POST | `/api/<recurso>` |
| Modificar | PUT / PATCH | `/api/<recurso>/:id` |
| Eliminar | DELETE | `/api/<recurso>/:id` |

- **Baja lógica y baja física** según corresponda en cada modelo.
- Validación de entrada en alta y modificación, con **400** y mensajes claros.
- Códigos HTTP correctos: **201** creado, **400** inválido, **401** sin sesión, **403** sin permisos, **404** inexistente.
- Registro, inicio y cierre de sesión, con usuarios y sesiones **persistidos en la base**.
- Roles **`user`** y **`admin`**. Todo usuario registrado recibe por defecto **`user`**.

### 4.4 Frontend

- Ruta **pública** que muestre datos obtenidos del backend.
- Login y registro con validaciones y **mensajes de error visibles** (campos vacíos, credenciales inválidas).
- **Cierre de sesión con redirección a la página de inicio.**
- Ruta **privada de administración** con el CRUD de **cada modelo**: listado, alta, modificación y eliminación.
- Las operaciones del CRUD **se reflejan en la vista pública**.
- **Modal de confirmación** antes de toda eliminación, con cancelar y confirmar.
- Acceso por URL a una ruta privada **sin sesión → redirige al login**. Un `user` **no** accede al panel de administración.
- Formularios con validación del lado del cliente.
- Estado global con la librería que se elija.

### 4.5 Despliegue

- Frontend y backend en la nube con URL pública (Render, Vercel, Railway, Netlify, Fly.io…).
- Base NoSQL en la nube.
- **Autenticación operativa en producción.**
- **Datos de ejemplo en todos los modelos**: la vista pública no puede estar vacía al corregir.

### 4.6 Coloquio

Cada integrante expone el **flujo de datos de su modelo de extremo a extremo (formulario, estado, ruta, middleware, controlador y base de datos)** y responde consultas sobre el modelo de otro integrante.

## 5. Opcionales

Cada uno suma **+1** al integrante que lo implementó (se verifica por la **autoría de los PRs**), hasta un máximo de **10**.

| Opcional | Alcance esperado | Pts |
|---|---|---|
| Inicio de sesión con Google | Operativo en producción, con la URL de callback del despliegue | +1 |
| Paginación | En el listado de su modelo, en backend (`?page=&limit=`) y frontend | +1 |
| Panel de administración de sesiones y permisos | El admin puede **listar usuarios, modificar roles y consultar o revocar sesiones activas** | +1 |
| Agente LLM integrado | Interfaz conversacional en el frontend con un agente (p. ej. LangChain) que **consulte los datos de la aplicación mediante herramientas** | +1 |
| API documentada con Swagger 2.0 | Especificación de **la totalidad** de los endpoints, servida desde el backend (p. ej. `/api/docs`) | +1 |
| Imágenes en almacenamiento externo | Carga de imágenes en un servicio de objetos (S3, Cloudflare R2 o equivalente), guardando en la base **solo la URL** | +1 |

El de imágenes aplica solo cuando la temática lo justifica.

## 6. Evaluación (procedimiento de corrección, en Chrome)

1. Entrar al front desplegado: la vista pública muestra datos de la base.
2. Registrar un usuario nuevo y verificar que recibe el rol `user`.
3. Login con datos erróneos (credenciales inválidas, campos vacíos): mensajes de error.
4. Login como `user`: no puede entrar al panel de administración.
5. Login como `admin`: listado, alta, modificación y eliminación **en cada modelo**, verificando el impacto en la base y en la vista pública.
6. Eliminación: **modal (cancelar y confirmar), baja lógica y baja física**.
7. Logout con redirección al inicio; acceso por URL a rutas privadas redirige al login.
8. Repo: calidad de código, README, `.env.example`, sin secretos, **PRs con descripción y autoría**.
9. Coloquio individual.
10. Opcionales de cada integrante.

### Causales de desaprobación

**De todo el grupo:** secretos versionados (incluso en commits viejos) · app no desplegada o auth no operativa en producción · base no NoSQL o código sin tipar · **reproducir el CRUD de clase con cambios meramente nominales**.

**Del integrante:** no tener PRs propios · no poder explicar lo desarrollado en el coloquio.

## 7. Entrega

Por **correo**, con al menos **una semana** de anticipación a la mesa (fuera de término no se considera).

| Campo | Valor |
|---|---|
| Para | tomas.ariaskarle@uai.edu.ar |
| CC | tomas.arias2001@gmail.com |
| Asunto | `TP Final MDW TM - <Apellido y nombre de cada integrante>` |

Cuerpo: nombre y apellido · link al repo · URL del front · usuarios de prueba con contraseña (un admin y un user) · modelo y opcionales implementados por cada integrante.

### Lista de verificación previa

- [ ] Registro, login y logout funcionan en producción.
- [ ] Un usuario recién registrado recibe el rol `user`.
- [ ] El admin de prueba crea, modifica y elimina en **todos** los modelos.
- [ ] El user de prueba recibe **403** al intentar escribir (sobre lo que no le corresponde) y no accede al panel.
- [ ] Todos los cambios entraron por PR con descripción.
- [ ] `git log --all -- "*.env"` no devuelve resultados.

---

## Acuerdos con el docente (respuestas de Tomás, 25/11/2026)

| Tema | Respuesta | Cómo lo aplicamos |
|---|---|---|
| Trabajo individual | "Sí, obvio. Si cubrís los tres modelos con eso no hay problema." | Individual, con **3 modelos**: Títulos, Calificaciones y Listas, cada uno con CRUD completo |
| La idea (tipo Letterboxd/Glynbox) | "Me parece que está correcto, mandale para adelante." | Aprobada. Incluye que el `user` escriba **solo sus propias** calificaciones y listas. El catálogo (Títulos) es solo del admin: el `user` recibe 403 ahí y sobre datos ajenos |
| Commits directos a `main` del TP2 | "Si querés hacer un corte ahí para los siguientes avances, está bueno una PR. Así queda más profesional." | Mismo repo. **Corte en F0**: desde ahí, todo por PR. El README lo aclara |
| Qué pesa | "Lo importante es la defensa." | Preparación del coloquio por modelo en F12 |
