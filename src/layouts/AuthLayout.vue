<template>
  <div class="admin-shell">
    <header class="admin-header">
      <div class="container is-max-widescreen admin-header-content">
        <RouterLink to="/admin" class="admin-brand">
          ModArg <span>Administración</span>
        </RouterLink>

        <RouterLink to="/" class="button is-outlined">
          Ver tienda
        </RouterLink>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
}

.admin-header {
  border-bottom: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.admin-header-content {
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
}

.admin-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75rem;
  color: var(--color-texto);
  font-size: 1.25rem;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.admin-brand span {
  color: var(--color-secundario);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0;
}

@media (max-width: 480px) {
  .admin-header-content {
    padding-inline: 1rem;
  }

  .admin-brand {
    flex-direction: column;
    gap: 0;
    font-size: 1.1rem;
  }
}
</style>
