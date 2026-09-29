# Nombre del proyecto
Desarrollo pagina web ecommerce . Indumentaria. ModArg

## Integrantes
Gabriel Teruel
Gonzalo Cabo
Dana Mehle

# E-commerce de Indumentaria

Proyecto integrador desarrollado con Vue 3 como parte de la cursada.

## Descripción

Aplicación web de e-commerce orientada a la visualización y búsqueda de productos de indumentaria.

El proyecto implementa un catálogo de productos obtenido desde una API externa, utilizando Vue 3 y sus principales herramientas de reactividad y renderizado.

## Tecnologías utilizadas

- Vue 3
- Vite
- JavaScript
- HTML
- CSS
- Fetch API
- Git
- GitHub

## Funcionalidades

Actualmente:

- Mostrar un catálogo de productos.
- Obtener productos desde una API mediante `fetch`.
- Mostrar imágenes, nombre, precio, categoría y descripción.
- Mostrar un estado de carga mientras se obtienen los productos.
- Mostrar un mensaje cuando ocurre un error.
- Reintentar la carga de productos.
- Buscar productos por nombre.
- Buscar productos por categoría.
- Mostrar un mensaje cuando no se encuentran resultados.
- Mostrar un estado vacío cuando no hay productos.

## API

Para el desarrollo inicial se utiliza una API externa de prueba:

DummyJSON - Products API

La API será reemplazada posteriormente por la API desarrollada para el proyecto.

## Estructura del proyecto

```text
src/
├── components/
│   └── ProductoCard.vue
│
├── App.vue
└── main.js