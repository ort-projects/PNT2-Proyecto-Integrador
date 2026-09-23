
<script setup>
import productoCard from "./components/productoCard.vue"
// para despues 
// import { ref, onMounted } from "vue"
// const productos = ref([])



const productos = [
  {
    id: 1,
    nombre: "Remera básica blanca Unisex",
    precio: 15000,
    categoria: "Remeras",
    imagen: "",
    descripcion: "Remera básica de algodón color blanco."
  },
  {
    id: 2,
    nombre: "Buzo oversize negro 1890",
    precio: 28000,
    categoria: "Buzos",
    imagen: "",
    descripcion: "Buzo oversize de algodón color negro."
  },
  {
    id: 3,
    nombre: "Short Unisex",
    precio: 35000,
    categoria: "Short",
    imagen: "",
    descripcion: "Short de algodón color azul."
  },
  {
    id: 4,
    nombre: "Campera de jean",
    precio: 42000,
    categoria: "Camperas",
    imagen: "",
    descripcion: "Campera de jean clásica."
  },
  {
    id: 5,
    nombre: "Pantalón cargo beige",
    precio: 32000,
    categoria: "Pantalones",
    imagen: "",
    descripcion: "Pantalón cargo de estilo urbano."
  },
  {
    id: 6,
    nombre: "Remera estama Somos",
    precio: 18000,
    categoria: "Remeras",
    imagen: "",
    descripcion: "Remera de algodón con estampa."
  }
]

// async function cargarProductos() {
//const URL = "url"
//const response = await fetch(URL)
//if (!response.ok) {
//     throw new Error("No se pudieron cargar los productos.")
//   }
//productos.value = await response.json()
// }

// onMounted(() => {cargarProductos()})

</script>
<template>
  <div>
    <productoCard
      v-for="producto in productos"
      :key="producto.id"
      :producto="producto"
    />
  </div>
</template>
<style scoped></style>
