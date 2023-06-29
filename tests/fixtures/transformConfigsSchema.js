const configsSchema = {
    type: 'object',
    properties: {
      total_items: { type: 'integer' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            transform_id: { type: 'string' },
            version: { type: 'integer' },
            enabled: { type: 'boolean' },
          },
          required: ['transform_id', 'version', 'enabled'],
        },
      },
    },
    required: ['total_items', 'items'],
  }

  export { configsSchema }