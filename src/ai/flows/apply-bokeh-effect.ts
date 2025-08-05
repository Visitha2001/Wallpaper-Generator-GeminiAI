'use server';

/**
 * @fileOverview Applies a bokeh (background blur) effect to an image.
 *
 * - applyBokehEffect - A function that takes an image and returns a new image with a blurred background.
 * - ApplyBokehEffectInput - The input type for the applyBokehEffect function.
 * - ApplyBokehEffectOutput - The return type for the applyBokehEffect function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyBokehEffectInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "The image to process, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ApplyBokehEffectInput = z.infer<typeof ApplyBokehEffectInputSchema>;

const ApplyBokehEffectOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the processed image with background blur.'),
});
export type ApplyBokehEffectOutput = z.infer<typeof ApplyBokehEffectOutputSchema>;

export async function applyBokehEffect(input: ApplyBokehEffectInput): Promise<ApplyBokehEffectOutput> {
  return applyBokehEffectFlow(input);
}

const applyBokehEffectFlow = ai.defineFlow(
  {
    name: 'applyBokehEffectFlow',
    inputSchema: ApplyBokehEffectInputSchema,
    outputSchema: ApplyBokehEffectOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.imageUri}},
        {text: 'Re-render this image with a blurred background (bokeh effect), keeping the main subject in sharp focus. Do not change the subject or the overall composition.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media.url) {
      throw new Error('Image processing failed.');
    }

    return { imageUrl: media.url };
  }
);
