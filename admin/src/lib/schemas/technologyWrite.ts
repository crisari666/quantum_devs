import { z } from 'zod';

export const technologyWriteSchema = z.object({
  name: z.string().min(1).max(120),
  iconKey: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
});

export type TechnologyWriteValues = z.infer<typeof technologyWriteSchema>;
