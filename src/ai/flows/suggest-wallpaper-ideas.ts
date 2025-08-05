'use server';

/**
 * @fileOverview Suggests wallpaper ideas based on a user-provided prompt, refining the prompt to include trending art styles.
 *
 * - suggestWallpaperIdea - A function that accepts a user prompt and returns a refined wallpaper idea.
 * - SuggestWallpaperIdeaInput - The input type for the suggestWallpaperIdea function.
 * - SuggestWallpaperIdeaOutput - The return type for the suggestWallpaperIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWallpaperIdeaInputSchema = z.object({
  prompt: z
    .string()
    .describe('A description of the desired wallpaper, e.g., "a city at night".'),
});
export type SuggestWallpaperIdeaInput = z.infer<typeof SuggestWallpaperIdeaInputSchema>;

const SuggestWallpaperIdeaOutputSchema = z.object({
  refinedPrompt: z
    .string()
    .describe('A refined version of the input prompt, incorporating trending art styles.'),
  seoTags: z.string().describe('SEO tags for the generated wallpaper idea'),
});
export type SuggestWallpaperIdeaOutput = z.infer<typeof SuggestWallpaperIdeaOutputSchema>;

export async function suggestWallpaperIdea(input: SuggestWallpaperIdeaInput): Promise<SuggestWallpaperIdeaOutput> {
  return suggestWallpaperIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWallpaperIdeaPrompt',
  input: {schema: SuggestWallpaperIdeaInputSchema},
  output: {schema: SuggestWallpaperIdeaOutputSchema},
  prompt: `You are a creative assistant that helps users generate wallpaper ideas for their phones.

The user will provide a prompt describing the wallpaper they want. You will refine this prompt to include trending art styles from ArtStation, if relevant, to improve the visual appeal of the wallpaper.

Trending art styles on ArtStation include: Photorealistic, Digital Art, Anime, Cartoon, Fantasy, Sci-Fi, Cyberpunk, Synthwave, Vaporwave, Low Poly, Isometric, Retro.

Original Prompt: {{{prompt}}}

Based on the original prompt, generate a refined prompt that includes trending art styles to enhance the wallpaper idea. Also, generate SEO tags for the wallpaper idea.

Respond in the following JSON format:
{
  "refinedPrompt": "the refined prompt",
  "seoTags": "SEO tags for the wallpaper idea"
}
`,
});

const suggestWallpaperIdeaFlow = ai.defineFlow(
  {
    name: 'suggestWallpaperIdeaFlow',
    inputSchema: SuggestWallpaperIdeaInputSchema,
    outputSchema: SuggestWallpaperIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
