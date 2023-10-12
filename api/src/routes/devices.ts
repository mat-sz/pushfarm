import { FastifyPluginCallback } from 'fastify';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import { Device } from '@prisma/client';

import { select } from '../helpers.js';

declare module 'fastify' {
  interface FastifyRequest {
    device: Device;
  }
}

const deviceBody = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    subscription: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
        expirationTime: { type: 'number' },
        keys: {
          type: 'object',
          properties: {
            p256dh: { type: 'string' },
            auth: { type: 'string' },
          },
          required: ['p256dh', 'auth'],
        },
      },
      required: ['endpoint'],
    },
  },
} as const satisfies JSONSchema;

const deviceSelect = {
  id: true,
  name: true,
  token: true,
  createdAt: true,
  updatedAt: true,
  subscription: true,
  expiresAt: true,
};

function bodyToSubscriptionData(
  body: FromSchema<typeof deviceBody>
): Partial<Device> {
  if (!body.subscription) {
    return {};
  }

  const subscription = body.subscription;
  return {
    subscription: JSON.stringify(subscription),
    expiresAt: subscription.expirationTime
      ? new Date(subscription.expirationTime)
      : undefined,
  };
}

export const devicesRoutes: FastifyPluginCallback = async fastify => {
  fastify.addHook('preHandler', fastify.expect!.toBeAuthenticated());

  fastify.get('/', async request => {
    const devices = await fastify.prisma.device.findMany({
      select: deviceSelect,
      where: { userId: request.user!.id },
    });

    return devices;
  });

  fastify.post<{
    Body: FromSchema<typeof deviceBody>;
  }>(
    '/',
    {
      schema: {
        body: deviceBody,
      },
    },
    async request => {
      const { name } = request.body;
      if (!name) {
        throw createHttpError(400, 'Name is required');
      }

      const device = await fastify.prisma.device.create({
        data: {
          name,
          token: randomBytes(64).toString('base64'),
          userId: request.user!.id,
          ...bodyToSubscriptionData(request.body),
        },
        select: deviceSelect,
      });

      return device;
    }
  );

  fastify.register(async fastify => {
    fastify.decorateRequest('space', null);

    fastify.addHook('preHandler', async request => {
      const id = parseInt((request.params as any)?.id);
      if (typeof id !== 'number' || isNaN(id)) {
        throw createHttpError(404, 'Device not found');
      }

      const device = await fastify.prisma.device.findFirst({
        where: { id, userId: request.user!.id },
      });
      if (!device) {
        throw createHttpError(404, 'Device not found');
      }

      request.device = device;
    });

    fastify.get('/:id', async request => {
      return select(request.device, deviceSelect);
    });

    fastify.patch<{ Body: FromSchema<typeof deviceBody> }>(
      '/:id',
      {
        schema: {
          body: deviceBody,
        },
      },
      async request => {
        return await fastify.prisma.device.update({
          where: { id: request.device.id },
          data: {
            name: request.body.name,
            ...bodyToSubscriptionData(request.body),
          },
          select: deviceSelect,
        });
      }
    );

    fastify.delete('/:id', async request => {
      await fastify.prisma.device.delete({
        where: { id: request.device.id },
      });
      return { ok: true };
    });
  });
};
