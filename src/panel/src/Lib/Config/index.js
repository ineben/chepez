const env = process.env.NODE_COMMAND || 'test';

export const api = /*env == "build" ? */"/api/"/* : "http://localhost:8082/"*/;
export const base = "/";
