const pageParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
];

const message = { type: 'object', properties: { message: { type: 'string' } } };

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Notes API',
    version: '1.0.0',
    description: 'noteapp backend — auth, notes, posts, aggregations',
  },
  servers: [{ url: '/', description: 'Current host' }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' }, 409: { description: 'Conflict' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Token' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/users/me': {
      get: {
        summary: 'Current user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Profile' } },
      },
    },
    '/users/by-interest': {
      get: {
        summary: 'Scenario 1 — users grouped by interest',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        responses: { 200: { description: 'Paginated interest groups' } },
      },
    },
    '/users': {
      get: {
        summary: 'List users (admin)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        responses: { 200: { description: 'Paginated users' }, 403: { description: 'Forbidden' } },
      },
      post: {
        summary: 'Create user (admin)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/users/{id}': {
      get: {
        summary: 'Get user (admin)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User' }, 404: { description: 'Not found' } },
      },
      patch: {
        summary: 'Update user (admin)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete user (admin)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: message } } } },
      },
    },
    '/users/{id}/posts': {
      get: {
        summary: 'Scenario 2 — user posts (aggregation)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [...pageParams, { name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User with posts' }, 404: { description: 'Not found' } },
      },
    },
    '/notes': {
      get: {
        summary: 'My notes',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        responses: { 200: { description: 'Paginated notes' } },
      },
      post: {
        summary: 'Create note',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
    '/notes/all': {
      get: {
        summary: 'All notes (admin)',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        responses: { 200: { description: 'Paginated' }, 403: { description: 'Forbidden' } },
      },
    },
    '/notes/{id}': {
      get: {
        summary: 'Get note',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Note' }, 404: { description: 'Not found' } },
      },
      patch: {
        summary: 'Update own note',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        summary: 'Delete own note',
        tags: ['Notes'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/posts': {
      post: {
        summary: 'Create post',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Created' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
