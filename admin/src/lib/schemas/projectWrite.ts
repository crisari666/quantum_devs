import { z } from 'zod';

export const projectWriteSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10000),
  url: z.string().url(),
  images: z.array(z.string()).max(50).optional(),
  githubUrl: z.union([z.string().url(), z.literal('')]).optional(),
  featured: z.boolean(),
  technologyIds: z.array(z.string().min(1)),
});

export type ProjectWriteValues = z.infer<typeof projectWriteSchema>;
