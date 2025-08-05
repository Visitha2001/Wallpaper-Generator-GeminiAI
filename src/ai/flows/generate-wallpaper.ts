'use server';

/**
 * @fileOverview Generates a wallpaper image based on a user-provided prompt.
 *
 * - generateWallpaper - A function that accepts a user prompt and returns the generated image URL.
 * - GenerateWallpaperInput - The input type for the generateWallpaper function.
 * - GenerateWallpaperOutput - The return type for the generateWallpaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWallpaperInputSchema = z.object({
  prompt: z
    .string()
    .describe('A detailed description of the wallpaper to generate.'),
});
export type GenerateWallpaperInput = z.infer<typeof GenerateWallpaperInputSchema>;

const GenerateWallpaperOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated wallpaper image.'),
});
export type GenerateWallpaperOutput = z.infer<typeof GenerateWallpaperOutputSchema>;

export async function generateWallpaper(input: GenerateWallpaperInput): Promise<GenerateWallpaperOutput> {
  return generateWallpaperFlow(input);
}

const generateWallpaperFlow = ai.defineFlow(
  {
    name: 'generateWallpaperFlow',
    inputSchema: GenerateWallpaperInputSchema,
    outputSchema: GenerateWallpaperOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A dark-themed, neon-style mobile wallpaper with an aspect ratio of 9:16. Prompt: ${input.prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
