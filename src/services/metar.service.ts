import { noaaClient } from '../clients/noaa.client.js';

export type FlightCategory = 'VFR' | 'MVFR' | 'IFR' | 'LIFR';

export type DecodedMetar = {
    raw: string;
    station: string;
    time: string;
    flightCategory: FlightCategory;
    wind: {
        direction: number | 'VRB';
        speed: number;
        gust?: number;
        unit: 'KT' | 'MPS';
    };
    visibility: {
        value: number;
        unit: 'SM' | 'M';
        qualitative: 'Good' | 'Marginal' | 'Poor';
    };
    ceiling?: {
        height: number;
        type: 'BKN' | 'OVC' | 'VV';
    };
    clouds: Array<{
        cover: 'FEW' | 'SCT' | 'BKN' | 'OVC' | 'CLR' | 'SKC' | 'VV';
        height?: number;
    }>;
    weather: string[];
    temperature: number;
    dewpoint: number;
    altimeter: {
        value: number;
        unit: 'inHg' | 'hPa';
    };
    remarks?: string;
}




type NoaaMetar = {
    icaoId?: string;
    rawOb?: string;        // vaak gebruikt door NOAA
    rawText?: string;      // fallback (soms)
    obsTime?: string;      // ISO8601 volgens docs (nieuwere API) :contentReference[oaicite:1]{index=1}
    reportTime?: string;   // fallback
    fltCat?: FlightCategory;
    wdir?: number | 'VRB' | null;
    wspd?: number | null;
    wgst?: number | null;
    visib?: number | string | null;
    wxString?: string | null;
    clouds?: Array<{ cover: string; base?: number | null; type?: string | null }>;
    temp?: number | null;
    dewp?: number | null;
    altim?: number | null; // vaak inHg (29.92 etc)
    remarks?: string | null;
};

export async function getDecodedMetar(station: string): Promise<{ success: boolean; station: string; data: DecodedMetar | null }> {
    const icao = station.trim().toUpperCase();

    const { data } = await noaaClient.get<NoaaMetar[]>('/metar', {
        params: { ids: icao, format: 'json' }
    });

    const m = data?.[0];
    if (!m) {
        return { success: false, station: icao, data: null };
    }

    const raw = m.rawOb ?? m.rawText ?? '';
    const time = m.obsTime ?? m.reportTime ?? new Date().toISOString();

    const windDir: number | 'VRB' = m.wdir === 'VRB' ? 'VRB' : (typeof m.wdir === 'number' ? m.wdir : 'VRB');
    const windSpd = typeof m.wspd === 'number' ? m.wspd : 0;
    const windGst = typeof m.wgst === 'number' ? m.wgst : undefined;

    // Visibility: NOAA kan number of string zijn (bv "10+") → maak er een number van
    const visNum =
        typeof m.visib === 'number'
            ? m.visib
            : typeof m.visib === 'string'
                ? Number.parseFloat(m.visib) || 0
                : 0;

    const qualitative: 'Good' | 'Marginal' | 'Poor' =
        visNum >= 5 ? 'Good' : visNum >= 3 ? 'Marginal' : 'Poor';

    const clouds = (m.clouds ?? []).map((c) => ({
        cover: (c.cover as DecodedMetar['clouds'][number]['cover']) ?? 'SKC',
        height: typeof c.base === 'number' ? c.base : undefined
    }));

    // Ceiling = laagste BKN/OVC/VV met base
    const ceilingCandidates = (m.clouds ?? [])
        .filter((c) => (c.cover === 'BKN' || c.cover === 'OVC' || c.cover === 'VV') && typeof c.base === 'number')
        .map((c) => ({ type: c.cover as 'BKN' | 'OVC' | 'VV', height: c.base as number }))
        .sort((a, b) => a.height - b.height);

    const ceiling = ceilingCandidates[0];

    // Altimeter unit heuristiek: inHg ~ 28-32, hPa ~ 980-1050
    const altRaw = typeof m.altim === 'number' ? m.altim : 0;
    const altimeter =
        altRaw > 100
            ? { value: altRaw, unit: 'hPa' as const }
            : { value: altRaw, unit: 'inHg' as const };

    const weather = m.wxString ? m.wxString.split(' ').filter(Boolean) : [];

    const decoded: DecodedMetar = {
        raw,
        station: m.icaoId ?? icao,
        time,
        flightCategory: m.fltCat ?? 'VFR', // NOAA voegt fltCat toe in JSON output :contentReference[oaicite:2]{index=2}
        wind: {
            direction: windDir,
            speed: windSpd,
            gust: windGst,
            unit: 'KT'
        },
        visibility: {
            value: visNum,
            unit: 'SM',
            qualitative
        },
        ceiling: ceiling ? { height: ceiling.height, type: ceiling.type } : undefined,
        clouds,
        weather,
        temperature: typeof m.temp === 'number' ? m.temp : 0,
        dewpoint: typeof m.dewp === 'number' ? m.dewp : 0,
        altimeter,
        remarks: m.remarks ?? undefined
    };

    return { success: true, station: decoded.station, data: decoded };
}
