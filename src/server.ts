import Fastify from 'fastify';
import { tafRoutes } from './routes/taf.route.js';
import cors from '@fastify/cors';
import { metarRoutes } from './routes/metar.route.js';

const fastify = Fastify({ logger: true });

async function start() {
    await fastify.register(cors, {
        origin: ['http://localhost:8080', 'https://vcom.dev'],
        methods: ['GET', 'OPTIONS'],
    });

    fastify.register(tafRoutes);
    fastify.register(metarRoutes);

    try {
        try {
            const port = Number(process.env.PORT) || 3000;

            await fastify.listen({
                port,
                host: "0.0.0.0",
            });

            fastify.log.info(`Server listening on 0.0.0.0:${port}`);
        } catch (err) {
            fastify.log.error(err);
            process.exit(1);
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
