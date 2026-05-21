import type { CollectionConfig } from 'payload'

export const Clientes: CollectionConfig = {
  slug: 'clientes',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'provider', 'createdAt'],
    description: 'Clientes registrados en la tienda web. Se crea automáticamente al registrarse.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'prismaUserId',
      label: 'ID interno',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'provider',
      label: 'Registro vía',
      type: 'select',
      admin: { position: 'sidebar', readOnly: true },
      options: [
        { label: 'Email y contraseña', value: 'credentials' },
        { label: 'Google', value: 'google' },
      ],
    },
  ],
}
