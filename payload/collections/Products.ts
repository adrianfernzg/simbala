import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'basePrice', 'published'],
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL amigable. Se genera automáticamente desde el nombre.' },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value ||
            data?.name
              ?.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
        ],
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      localized: true,
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Precio base en euros' },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Imágenes del producto',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'vinyls',
      type: 'array',
      label: 'Vinilos / Diseños',
      admin: {
        description:
          'Diseños de vinilo disponibles. El cliente elige uno al configurar la máquina y la imagen principal cambia en tiempo real.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          admin: { description: 'Nombre del diseño (ej: Space Invaders, Street Fighter…)' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { description: 'Imagen del vinilo (se mostrará como preview al seleccionarlo)' },
        },
        {
          name: 'priceModifier',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { description: 'Precio adicional en euros (0 si está incluido en el precio base)' },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'extras',
      type: 'array',
      label: 'Extras y opciones',
      admin: { description: 'Opciones adicionales que el cliente puede seleccionar al configurar' },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'text',
          localized: true,
          admin: { description: 'Descripción visible para el cliente' },
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { description: 'Precio base del extra en euros (para tipo Selección, es el precio de tener el extra; cada opción puede añadir más)' },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'checkbox',
          options: [
            { label: 'Casilla (sí/no)', value: 'checkbox' },
            { label: 'Selección de opción', value: 'select' },
            { label: 'Texto personalizado', value: 'text' },
          ],
          admin: { description: 'Casilla = el cliente marca o no. Selección = elige entre varias opciones. Texto = escribe libremente.' },
        },
        {
          name: 'options',
          type: 'array',
          label: 'Opciones disponibles',
          admin: {
            description: 'Solo para tipo "Selección de opción". Define las opciones que el cliente puede elegir.',
            condition: (_, siblingData) => siblingData?.type === 'select',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { description: 'Texto visible para el cliente (ej: "Joystick Americano")' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { description: 'Identificador interno sin espacios (ej: "joystick-americano")' },
            },
            {
              name: 'priceModifier',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Precio adicional de esta opción en euros (puede ser 0)' },
            },
          ],
        },
        {
          name: 'placeholder',
          type: 'text',
          localized: true,
          admin: {
            description: 'Texto de ayuda dentro del campo (solo para tipo Texto personalizado)',
            condition: (_, siblingData) => siblingData?.type === 'text',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Imagen ilustrativa del extra (opcional). Ej: foto del mando, pantalla, etc.',
          },
        },
      ],
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
