import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description: 'Acceso al panel de administración. No son clientes de la tienda web.',
  },
  auth: true,
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,
    update: ({ req }) => req.user?.role === 'admin',
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
}
