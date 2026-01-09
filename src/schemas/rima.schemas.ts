import { z } from 'zod';

// Schema 1: GerarRimaInput
export const GerarRimaInputSchema = z.object({
  tema: z.string({
    required_error: 'O tema é obrigatório',
    invalid_type_error: 'O tema deve ser um texto',
  }).min(1, 'O tema não pode estar vazio'),

  estilo: z.string({
    required_error: 'O estilo é obrigatório',
    invalid_type_error: 'O estilo deve ser um texto',
  }).min(1, 'O estilo não pode estar vazio'),

  contexto: z.string({
    invalid_type_error: 'O contexto deve ser um texto',
  }).optional(),
});

// Schema 2: RimaOutput
export const RimaOutputSchema = z.object({
  versos: z.array(z.string(), {
    required_error: 'Os versos são obrigatórios',
    invalid_type_error: 'Os versos devem ser uma lista de textos',
  }).min(1, 'Deve haver pelo menos um verso'),

  score: z.number({
    required_error: 'A pontuação é obrigatória',
    invalid_type_error: 'A pontuação deve ser um número',
  }).min(0, 'A pontuação deve ser maior ou igual a 0')
    .max(100, 'A pontuação deve ser menor ou igual a 100'),

  metadata: z.object({
    usuario_id: z.string().optional(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
  }).optional(),
});

// Schema 3: HistoricoQuery (usa coerce para query params que vêm como string)
export const HistoricoQuerySchema = z.object({
  limit: z.coerce.number({
    invalid_type_error: 'O limite deve ser um número',
  }).int('O limite deve ser um número inteiro')
    .positive('O limite deve ser positivo')
    .max(100, 'O limite máximo é 100')
    .optional()
    .default(10),

  usuario_id: z.string({
    invalid_type_error: 'O ID do usuário deve ser um texto',
  }).uuid('O ID do usuário deve ser um UUID válido')
    .optional(),
});

// Type exports
export type GerarRimaInput = z.infer<typeof GerarRimaInputSchema>;
export type RimaOutput = z.infer<typeof RimaOutputSchema>;
export type HistoricoQuery = z.infer<typeof HistoricoQuerySchema>;
