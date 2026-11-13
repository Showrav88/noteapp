import { INTEREST_OPTIONS } from '../config/interestOptions.js';

const allowedInterestValues = INTEREST_OPTIONS.map((o) => o.value);
const interestTag = { type: 'string', enum: allowedInterestValues };

const pageParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 50 } },
];

const message = { type: 'object', properties: { message: { type: 'string' } } };

const jsonBody = (schema, example) => ({
  required: true,
  content: {
    'application/json': {
      schema,
      example,
    },
  },
});

const registerBody = {
  type: 'object',
  required: ['name', 'email', 'password', 'interests'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', format: 'password' },
    interests: {
      type: 'array',
      minItems: 1,
      items: interestTag,
      description: 'Required. At least one value from GET /interests/options.',
    },
  },
};

const noteBody = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
  },
};

const postBody = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string' },
    body: { type: 'string' },
  },
};

const adminUserBody = {
  type: 'object',
  required: ['name', 'email', 'password', 'interests'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    interests: { type: 'array', minItems: 1, items: interestTag },
  },
};

const patchUserBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
    interests: { type: 'array', minItems: 1, items: interestTag },
  },
};

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
        requestBody: jsonBody(registerBody, {
          name: 'Alice',
          email: 'alice@example.com',
          password: 'securepass123',
          interests: ['chess', 'reading'],
        }),
        responses: { 201: { description: 'Created' }, 409: { description: 'Conflict' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: jsonBody(
          {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
            },
          },
          { email: 'alice@example.com', password: 'securepass123' },
        ),
        responses: { 200: { description: 'Token' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/interests/options': {
      get: {
        summary: 'Allowed interest tags (for register UI)',
        tags: ['Interests'],
        responses: {
          200: {
            description: '{ items: [{ value, label }] }',
          },
        },
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
        requestBody: jsonBody(adminUserBody, {
          name: 'Bob',
          email: 'bob@example.com',
          password: 'securepass123',
          interests: ['music'],
        }),
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
        requestBody: jsonBody(patchUserBody, { interests: ['chess', 'reading'] }),
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
        requestBody: jsonBody(noteBody, {
          title: 'My first note',
          body: 'Optional note text here.',
        }),
        responses: { 201: { description: 'Created' }, 400: { description: 'Bad request' } },
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
        requestBody: jsonBody(noteBody, { title: 'Updated title', body: 'Updated body' }),
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
      get: {
        summary: 'Post feed (all posts, login required)',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        parameters: pageParams,
        description:
          'Any logged-in user can browse every post. Newest first. Author name and email are included.',
        responses: { 200: { description: 'Paginated posts' }, 401: { description: 'Unauthorized' } },
      },
      post: {
        summary: 'Create post',
        tags: ['Posts'],
        security: [{ bearerAuth: [] }],
        requestBody: jsonBody(postBody, {
          title: 'My first post',
          body: 'Optional post content.',
        }),
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
