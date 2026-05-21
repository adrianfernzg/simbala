import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'status', 'customer__name', 'totalAmount', 'isPickup', 'createdAt'],
    description: 'Pedidos recibidos vía Stripe. Cambia el estado desde la barra lateral. Puedes añadir notas internas.',
  },
  access: {
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (!req.user) return false
      return { userId: { equals: req.user.id } }
    },
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin',
    delete: () => false,
  },
  fields: [
    // ─── Sidebar ──────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'PENDING',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'En proceso', value: 'PROCESSING' },
        { label: 'Enviado', value: 'SHIPPED' },
        { label: 'Entregado', value: 'DELIVERED' },
        { label: 'Cancelado', value: 'CANCELLED' },
      ],
    },
    {
      name: 'totalAmount',
      label: 'Total (€)',
      type: 'number',
      required: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'isPickup',
      label: 'Recogida en taller',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'stripePaymentId',
      label: 'ID de pago Stripe',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'userId',
      label: 'ID de usuario',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },

    // ─── Cliente ─────────────────────────────────────────────
    {
      name: 'customer',
      type: 'group',
      label: 'Datos del cliente',
      fields: [
        { name: 'name', label: 'Nombre', type: 'text', admin: { readOnly: true } },
        { name: 'email', label: 'Email', type: 'email', admin: { readOnly: true } },
        { name: 'phone', label: 'Teléfono', type: 'text', admin: { readOnly: true } },
      ],
    },

    // ─── Dirección de envío ───────────────────────────────────
    {
      name: 'shipping',
      type: 'group',
      label: 'Dirección de envío',
      admin: { condition: (data) => !data?.isPickup },
      fields: [
        { name: 'address', label: 'Dirección', type: 'text', admin: { readOnly: true } },
        { name: 'city', label: 'Ciudad', type: 'text', admin: { readOnly: true } },
        { name: 'zip', label: 'Código postal', type: 'text', admin: { readOnly: true } },
        { name: 'country', label: 'País', type: 'text', admin: { readOnly: true } },
      ],
    },

    // ─── Productos ────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      label: 'Productos del pedido',
      admin: { readOnly: true },
      fields: [
        { name: 'productId', label: 'ID Producto', type: 'text' },
        { name: 'productName', label: 'Producto', type: 'text' },
        { name: 'quantity', label: 'Cantidad', type: 'number' },
        { name: 'basePrice', label: 'Precio base (€)', type: 'number' },
        { name: 'totalPrice', label: 'Total línea (€)', type: 'number' },
        {
          name: 'extras',
          type: 'array',
          label: 'Extras',
          fields: [
            { name: 'extraName', label: 'Extra', type: 'text' },
            { name: 'price', label: 'Precio (€)', type: 'number' },
            { name: 'value', label: 'Valor', type: 'text' },
          ],
        },
      ],
    },

    // ─── Notas internas (editable) ────────────────────────────
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notas internas',
      admin: { description: 'Solo visibles para el administrador' },
    },
  ],
}
