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
3. The session cookie (fallguardian.sid) will be used for authenticated requests
4. You can then test protected endpoints like /users/me

### Session Configuration
This API uses cookie-based sessions with the following settings:
- Cookie name: fallguardian.sid
- SameSite: lax (to support OAuth redirects)
- Session expiration: 24 hours

### Troubleshooting
If you're having authentication issues, visit the [/api/debug/session](/api/debug/session) endpoint to view your current session state.

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
        name: 'fallguardian.sid',
      }
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
          age: {
            type: 'integer',
            description: 'User age',
            minimum: 0,
            maximum: 120
          },
          role: {
            type: 'string',
            enum: ['patient', 'nurse', 'admin'],
            description: 'User role',
          },
          phoneNumber: {
            type: 'string',
            description: 'User phone number in E.164 format',
          },
          fallStatus: {
            type: 'boolean',
            description: 'Whether patient has fallen (patient only)',
          },
          lastFallTimestamp: {
            type: 'string',
            format: 'date-time',
            description: 'When the last fall occurred (patient only)',
          },
          assignedPatients: {
            type: 'array',
            description: 'Patients assigned to the nurse (nurse only)',
            items: {
              type: 'string',
              description: 'Patient ID',
            }
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
          role: 'patient',
          age: 45,
          phoneNumber: '+12125551234',
          fallStatus: false,
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
                enum: ['patient', 'nurse', 'admin'],
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
      PatientAssignmentResponse: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Nurse ID',
          },
          name: {
            type: 'string',
            description: 'Nurse name',
          },
          email: {
            type: 'string',
            description: 'Nurse email',
          },
          role: {
            type: 'string',
            enum: ['nurse'],
            description: 'User role',
          },
          assignedPatients: {
            type: 'array',
            description: 'List of patient IDs assigned to this nurse',
            items: {
              type: 'string',
              description: 'Patient ID'
            }
          }
        },
        example: {
          _id: '60d5ec92fcf032e333a9cb14',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'nurse',
          assignedPatients: ['60d5ec92fcf032e333a9cb13']
        }
      },
      FallAlertResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates operation success',
          },
          message: {
            type: 'string',
            description: 'Status message',
          },
          patient: {
            $ref: '#/components/schemas/User',
          },
          nurse: {
            $ref: '#/components/schemas/User',
          }
        },
        example: {
          success: true,
          message: 'Fall alert sent to nurse',
          patient: {
            _id: '60d5ec92fcf032e333a9cb13',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'patient',
          },
          nurse: {
            _id: '60d5ec92fcf032e333a9cb14',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'nurse',
            phoneNumber: '+12125551234'
          }
        }
      },
      TextGenerationRequest: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            description: 'The text prompt to send to the AI model',
          },
          temperature: {
            type: 'number',
            description: 'Controls randomness in generation (0-1)',
            minimum: 0,
            maximum: 1,
            default: 0.6
          },
          model: {
            type: 'string',
            description: 'The AI model to use',
            default: 'meta-llama/Meta-Llama-3.1-70B-Instruct'
          },
          maxTokens: {
            type: 'integer',
            description: 'Maximum number of tokens to generate',
            default: 500
          },
          context: {
            type: 'string',
            description: 'Additional context about the patient or situation',
          }
        },
        example: {
          prompt: 'What are some safety tips to prevent falls in elderly patients?',
          temperature: 0.7,
          context: 'Patient is 78 years old with mobility issues'
        }
      },
      TextGenerationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates operation success',
          },
          prompt: {
            type: 'string',
            description: 'The original prompt that was sent',
          },
          response: {
            type: 'string',
            description: 'The generated text response from the AI model',
          }
        },
        example: {
          success: true,
          prompt: 'Write a short poem about healthcare.',
          response: 'Healing hands with gentle touch,\nGuiding souls through pain so much.\nIn corridors where hope remains,\nCompassion flows through weary veins.'
        }
      },
      ImageGenerationRequest: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            description: 'Text description of the image to generate',
          },
          model: {
            type: 'string',
            description: 'The AI model to use for image generation',
            default: 'stability-ai/sdxl'
          },
          responseFormat: {
            type: 'string',
            description: 'Format of the response',
            enum: ['url', 'b64_json'],
            default: 'url'
          },
          responseExtension: {
            type: 'string',
            description: 'Image format extension',
            enum: ['webp', 'png', 'jpeg'],
            default: 'webp'
          },
          width: {
            type: 'integer',
            description: 'Width of the generated image',
            default: 512
          },
          height: {
            type: 'integer',
            description: 'Height of the generated image',
            default: 512
          },
          numInferenceSteps: {
            type: 'integer',
            description: 'Number of denoising steps (affects quality)',
            default: 30
          },
          seed: {
            type: 'integer',
            description: 'Random seed for reproducible results (-1 for random)',
            default: -1
          },
          negativePrompt: {
            type: 'string',
            description: 'Elements to exclude from the image',
            default: ''
          }
        },
        example: {
          prompt: 'Senior patient using a walker in a well-lit room',
          width: 512,
          height: 512,
          negativePrompt: 'Blurry, distorted, dark, grayscale'
        }
      },
      ImageGenerationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates operation success',
          },
          prompt: {
            type: 'string',
            description: 'The prompt used for image generation',
          },
          url: {
            type: 'string',
            description: 'URL to the generated image',
          },
          model: {
            type: 'string',
            description: 'The model used for generation',
          }
        },
        example: {
          success: true,
          prompt: 'Medical visualization of senior patient using a walker in a well-lit room',
          url: 'https://example.com/generated-image.webp',
          model: 'stability-ai/sdxl'
        }
      },
      FormMessage: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'The message ID'
          },
          sender: {
            oneOf: [
              { type: 'string', description: 'User ID of the sender' },
              { $ref: '#/components/schemas/User' }
            ],
            description: 'The user who sent the message'
          },
          body: {
            type: 'string',
            description: 'The content of the message'
          },
          attachment: {
            type: 'string',
            description: 'URL to an attachment (if any)'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the message was sent'
          }
        }
      },
      Form: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'The form ID'
          },
          title: {
            type: 'string',
            description: 'Title of the form/request'
          },
          patient: {
            oneOf: [
              { type: 'string', description: 'Patient User ID' },
              { $ref: '#/components/schemas/User' }
            ],
            description: 'The patient who created the form'
          },
          nurse: {
            oneOf: [
              { type: 'string', description: 'Nurse User ID' },
              { $ref: '#/components/schemas/User' }
            ],
            description: 'The nurse assigned to the form'
          },
          status: {
            type: 'string',
            enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
            description: 'Current status of the form'
          },
          resolved: {
            type: 'boolean',
            description: 'Whether the form has been resolved'
          },
          resolvedBy: {
            oneOf: [
              { type: 'string', description: 'User ID who resolved the form' },
              { $ref: '#/components/schemas/User' }
            ],
            description: 'The user who resolved the form'
          },
          resolvedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the form was resolved'
          },
          messages: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/FormMessage'
            },
            description: 'Messages in the conversation thread'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the form was created'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the form was last updated'
          }
        }
      },
      CreateFormRequest: {
        type: 'object',
        required: ['title', 'nurse', 'body'],
        properties: {
          title: {
            type: 'string',
            description: 'Title of the form/request'
          },
          nurse: {
            type: 'string',
            description: 'ID of the nurse to assign the form to'
          },
          body: {
            type: 'string',
            description: 'Body content of the initial message'
          },
          attachment: {
            type: 'string',
            description: 'URL to an attachment (if any)'
          }
        },
        example: {
          title: 'Question about medication',
          nurse: '60d5ec92fcf032e333a9cb14',
          body: 'I have a question about my new prescription. When should I take it?'
        }
      },
      AddMessageRequest: {
        type: 'object',
        required: ['body'],
        properties: {
          body: {
            type: 'string',
            description: 'Content of the message'
          },
          attachment: {
            type: 'string',
            description: 'URL to an attachment (if any)'
          }
        },
        example: {
          body: 'Thank you for your response, I understand now.'
        }
      },
      FormStatsResponse: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total number of forms'
          },
          resolved: {
            type: 'integer',
            description: 'Number of resolved forms'
          },
          unresolved: {
            type: 'integer',
            description: 'Number of unresolved forms'
          },
          pending: {
            type: 'integer',
            description: 'Number of pending forms'
          },
          inProgress: {
            type: 'integer',
            description: 'Number of in-progress forms'
          },
          cancelled: {
            type: 'integer',
            description: 'Number of cancelled forms'
          }
        },
        example: {
          total: 10,
          resolved: 5,
          unresolved: 5,
          pending: 2,
          inProgress: 3,
          cancelled: 0
        }
      }
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
    {
      name: 'Nurses',
      description: 'Nurse-patient assignment management',
    },
    {
      name: 'Patients',
      description: 'Patient operations and fall detection',
    },
    {
      name: 'AI',
      description: 'AI text generation services',
    },
    {
      name: 'Forms',
      description: 'Form management',
    },
    {
      name: 'Debug',
      description: 'Debugging and troubleshooting',
    }
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
        description: 'Callback from Google OAuth. This endpoint handles the Google authentication response, saves the session data, and redirects to the dashboard. **Note: This endpoint is for internal use by the OAuth flow and cannot be tested directly in Swagger UI.**',
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
        description: 'Returns authentication success and user information. Requires a valid authenticated session.',
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
      post: {
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
          401: {
            description: 'Not authenticated',
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
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        description: 'Creates a new user with local authentication.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'User full name'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email address'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: 'User password'
                  },
                  role: {
                    type: 'string',
                    enum: ['patient', 'nurse', 'admin'],
                    description: 'User role'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          400: {
            description: 'Invalid registration data'
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login with email and password',
        tags: ['Authentication'],
        description: 'Authenticates a user with email and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email address'
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: 'User password'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Login successful'
                    },
                    user: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials'
          }
        }
      }
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
                required: ['name', 'email', 'age', 'role'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                  age: {
                    type: 'integer',
                    description: 'User age (0-120)',
                    minimum: 0,
                    maximum: 120
                  },
                  role: {
                    type: 'string',
                    enum: ['patient', 'nurse', 'admin'],
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'Phone number in E.164 format (e.g., +12125551234)',
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
                  age: {
                    type: 'integer',
                    description: 'User age (0-120)',
                    minimum: 0,
                    maximum: 120
                  },
                  role: {
                    type: 'string',
                    enum: ['patient', 'nurse', 'admin'],
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'Phone number in E.164 format',
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
                  age: {
                    type: 'integer',
                    description: 'User age (0-120)',
                    minimum: 0,
                    maximum: 120
                  },
                  phoneNumber: {
                    type: 'string',
                    description: 'Phone number in E.164 format'
                  }
                },
                example: {
                  name: 'Updated Name',
                  age: 35,
                  phoneNumber: '+12125551234'
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
    // Nurse Routes
    '/nurse/me/patients': {
      get: {
        summary: 'Get patients assigned to the current nurse',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        description: 'Retrieves all patients assigned to the currently logged-in nurse.',
        responses: {
          200: {
            description: 'List of patients assigned to the nurse',
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
          400: {
            description: 'User is not a nurse',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires nurse role)',
          },
        },
      },
    },
    '/nurse/me/patients/{patientId}/assign': {
      post: {
        summary: 'Assign a patient to the current nurse',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'patientId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Patient ID to assign',
          },
        ],
        responses: {
          200: {
            description: 'Patient assigned successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientAssignmentResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a nurse or target user is not a patient',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires nurse role)',
          },
          404: {
            description: 'Patient not found',
          },
        },
      },
    },
    '/nurse/me/patients/{patientId}': {
      delete: {
        summary: 'Remove a patient from the current nurse',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'patientId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Patient ID to remove',
          },
        ],
        responses: {
          200: {
            description: 'Patient removed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientAssignmentResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a nurse or patient is not assigned to this nurse',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires nurse role)',
          },
          404: {
            description: 'Nurse not found',
          },
        },
      },
    },
    '/nurse/{nurseId}/patients': {
      get: {
        summary: 'Get patients assigned to a specific nurse (admin only)',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nurseId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Nurse ID',
          },
        ],
        responses: {
          200: {
            description: 'List of patients assigned to the nurse',
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
          400: {
            description: 'User is not a nurse',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires admin role)',
          },
          404: {
            description: 'Nurse not found',
          },
        },
      },
    },
    '/nurse/{nurseId}/patients/{patientId}/assign': {
      post: {
        summary: 'Assign a patient to a specific nurse (admin only)',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nurseId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Nurse ID',
          },
          {
            in: 'path',
            name: 'patientId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Patient ID to assign',
          },
        ],
        responses: {
          200: {
            description: 'Patient assigned successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientAssignmentResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a nurse or target user is not a patient',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires admin role)',
          },
          404: {
            description: 'Nurse or patient not found',
          },
        },
      },
    },
    '/nurse/{nurseId}/patients/{patientId}': {
      delete: {
        summary: 'Remove a patient from a specific nurse (admin only)',
        tags: ['Nurses'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nurseId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Nurse ID',
          },
          {
            in: 'path',
            name: 'patientId',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Patient ID to remove',
          },
        ],
        responses: {
          200: {
            description: 'Patient removed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientAssignmentResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a nurse or patient is not assigned to this nurse',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires admin role)',
          },
          404: {
            description: 'Nurse not found',
          },
        },
      },
    },
    // Patient Routes
    '/patient/me/nurse': {
      get: {
        summary: 'Get the nurse assigned to the current patient',
        tags: ['Patients'],
        security: [{ cookieAuth: [] }],
        description: 'Retrieves information about the nurse assigned to the currently logged-in patient.',
        responses: {
          200: {
            description: 'Nurse details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          400: {
            description: 'User is not a patient',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires patient role)',
          },
          404: {
            description: 'No nurse assigned to this patient',
          },
        },
      },
    },
    '/patient/me/fall': {
      post: {
        summary: 'Send a fall alert to the assigned nurse',
        tags: ['Patients'],
        security: [{ cookieAuth: [] }],
        description: 'Sends an SMS alert to the nurse assigned to the current patient about a fall event.',
        responses: {
          200: {
            description: 'Fall alert sent successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FallAlertResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a patient or nurse has no phone number',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires patient role)',
          },
          404: {
            description: 'No nurse assigned to this patient',
          },
        },
      },
    },
    '/patient/{id}/fall': {
      post: {
        summary: 'Send a fall alert for any patient (admin only)',
        tags: ['Patients'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Patient ID',
          },
        ],
        responses: {
          200: {
            description: 'Fall alert sent successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FallAlertResponse',
                },
              },
            },
          },
          400: {
            description: 'User is not a patient or nurse has no phone number',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires admin role)',
          },
          404: {
            description: 'Patient not found or no nurse assigned',
          },
        },
      },
    },
    // AI Routes
    '/ai/generate': {
      post: {
        summary: 'Generate text using AI',
        tags: ['AI'],
        security: [{ cookieAuth: [] }],
        description: 'Sends a prompt to the AI model and returns the generated text response.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TextGenerationRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Text generation successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TextGenerationResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad request - Missing prompt',
          },
          401: {
            description: 'Not authenticated',
          },
          500: {
            description: 'Error processing AI request',
          },
        },
      },
    },
    '/ai/image': {
      post: {
        summary: 'Generate an image using AI',
        tags: ['AI'],
        security: [{ cookieAuth: [] }],
        description: 'Generates an image based on the provided text prompt using AI models.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ImageGenerationRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Image generation successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ImageGenerationResponse',
                },
              },
            },
          },
          400: {
            description: 'Bad request - Missing prompt',
          },
          401: {
            description: 'Not authenticated',
          },
          500: {
            description: 'Error generating image',
          },
        },
      },
    },
    // Form Routes
    '/forms': {
      post: {
        summary: 'Create a new form/request',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        description: 'Creates a new form with the authenticated user as the patient and an initial message.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateFormRequest',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Form created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Form',
                },
              },
            },
          },
          400: {
            description: 'Bad request - Missing required fields',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized (requires patient role)',
          },
          404: {
            description: 'Nurse not found',
          },
        },
      },
    },
    '/forms/me': {
      get: {
        summary: 'Get all forms for the current user',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        description: 'Retrieves all forms associated with the authenticated user based on their role (patient or nurse).',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['resolved', 'unresolved', 'pending', 'in-progress', 'cancelled'],
            },
            required: false,
            description: 'Filter forms by status',
          },
        ],
        responses: {
          200: {
            description: 'List of forms',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Form',
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Unauthorized role',
          },
        },
      },
    },
    '/forms/me/unresolved': {
      get: {
        summary: 'Get unresolved forms for the current user',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        description: 'Retrieves all unresolved forms for the authenticated user (patient or nurse).',
        responses: {
          200: {
            description: 'List of unresolved forms',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Form',
                  },
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Invalid role for this operation',
          },
        },
      },
    },
    '/forms/stats': {
      get: {
        summary: 'Get form statistics',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        description: 'Retrieves statistics about forms for the authenticated user.',
        responses: {
          200: {
            description: 'Form statistics',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/FormStatsResponse',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Unauthorized role',
          },
        },
      },
    },
    '/forms/{id}': {
      get: {
        summary: 'Get a specific form by ID',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Form ID',
          },
        ],
        responses: {
          200: {
            description: 'Form details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Form',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized to view this form',
          },
          404: {
            description: 'Form not found',
          },
        },
      },
    },
    '/forms/{id}/messages': {
      post: {
        summary: 'Add a message to a form',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Form ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AddMessageRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Message added successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Form',
                },
              },
            },
          },
          400: {
            description: 'Bad request - Message body is required',
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized to add messages to this form',
          },
          404: {
            description: 'Form not found',
          },
        },
      },
    },
    '/forms/{id}/resolve': {
      post: {
        summary: 'Mark a form as resolved',
        tags: ['Forms'],
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'string',
            },
            required: true,
            description: 'Form ID',
          },
        ],
        responses: {
          200: {
            description: 'Form resolved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Form',
                },
              },
            },
          },
          401: {
            description: 'Not authenticated',
          },
          403: {
            description: 'Not authorized to resolve this form',
          },
          404: {
            description: 'Form not found',
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