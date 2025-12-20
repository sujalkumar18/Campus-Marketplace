import { z } from 'zod';
import { insertListingSchema, insertUserSchema, insertMessageSchema, listings, chats, messages, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.validation,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings',
      input: z.object({
        category: z.string().optional(),
        search: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof listings.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/listings/:id',
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings',
      input: insertListingSchema,
      responses: {
        201: z.custom<typeof listings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/listings/:id',
      input: insertListingSchema.partial(),
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  chats: {
    list: {
      method: 'GET' as const,
      path: '/api/chats',
      responses: {
        200: z.array(z.custom<typeof chats.$inferSelect & { listing: typeof listings.$inferSelect, otherUser: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/chats',
      input: z.object({ listingId: z.number() }),
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
      }
    },
    getMessages: {
      method: 'GET' as const,
      path: '/api/chats/:id/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      }
    },
    sendMessage: {
      method: 'POST' as const,
      path: '/api/chats/:id/messages',
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
