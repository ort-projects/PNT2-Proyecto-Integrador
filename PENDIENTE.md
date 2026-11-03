# 📋 Tareas pendientes

Distribución de tareas del equipo para cerrar el flujo de compra y la gestión de pedidos.

**Equipo:** Dana · Gonza · Gabriel

---

## 🎯 Resumen

| # | Tarea | Prioridad | Responsable | Estado |
|:-:|-------|:---------:|:-----------:|:------:|
| 1 | Confirmar compra (`POST /pedidos`) | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) |
| 2 | Compra exitosa: mensaje, vaciar carrito y redirección | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) |
| 3 | Mis pedidos: listado de pedidos del usuario logueado | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) |
| 4 | Modal de login / crear usuario (ante `401`) | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Dana](https://img.shields.io/badge/-Dana-6f42c1?style=flat-square) | ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) |
| 5 | Admin: listado de pedidos de todos los usuarios | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Dana](https://img.shields.io/badge/-Dana-6f42c1?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 6 | Admin: filtro de pedidos por usuario | ![Baja](https://img.shields.io/badge/prioridad-BAJA-28a745?style=flat-square) | ![Dana](https://img.shields.io/badge/-Dana-6f42c1?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 7 | Admin: generar oferta semanal | ![A definir](https://img.shields.io/badge/prioridad-A%20DEFINIR-lightgrey?style=flat-square) | ![Sin asignar](https://img.shields.io/badge/-sin%20asignar-555555?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 8 | Home: mostrar ofertas semanales | ![A definir](https://img.shields.io/badge/prioridad-A%20DEFINIR-lightgrey?style=flat-square) | ![Sin asignar](https://img.shields.io/badge/-sin%20asignar-555555?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |

### Referencias

| Prioridad | Significado |
|-----------|-------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | Bloqueante para la entrega. Se hace primero. |
| ![Media](https://img.shields.io/badge/-MEDIA-f9a825?style=flat-square) | Necesaria, pero no bloquea otras tareas. |
| ![Baja](https://img.shields.io/badge/-BAJA-28a745?style=flat-square) | Mejora o detalle; se hace si queda tiempo. |
| ![A definir](https://img.shields.io/badge/-A%20DEFINIR-lightgrey?style=flat-square) | Todavía no se definió la prioridad. |

| Estado | Significado |
|--------|-------------|
| ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) | Sin empezar |
| ![En curso](https://img.shields.io/badge/-en%20curso-f9a825?style=flat-square) | Alguien la está haciendo |
| ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) | Terminada en el código |

### Carga por persona

| Persona | Tareas asignadas |
|---------|------------------|
| 🔵 **Gabriel** | #1, #2, #3 |
| 🟣 **Dana** | #4, #5, #6 |
| 🟢 **Gonza** | _a definir_ |
| ⚪ **Sin asignar** | #7, #8 |

---

## ✅ Tarea 1 — Confirmar compra

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🔵 Gabriel | `src/views/Cart.vue` |

**Objetivo:** que al confirmar el carrito se registre el pedido en el backend y se derive cada respuesta al flujo que corresponde.

**Flujo esperado**

1. El usuario hace clic en **Confirmar compra** desde el carrito.
2. Si no hay sesión iniciada (`authStore.isAuthenticated` es `false`), se abre el **modal de login** (Tarea 4) sin hacer el `POST`. El carrito queda intacto.
3. Si hay sesión, se hace el `POST /pedidos` con los ítems del carrito.
4. Según la respuesta del backend:

| Respuesta | Qué pasa |
|:---------:|----------|
| ![201](https://img.shields.io/badge/-201%20Created-28a745?style=flat-square) | Se pasa al flujo de **compra exitosa** (Tarea 2). |
| ![401](https://img.shields.io/badge/-401%20Unauthorized-f9a825?style=flat-square) | El token venció o el backend lo rechazó: se borra el token y se abre el **modal de login** con la opción de **crear usuario** (Tarea 4), sin salir del carrito. El carrito queda intacto. |
| ![Error](https://img.shields.io/badge/-otro%20error-d73a49?style=flat-square) | Se muestra el mensaje de error y el carrito queda intacto. |

**Criterios de aceptación**

- [x] Sin sesión iniciada, el clic en **Confirmar compra** abre el modal de login sin hacer el `POST`.
- [x] Con sesión iniciada, el clic dispara el `POST` sin pasos intermedios.
- [x] Ante un `201`, se dispara el flujo de la Tarea 2.
- [x] Ante un `401`, se abre el modal de login / crear usuario sin salir del carrito.
- [x] Manejo de errores visible para el usuario.
- [x] Botón deshabilitado mientras se envía el pedido (evitar doble envío).

---

## ✅ Tarea 2 — Compra exitosa

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🔵 Gabriel | `src/views/Cart.vue`, `src/store/cart.js`, `src/router/index.js` |

**Objetivo:** cuando el pedido se registra correctamente (`201`), confirmarle al usuario la compra y llevarlo a sus pedidos.

**Flujo esperado**

1. El `POST /pedidos` devuelve **`201 Created`**.
2. Se muestra un **mensaje de éxito** ("¡Pedido registrado!").
3. Se **vacía el carrito**.
4. Se **redirige al listado de pedidos del usuario logueado**.

**Criterios de aceptación**

- [x] Mensaje de éxito visible solo cuando la respuesta es `201`.
- [x] El carrito queda vacío después de la compra.
- [x] Redirección automática al listado de pedidos del usuario (vista de la Tarea 3).

> 🔗 **Depende de:** Tarea 3 (hecha).

**Implementación**

- `compraExitosa()` en `Cart.vue` vacía el carrito y navega con `router.push({ name: 'mis-pedidos', state: { pedidoRegistrado: true } })`. El carrito se vacía antes de navegar para que no se pueda reenviar el mismo pedido.
- `MisPedidos.vue` lee `history.state.pedidoRegistrado` para mostrar "¡Pedido registrado!" y lo borra para que el mensaje no reaparezca al recargar.

---

## ✅ Tarea 3 — Mis pedidos

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🔵 Gabriel | `src/views/MisPedidos.vue`, `src/router/index.js` |

**Objetivo:** que el usuario logueado pueda ver los pedidos que realizó. Es el destino de la redirección de la Tarea 2.

**Requisitos**

- Proteger la ruta `/mis-pedidos` para usuarios logueados (hoy no tiene `meta` ni guard en `src/router/index.js`).
- Traer los pedidos con `GET /pedidos` (con `fetchWithAuth`). El backend ya devuelve cada pedido con `id`, `date`, `total`, `user` e ítems con `title`, `thumbnail`, `price` y `quantity` (B2 del backend).
- Mostrarlos en una tabla o listado: número de pedido, fecha, productos, total y estado.

**Criterios de aceptación**

- [x] Ruta registrada en el router.
- [x] Ruta protegida para usuarios logueados.
- [x] Se listan solo los pedidos del usuario logueado.
- [x] Estado de carga y mensaje cuando el usuario no tiene pedidos.
- [x] Si el backend devuelve `401`, se pide iniciar sesión.

> 🔗 **Backend:** B3 ya devuelve `status` (`pendiente`, `enviado`, `entregado`, `cancelado`); se muestra como una etiqueta de color en la columna **Estado**.

**Implementación**

- `/mis-pedidos` tiene `meta: { requireLogin: true }`. Sin sesión, el guard de `src/router/index.js` abre el modal de login con `redirect` a `/mis-pedidos` y, al autenticarse, navega ahí.
- `MisPedidos.vue` llama a `GET /pedidos` con `fetchWithAuth` y muestra los pedidos en el orden en que llegan del backend: número, fecha, productos (miniatura, cantidad y precio unitario), total y estado.
- Ante un `401`, `fetchWithAuth` borra el token y abre el modal; la vista muestra "Tu sesión venció" con un botón para iniciar sesión y recarga el listado al volver a autenticarse.
- El menú de cuenta del header tiene un link a **Mis pedidos** cuando hay sesión.

---

## ✅ Tarea 4 — Modal de login / crear usuario

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🟣 Dana | `src/views/Cart.vue`, `src/store/auth.js`, componente de formulario nuevo |

**Objetivo:** que un usuario sin sesión pueda iniciar sesión o crear una cuenta sin salir del flujo de compra.

**Flujo esperado**

1. El usuario hace clic en **Confirmar compra** sin sesión iniciada, o el `POST /pedidos` devuelve **`401`** (la sesión venció).
2. Se abre el **modal de login**, que incluye la opción **Crear usuario**:
   - **Iniciar sesión** → formulario de login (vista por defecto).
   - **Crear usuario** → formulario de registro.
3. El formulario de registro envía los datos al endpoint de creación de usuario.
4. Con el alta (o el login) exitoso, el usuario queda autenticado y vuelve al flujo de **confirmar compra** (Tarea 1).

**Criterios de aceptación**

- [x] El modal se abre al confirmar sin sesión iniciada o cuando el `POST /pedidos` devuelve `401`.
- [x] Modal de login con opción para pasar a "Crear usuario".
- [x] Formulario de registro con validaciones (campos obligatorios, formato de email, contraseña de al menos 8 caracteres).
- [x] Integración con `POST /usuarios`, enviando `{ username, name, surname, password }`.
- [x] Mensajes de error claros, incluido email ya registrado (`409`).
- [x] Después de loguearse o registrarse, el usuario puede volver a confirmar la compra sin perder el carrito.

> 🔗 **Integración:** sin sesión o ante el `401`, `Cart.vue` abre el modal; al autenticarse, el modal se cierra y el usuario vuelve a hacer clic en **Confirmar compra**.

**Integración con la Tarea 1 (ya implementada en `Cart.vue`)**

El modal se dispara por **store** (`src/store/auth.js`):

| Qué | Cómo |
|-----|------|
| Abrir el modal | Al confirmar sin sesión iniciada, o ante un `401` en `POST /pedidos`, `Cart.vue` llama a `authStore.abrirLoginModal()`, que pone `authStore.loginModalAbierto` en `true`. |
| Mostrar el modal | El modal es global: está en `App.vue` y se muestra con `authStore.loginModalAbierto`. `abrirLoginModal({ mensaje, redirect })` acepta un texto para el modal y una ruta a la que ir después de autenticarse. |
| Cerrar el modal | Llamar a `authStore.cerrarLoginModal()` al cancelar y después de un login o registro exitoso (luego de `authStore.setToken(token)`). |
| Seguir con la compra | El carrito no se toca ante el `401`, así que alcanza con que el usuario vuelva a hacer clic en **Confirmar compra**. |

- Ante un `401`, además de abrir el modal, el carrito muestra el mensaje "Iniciá sesión para confirmar la compra. Tu carrito se conserva.", que se borra al autenticarse.
- Ya no existe la página `/login`: el modal es la única forma de iniciar sesión. Lo abren el botón **Iniciar sesión** del header, el guard de `/admin` (que después del login navega al panel) y `fetchWithAuth` ante cualquier `401`, que borra el token sin sacar al usuario de la página.
- Opcional: reintentar la compra automáticamente después del login (por ejemplo, que `Cart.vue` observe `loginModalAbierto` y vuelva a llamar a `confirmarPedido()` cuando se cierre con sesión iniciada).

---

## 🔴 Tarea 5 — Admin: listado de pedidos de todos los usuarios

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🟣 Dana | Panel de admin (`src/views/Dashboard.vue` o vista nueva) |

**Objetivo:** que el administrador vea todos los pedidos realizados en el sistema.

**Requisitos**

- Traer desde el backend los pedidos de **todos** los usuarios.
- Mostrarlos en una tabla (número de pedido, usuario, fecha, total, estado).

**Criterios de aceptación**

- [ ] Vista accesible solo para usuarios con rol admin.
- [ ] Listado completo de pedidos traído de `GET /pedidos/all` (requiere token de admin; ya devuelve detalle, `total` y usuario con `username`, `name` y `surname`).
- [ ] Estado de carga y mensaje cuando no hay pedidos.

> 🔗 **Backend:** B3 ya devuelve `status` (`pendiente`, `enviado`, `entregado`, `cancelado`) también en `GET /pedidos/all`.

---

## 🟢 Tarea 6 — Admin: filtro de pedidos por usuario

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Baja](https://img.shields.io/badge/-BAJA-28a745?style=flat-square) | 🟣 Dana | Vista de pedidos del admin (Tarea 5) |

**Objetivo:** que el administrador pueda ver solo los pedidos de un usuario determinado.

**Requisitos**

- Agregar sobre la tabla de la Tarea 5 un **filtro por el usuario** que realizó el pedido.
- Opción para limpiar el filtro y volver a ver todos los pedidos.

**Criterios de aceptación**

- [ ] Al elegir un usuario, la tabla muestra solo sus pedidos.
- [ ] Se puede quitar el filtro y volver al listado completo.
- [ ] Mensaje cuando el usuario elegido no tiene pedidos.

> 🔗 **Depende de:** Tarea 5.

> 💡 **Backend:** el filtro `GET /pedidos/all?username=` (B6) todavía no existe. Mientras tanto se puede filtrar del lado del cliente con los datos de la Tarea 5. Para armar el selector con la lista de usuarios se usa `GET /usuarios`, que ya no devuelve contraseñas pero todavía no está protegido para admin (B5).

---

## ⚪ Tarea 7 — Admin: generar oferta semanal

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![A definir](https://img.shields.io/badge/-A%20DEFINIR-lightgrey?style=flat-square) | ⚪ Sin asignar | Panel de admin (vista nueva) |

**Objetivo:** que el administrador pueda armar las ofertas de la semana aplicando un descuento a productos puntuales.

**Flujo esperado**

1. El admin entra al módulo **Ofertas semanales**.
2. Elige un **producto** del catálogo.
3. Ingresa el **porcentaje de descuento** a aplicar.
4. Guarda la oferta, que se envía al backend.

**Criterios de aceptación**

- [ ] Vista accesible solo para usuarios con rol admin.
- [ ] Selector de producto con los productos del catálogo.
- [ ] Campo de porcentaje validado (número entre 1 y 100).
- [ ] La oferta se guarda en el backend (**endpoint a definir**).
- [ ] Mensaje de éxito o de error al guardar.

> ❓ **A definir con backend:** ruta y payload del endpoint, vigencia de la oferta (¿semana calendario o fechas de inicio/fin?) y si un producto puede tener más de una oferta activa.

---

## ⚪ Tarea 8 — Home: mostrar ofertas semanales

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![A definir](https://img.shields.io/badge/-A%20DEFINIR-lightgrey?style=flat-square) | ⚪ Sin asignar | `src/views/Home.vue` |

**Objetivo:** que los usuarios vean en la página principal los productos en oferta de la semana.

**Requisitos**

- Traer del backend las ofertas vigentes (**endpoint a definir**).
- Mostrar cada producto en oferta con su precio original, el porcentaje de descuento y el precio final.

**Criterios de aceptación**

- [ ] Sección de ofertas visible en la página principal.
- [ ] Se muestran solo las ofertas vigentes.
- [ ] Precio original tachado y precio con descuento destacado.
- [ ] Si no hay ofertas, la sección no se muestra (o muestra un mensaje).

> 🔗 **Depende de:** Tarea 7.

---

> 📝 _Este documento se va ampliando a medida que se definen nuevas tareas._
