import { FastifyPluginCallback } from 'fastify';

import { config } from '../config.js';

export const infoRoutes: FastifyPluginCallback = async fastify => {
  fastify.get('/config', () => {
    return {
      vapid: {
        publicKey: config.pushfarm.vapid.publicKey,
      },
    };
  });
};
