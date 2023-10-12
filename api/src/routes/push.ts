import { Device } from '@prisma/client';
import { FastifyPluginCallback } from 'fastify';
import createHttpError from 'http-errors';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import webpush from 'web-push';
import { v4 } from 'uuid';

const pushBody = {
  type: 'object',
  properties: {
    actions: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        title: { type: 'string' },
        icon: { type: 'string' },
        // TODO: add type and url?
      },
      required: ['action', 'title'],
    },
    title: { type: 'string' },
    body: { type: 'string' },
    badge: { type: 'string' },
    dir: { type: 'string' },
    icon: { type: 'string' },
    image: { type: 'string' },
    lang: { type: 'string' },
    renotify: { type: 'boolean' },
    requireInteraction: { type: 'boolean' },
    silent: { type: 'boolean' },
    tag: { type: 'string' },
    timestamp: { type: 'number' },
  },
  required: ['body'],
} as const satisfies JSONSchema;

export const pushRoutes: FastifyPluginCallback = async fastify => {
  fastify.post<{
    Body: FromSchema<typeof pushBody>;
  }>(
    '/',
    {
      schema: {
        body: pushBody,
      },
    },
    async request => {
      const authorization = request.headers.authorization;

      let devices: Device[] = [];
      if (authorization?.startsWith('Device')) {
        const token = authorization.split(' ')[1];
        if (!token) {
          throw createHttpError(404, 'Device not found');
        }

        const device = await fastify.prisma.device.findFirst({
          where: { token },
        });
        if (!device) {
          throw createHttpError(404, 'Device not found');
        }

        if (
          !device.subscription ||
          (device.expiresAt &&
            device.expiresAt?.getTime() > new Date().getTime())
        ) {
          throw createHttpError(400, 'Device has no active subscription');
        }

        devices = [device];
      } else {
        const user = request.user;
        if (!user) {
          throw createHttpError(403, 'Unauthorized');
        }

        devices = await fastify.prisma.device.findMany({
          where: {
            userId: user.id,
            subscription: { not: null },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        });
      }

      if (!devices.length) {
        throw createHttpError(400, 'No devices selected');
      }

      request.body.tag = v4();

      return await Promise.allSettled(
        devices.map(device =>
          webpush
            .sendNotification(
              JSON.parse(device.subscription!),
              JSON.stringify(request.body)
            )
            .then(({ statusCode, body }) => ({
              deviceId: device.id,
              deviceName: device.name,
              statusCode,
              body,
            }))
            .catch(error => ({
              deviceId: device.id,
              deviceName: device.name,
              statusCode: 500,
              body: String(error),
            }))
        )
      );
    }
  );
};
