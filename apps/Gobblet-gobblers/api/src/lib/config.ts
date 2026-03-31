const defaultCorsOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

const corsOrigins = (process.env.CORS_ORIGIN ?? defaultCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const config = {
    port: Number(process.env.PORT ?? 3001),
    corsOrigins,
    nodeEnv: process.env.NODE_ENV ?? "development",
};
