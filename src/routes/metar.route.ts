import { FastifyInstance } from 'fastify';
import { getDecodedMetar } from '../services/metar.service.js';

export async function metarRoutes(fastify: FastifyInstance) {
    fastify.get('/metar/:station', async (request, reply) => {
        const { station } = request.params as { station: string };

        try {
            const metar = await getDecodedMetar(station);

            if (!metar.success) {
                return reply.code(404).send(metar);
            }

            return reply.send(metar);
        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({
                success: false,
                station: station.toUpperCase(),
                data: null
            });
        }
    });
}
