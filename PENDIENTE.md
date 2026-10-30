# 📋 Tareas pendientes

Distribución de tareas del equipo para cerrar el flujo de compra y la gestión de pedidos.

**Equipo:** Dana · Gonza · Gabriel

---

## 🎯 Resumen

| # | Tarea | Prioridad | Responsable | Estado |
|:-:|-------|:---------:|:-----------:|:------:|
| 1 | Confirmar compra (`POST /pedidos`) | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 2 | Compra exitosa: mensaje, vaciar carrito y redirección | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 3 | Mis pedidos: listado de pedidos del usuario logueado | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Gabriel](https://img.shields.io/badge/-Gabriel-0366d6?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
| 4 | Modal de login / crear usuario (ante `401`) | ![Alta](https://img.shields.io/badge/prioridad-ALTA-d73a49?style=flat-square) | ![Dana](https://img.shields.io/badge/-Dana-6f42c1?style=flat-square) | ![Pendiente](https://img.shields.io/badge/-pendiente-lightgrey?style=flat-square) |
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
| ![Hecho](https://img.shields.io/badge/-hecho-28a745?style=flat-square) | Terminada y mergeada |

### Carga por persona

| Persona | Tareas asignadas |
|---------|------------------|
| 🔵 **Gabriel** | #1, #2, #3 |
| 🟣 **Dana** | #4, #5, #6 |
| 🟢 **Gonza** | _a definir_ |
| ⚪ **Sin asignar** | #7, #8 |

---

## 🔴 Tarea 1 — Confirmar compra

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🔵 Gabriel | `src/views/Cart.vue` |

**Objetivo:** que al confirmar el carrito se registre el pedido en el backend y se derive cada respuesta al flujo que corresponde.

**Flujo esperado**

1. El usuario hace clic en **Confirmar compra** desde el carrito.
2. Se hace el `POST /pedidos` **directamente** con los ítems del carrito (sin modal previo).
3. Según la respuesta del backend:

| Respuesta | Qué pasa |
|:---------:|----------|
| ![201](https://img.shields.io/badge/-201%20Created-28a745?style=flat-square) | Se pasa al flujo de **compra exitosa** (Tarea 2). |
| ![401](https://img.shields.io/badge/-401%20Unauthorized-f9a825?style=flat-square) | Se abre el **modal de login** con la opción de **crear usuario** (Tarea 4). El carrito queda intacto. |
| ![Error](https://img.shields.io/badge/-otro%20error-d73a49?style=flat-square) | Se muestra el mensaje de error y el carrito queda intacto. |

**Criterios de aceptación**

- [ ] El clic en **Confirmar compra** dispara el `POST` sin pasos intermedios.
- [ ] Ante un `201`, se dispara el flujo de la Tarea 2.
- [ ] Ante un `401`, se abre el modal de login / crear usuario.
- [ ] Manejo de errores visible para el usuario.
- [ ] Botón deshabilitado mientras se envía el pedido (evitar doble envío).

---

## 🔴 Tarea 2 — Compra exitosa

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

- [ ] Mensaje de éxito visible solo cuando la respuesta es `201`.
- [ ] El carrito queda vacío después de la compra.
- [ ] Redirección automática al listado de pedidos del usuario (vista de la Tarea 3).

> 🔗 **Depende de:** Tarea 3. La vista de destino todavía no existe.

---

## 🔴 Tarea 3 — Mis pedidos

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🔵 Gabriel | Vista nueva (ej. `src/views/MisPedidos.vue`), `src/router/index.js` |

**Objetivo:** que el usuario logueado pueda ver los pedidos que realizó. Hoy esta vista **no existe** y es el destino de la redirección de la Tarea 2.

**Requisitos**

- Crear la vista y su ruta (ej. `/mis-pedidos`), accesible solo con sesión iniciada.
- Traer del backend los pedidos del usuario logueado (confirmar ruta con backend).
- Mostrarlos en una tabla o listado: número de pedido, fecha, productos, total y estado.

**Criterios de aceptación**

- [ ] Ruta nueva registrada en el router y protegida para usuarios logueados.
- [ ] Se listan solo los pedidos del usuario logueado.
- [ ] Estado de carga y mensaje cuando el usuario no tiene pedidos.
- [ ] Si el backend devuelve `401`, se pide iniciar sesión.

---

## 🔴 Tarea 4 — Modal de login / crear usuario

| Prioridad | Responsable | Vista / archivos |
|:---------:|:-----------:|------------------|
| ![Alta](https://img.shields.io/badge/-ALTA-d73a49?style=flat-square) | 🟣 Dana | `src/views/Cart.vue`, `src/store/auth.js`, componente de formulario nuevo |

**Objetivo:** que un usuario sin sesión pueda iniciar sesión o crear una cuenta sin salir del flujo de compra.

**Flujo esperado**

1. El usuario hace clic en **Confirmar compra** y el `POST /pedidos` devuelve **`401`** (no está logueado o la sesión venció).
2. Se abre el **modal de login**, que incluye la opción **Crear usuario**:
   - **Iniciar sesión** → formulario de login (vista por defecto).
   - **Crear usuario** → formulario de registro.
3. El formulario de registro envía los datos al endpoint de creación de usuario.
4. Con el alta (o el login) exitoso, el usuario queda autenticado y vuelve al flujo de **confirmar compra** (Tarea 1).

**Criterios de aceptación**

- [ ] El modal se abre cuando el `POST /pedidos` devuelve `401`.
- [ ] Modal de login con opción para pasar a "Crear usuario".
- [ ] Formulario de registro con validaciones (campos obligatorios, formato de email, contraseña).
- [ ] Integración con el endpoint de creación de usuario (confirmar ruta y payload con backend).
- [ ] Mensajes de error claros (por ejemplo, email ya registrado).
- [ ] Después de loguearse o registrarse, se puede continuar con la compra sin perder el carrito.

> 🔗 **Se integra con:** Tarea 1. Gabriel abre el modal ante el `401`; Dana arma el modal y los formularios. Coordinar cómo se dispara (prop, evento o store).

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
- [ ] Listado completo de pedidos traído del endpoint correspondiente (confirmar ruta con backend).
- [ ] Estado de carga y mensaje cuando no hay pedidos.

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
