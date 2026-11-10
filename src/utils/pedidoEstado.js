const estados = {
  pendiente: { texto: 'Pendiente', clase: 'is-warning estado-pedido--pendiente-pago' },
  enviado: { texto: 'Enviado', clase: 'is-info estado-pedido--enviado' },
  entregado: { texto: 'Entregado', clase: 'is-success estado-pedido--entregado' },
  cancelado: { texto: 'Cancelado', clase: 'is-danger estado-pedido--cancelado' },
}

export const ESTADOS_PEDIDO = Object.freeze(Object.keys(estados))

export function normalizarEstadoPedido(status) {
  return String(status ?? '').trim().toLowerCase()
}

export function obtenerEstadoPedido(status) {
  const normalizado = normalizarEstadoPedido(status)

  return estados[normalizado] ?? { texto: status || '-', clase: '' }
}
