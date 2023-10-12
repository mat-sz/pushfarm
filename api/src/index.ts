/// <reference types="@kreds/fastify/types" />

import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import fastifyStatic from '@fastify/static';
import fastifyHttpProxy from '@fastify/http-proxy';
import { fastifyKredsUser, fastifyKredsRoutes } from '@kreds/fastify';
import path from 'path';
import webpush from 'web-push';

import { kreds } from './kreds.js';
import { logger } from './logger.js';
import { pushRoutes } from './routes/push.js';
import { devicesRoutes } from './routes/devices.js';
import { infoRoutes } from './routes/info.js';
import { config } from './config.js';

const prisma = new PrismaClient();
const app = Fastify({ logger });

if (!config.pushfarm.vapid) {
  console.log('Vapid details example:');
  console.log({
    subject: 'https://your-url.com',
    ...webpush.generateVAPIDKeys(),
  });
  throw new Error(
    'Vapid details are not available. Please set the `vapid` property in  the configuration file.'
  );
}
webpush.setVapidDetails(
  config.pushfarm.vapid.subject,
  config.pushfarm.vapid.publicKey,
  config.pushfarm.vapid.privateKey
);

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

app.decorate('prisma', prisma);
app.register(fastifyKredsUser, { kreds });
app.register(fastifyKredsRoutes, { prefix: '/kreds', kreds });
app.register(
  async fastify => {
    fastify.register(infoRoutes, { prefix: '/info' });
    fastify.register(pushRoutes, { prefix: '/push' });
    fastify.register(devicesRoutes, { prefix: '/devices' });
  },
  { prefix: '/api/v1' }
);

if (config.pushfarm.useProxy) {
  app.register(fastifyHttpProxy, {
    upstream: 'http://localhost:3000/',
    websocket: true,
  });
} else {
  const STATIC_ROOT = path.resolve('../web/build');

  app.setNotFoundHandler((_, reply) => {
    reply.sendFile('index.html', STATIC_ROOT);
  });
  app.register(fastifyStatic, {
    root: STATIC_ROOT,
    prefix: '/',
    index: 'index.html',
    decorateReply: false,
  });
}

app.listen({ port: 5000, host: '0.0.0.0' });
