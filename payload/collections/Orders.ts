import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'status', 'totalAmount', 'createdAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin',
    delete: () => false,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'PENDING',
      options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'En proceso', value: 'PROCESSING' },
        { label: 'Enviado', value: 'SHIPPED' },
        { label: 'Entregado', value: 'DELIVERED' },
        { label: 'Cancelado', value: 'CANCELLED' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'userId',
      type: 'text',
      required: true,
    },
    {
      name: 'stripePaymentId',
      type: 'text',
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
    },
    {
      name: 'shippingName',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'shippingPhone',
      type: 'text',
    },
    {
      name: 'isPickup',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Recogida en taller' },
    },
    {
      name: 'shippingAddress',
      type: 'text',
    },
    {
      name: 'shippingCity',
      type: 'text',
    },
    {
      name: 'shippingCountry',
      type: 'text',
    },
    {
      name: 'shippingZip',
      type: 'text',
    },
    {
      name: 'invoiceUrl',
      type: 'text',
      admin: { description: 'URL de la factura proforma' },
    },
    {
      name: 'notes',
      type: 'textarea',
    },
  ],
}
