import { noaaClient } from '../clients/noaa.client.js';
export async function getRawTaf(station: string) {
    const icao = station.trim().toUpperCase();

    const { data } = await noaaClient.get<any[]>('/taf', {
        params: {
            ids: icao,
            format: 'json'
        }
    });

    const taf = data?.[0];

    if (!taf) {
        return {
            success: false,
            station: icao,
            data: {
                rawTAF: '',
                fcsts: [],
                issueTime: null,
                validTimeFrom: null,
                validTimeTo: null
            }
        };
    }

    return {
        success: true,
        station: taf.icaoId ?? icao,
        data: {
            rawTAF: taf.rawTAF,
            fcsts: taf.fcsts ?? [],
            issueTime: taf.issueTime ?? null,
            validTimeFrom: taf.validTimeFrom ?? null,
            validTimeTo: taf.validTimeTo ?? null
        }
    };
}