import { z } from 'zod';
import { PUBLISH_STATUSES } from '#lib/constants/publish-status';

export const publishStatusSchema = z.enum(PUBLISH_STATUSES);
