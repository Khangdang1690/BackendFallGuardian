/**
 * Swagger documentation definitions
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// API Documentation in JSON format
const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Express MongoDB API',
    version: '1.0.0',
    description: `RESTful API with Express and MongoDB
    
## Authentication
To test protected routes in this Swagger UI:
1. First authenticate by visiting [/api/auth/google](http://localhost:3000/api/auth/google) in the same browser
2. Once logged in, return to this Swagger UI
3. The session cookie will be used for authenticated requests
4. You can then test protected endpoints like /users/me

Protected routes are marked with a lock icon 🔒`,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          _id: {
            type: 'string',
            description: 'The auto-generated ID of the user',
          },
          name: {
            type: 'string',
            description: 'The name of the user',
          },
          email: {
            type: 'string',
            description: 'The email of the user',
            format: 'email',
          },
          googleId: {
            type: 'string',
            description: 'Google OAuth ID',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'The date the user was created',
          },
        },
        example: {
          _id: '60d5ec92fcf032e333a9cb13',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: '2021-06-25T12:00:00.000Z',
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if authentication is successful',
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The user ID',
              },
              name: {
                type: 'string',
                description: 'The user name',
              },
              email: {
                type: 'string',
                description: 'The user email',
              },
              role: {
                type: 'string',
                description: 'The user role',
                enum: ['user', 'admin'],
              },
            },
          },
        },
      },
      LogoutResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if logout was successful',
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
        },
        example: {
          success: true,
          message: 'Logout successful'
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication',
    },
    {
      name: 'Users',
      description: 'User management',
    },
  ],
  paths: {
    // Auth Routes
    '/auth/google': {
      get: {
        summary: 'Login with Google',
        tags: ['Authentication'],
        description: 'Redirects to Google for authentication. **Note: This endpoint cannot be tested directly in Swagger UI because it involves a redirect flow. Please use a browser to test this endpoint.**',
        externalDocs: {
          description: 'More info about OAuth flows',
          url: 'https://developers.google.com/identity/protocols/oauth2',
        },
        responses: {
          302: {
            description: 'Redirect to Google OAuth page',
          },
        },
        "x-swagger-ui-disabled": true,
      },
    },
    '/auth/google/callback': {
      get: {
        summary: 'Google OAuth callback',
        tags: ['Authentication'],
        description: 'Callback from Google OAuth. **Note: This endpoint is for internal use by the OAuth flow and cannot be tested directly in Swagger UI.**',
        responses: {
          302: {
            description: 'Redirect to dashboard on success or login on failure',
          },
        },
        "x-swagger-ui-disabled": true,
      },
    },
    '/auth/dashboard': {
      get: {
        summary: 'Dashboard',
        tags: ['Authentication'],
        description: 'Returns authentication success and user information',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardResponse',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
        },
      },
    },
    '/auth/logout': {
      get: {
        summary: 'Logout',
        tags: ['Authentication'],
        description: 'Logs out the current user by clearing the session and cookies.',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LogoutResponse',
                },
              },
            },
          },
          500: {
            description: 'Logout failed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false,
                    },
                    message: {
                      type: 'string',
                      example: 'Logout failed',
                    },
                    error: {
                      type: 'string',
                      example: 'Error message',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // User Routes
    '/users': {
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new user',
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'admin'],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Created user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          400: {
            description: 'Invalid data',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized',
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        summary: 'Get a user by ID',
        tags: ['Users'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          404: {
            description: 'User not found',
          },
        },
      },
      put: {
        summary: 'Update a user',
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                  role: {
                    type: 'string',
                    enum: ['user', 'admin'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated user',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          400: {
            description: 'Invalid data',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized',
          },
          404: {
            description: 'User not found',
          },
        },
      },
      delete: {
        summary: 'Delete a user',
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'User ID',
          },
        ],
        responses: {
          200: {
            description: 'User deleted',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized',
          },
          404: {
            description: 'User not found',
          },
        },
      },
    },
    '/users/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Current user profile',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
        },
      },
      put: {
        summary: 'Update current user profile',
        tags: ['Users'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                },
                example: {
                  name: 'Updated Name'
                }
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Updated user profile',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
        },
      },
    },
  },
};

// Swagger configuration
const swaggerSpec = swaggerJsdoc({
  definition: apiDocumentation,
  apis: [], // No need to scan files since we're defining everything here
});

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    withCredentials: true,
  },
  customCss: `
    .swagger-ui .topbar {
      background-color: #2c3e50;
    }
    .swagger-ui .info .title {
      color: #3498db;
    }
    .auth-instruction {
      margin: 20px 0;
      padding: 12px;
      background-color: #f8f9fa;
      border-left: 4px solid #3498db;
    }
  `
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
}; 