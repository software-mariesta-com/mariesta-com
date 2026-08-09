/** Explicit client/server UUID generation. Prefer DB `.defaultRandom()` for primary keys. */
export { v4 as uuid, v7 as uuidv7, validate as isUuid } from 'uuid';
