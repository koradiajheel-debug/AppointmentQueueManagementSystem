export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'QueueSmart API Documentation',
    version: '1.0.0',
    description:
      'High-throughput Smart Appointment & Dynamic Queue Management System API for clinics, banks, service centers, and colleges.',
    contact: {
      name: 'QueueSmart Core Engineering Team',
      email: 'engineering@queuesmart.app',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Production / Local API Server (v1)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token.',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['CITIZEN', 'STAFF', 'ADMIN'] },
        },
      },
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          serviceId: { type: 'string' },
          branchId: { type: 'string' },
          slotStart: { type: 'string', format: 'date-time' },
          slotEnd: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['BOOKED', 'CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'NO_SHOW', 'CANCELLED'] },
          priorityTier: { type: 'string', enum: ['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY'] },
        },
      },
      QueueTicket: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tokenNo: { type: 'string', example: 'A-101' },
          status: { type: 'string', enum: ['WAITING', 'CALLED', 'SERVING', 'DONE', 'SKIPPED'] },
          etaMinutes: { type: 'integer', example: 12 },
          peopleAhead: { type: 'integer', example: 3 },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a citizen user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', example: 'aarav@example.com' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Citizen created successfully' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Citizen login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailOrPhone', 'password'],
                properties: {
                  emailOrPhone: { type: 'string', example: 'aarav@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful with access and refresh tokens' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/admin-login': {
      post: {
        summary: 'Staff and Admin login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@cityclinic.org' },
                  password: { type: 'string', example: 'AdminSecure2026!' },
                  role: { type: 'string', enum: ['STAFF', 'ADMIN'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Admin authentication successful' },
          401: { description: 'Invalid credentials or non-admin role' },
        },
      },
    },
    '/branches': {
      get: {
        summary: 'List active branches with live queue depths and wait estimates',
        tags: ['Public & Branches'],
        responses: {
          200: { description: 'List of branches' },
        },
      },
    },
    '/services': {
      get: {
        summary: 'Get services for a branch',
        tags: ['Public & Branches'],
        parameters: [
          { name: 'branchId', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of services' },
        },
      },
    },
    '/slots': {
      get: {
        summary: 'Calculate available appointment slots dynamically',
        tags: ['Appointments'],
        parameters: [
          { name: 'serviceId', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', example: '2026-10-05' } },
        ],
        responses: {
          200: { description: 'Dynamic slots with capacity & availability' },
        },
      },
    },
    '/appointments': {
      post: {
        summary: 'Book an appointment (Double-booking protected)',
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branchId', 'serviceId', 'slotStart', 'slotEnd'],
                properties: {
                  branchId: { type: 'string' },
                  serviceId: { type: 'string' },
                  slotStart: { type: 'string', format: 'date-time' },
                  slotEnd: { type: 'string', format: 'date-time' },
                  priorityTier: { type: 'string', enum: ['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Appointment booked successfully' },
          409: { description: 'Slot unavailable or duplicate booking' },
        },
      },
      get: {
        summary: 'List appointments for authenticated citizen',
        tags: ['Appointments'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of user appointments' },
        },
      },
    },
    '/queue/join': {
      post: {
        summary: 'Join walk-in or virtual queue',
        tags: ['Queue Operations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branchId', 'serviceId', 'userName', 'userPhone'],
                properties: {
                  branchId: { type: 'string' },
                  serviceId: { type: 'string' },
                  userName: { type: 'string' },
                  userPhone: { type: 'string' },
                  priorityTier: { type: 'string', enum: ['NORMAL', 'SENIOR', 'DISABLED', 'PREGNANT', 'EMERGENCY'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Queue ticket issued' },
        },
      },
    },
    '/queue/ticket/{ticketId}': {
      get: {
        summary: 'Get live ticket status, queue position, and dynamic ETA',
        tags: ['Queue Operations'],
        parameters: [
          { name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Live ticket tracking details' },
        },
      },
    },
    '/admin/counters': {
      get: {
        summary: 'List counters for branch with live status and serving ticket',
        tags: ['Admin & Operations'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'branchId', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Counter state list' },
        },
      },
    },
    '/admin/queue/call-next': {
      post: {
        summary: 'Call next ticket according to priority tier and arrival order',
        tags: ['Admin & Operations'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['counterId'],
                properties: {
                  counterId: { type: 'string' },
                  serviceId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Ticket called to counter' },
        },
      },
    },
    '/admin/analytics': {
      get: {
        summary: 'Get SLA compliance, wait times, crowd hourly trends, and counter utilization',
        tags: ['Admin & Analytics'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Analytics summary metrics' },
        },
      },
    },
    '/admin/system-health': {
      get: {
        summary: 'Inspect database pool, Redis status, memory, and uptime',
        tags: ['Admin & Analytics'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'System health diagnostics' },
        },
      },
    },
  },
};
