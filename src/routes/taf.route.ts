import { FastifyInstance } from 'fastify';
import { getRawTaf } from '../services/taf.service.js';

export async function tafRoutes(fastify: FastifyInstance) {
    fastify.get('/taf/:station', async (request, reply) => {
        const { station } = request.params as { station: string };

        try {
            const taf = await getRawTaf(station);

            if (!taf.success) {
                return reply.code(404).send(taf);
            }

            return reply.send(taf);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({
                success: false,
                station: station.toUpperCase(),
                data: { rawTAF: '', fcsts: [] }
            });
        }
    });
}
