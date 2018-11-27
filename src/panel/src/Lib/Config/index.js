const env = process.env.NODE_COMMAND || 'build';

export const api = env == "build" ? "/api/" : "http://localhost:8082/";
export const base = "/";
