'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO tags for a wallpaper.
 *
 * It takes a wallpaper description as input and returns a list of SEO tags.
 * @param {string} wallpaperDescription - Description of the wallpaper.
 * @returns {string[]} - A list of SEO tags.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoTagsInputSchema = z.object({
  wallpaperDescription: z
    .string()    
    .describe('A detailed description of the wallpaper content.'),
});
export type GenerateSeoTagsInput = z.infer<typeof GenerateSeoTagsInputSchema>;

const GenerateSeoTagsOutputSchema = z.array(z.string()).describe('A list of SEO tags relevant to the wallpaper.');
export type GenerateSeoTagsOutput = z.infer<typeof GenerateSeoTagsOutputSchema>;

export async function generateSeoTags(input: GenerateSeoTagsInput): Promise<GenerateSeoTagsOutput> {
  return generateSeoTagsFlow(input);
}

const generateSeoTagsPrompt = ai.definePrompt({
  name: 'generateSeoTagsPrompt',
  input: {schema: GenerateSeoTagsInputSchema},
  output: {schema: GenerateSeoTagsOutputSchema},
  prompt: `You are an SEO expert specializing in generating tags for wallpapers.

  Based on the description of the wallpaper, generate a list of SEO tags that are relevant to the content and current trends.
  Consider trending art styles, color schemes, and themes when generating the tags.
  The tags should be optimized for discoverability and promotion.

  Wallpaper Description: {{{wallpaperDescription}}}

  SEO Tags:`,
});

const generateSeoTagsFlow = ai.defineFlow(
  {
    name: 'generateSeoTagsFlow',
    inputSchema: GenerateSeoTagsInputSchema,
    outputSchema: GenerateSeoTagsOutputSchema,
  },
  async input => {
    const {output} = await generateSeoTagsPrompt(input);
    return output!;
  }
);
