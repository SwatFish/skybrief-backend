import dotenv from "dotenv";
dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    NOAA_BASE_URL: process.env.NOAA_BASE_URL || "https://aviationweather.gov",
    CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || "60"),
    USER_AGENT: process.env.USER_AGENT || "SkyBriefAPI/1.0",
    ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "*").split(",")
};