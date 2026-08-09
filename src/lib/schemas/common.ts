import { z } from 'zod';

/** Shared Zod helpers — put entity schemas in `src/lib/schemas/{entity}.ts`. */
export const uuidSchema = z.string().uuid();
