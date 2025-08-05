'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { suggestWallpaperIdea } from '@/ai/flows/suggest-wallpaper-ideas';
import { generateSeoTags } from '@/ai/flows/generate-seo-tags';
import { generateWallpaper } from '@/ai/flows/generate-wallpaper';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Wand2, Tags, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const ideaSchema = z.object({
  prompt: z.string().min(10, { message: 'Please describe your idea in at least 10 characters.' }),
});

const seoSchema = z.object({
  description: z.string().min(10, { message: 'Please describe the wallpaper in at least 10 characters.' }),
});

const generateSchema = z.object({
  prompt: z.string().min(10, { message: 'Please describe the wallpaper you want to generate in at least 10 characters.' }),
});


type IdeaFormValues = z.infer<typeof ideaSchema>;
type SeoFormValues = z.infer<typeof seoSchema>;
type GenerateFormValues = z.infer<typeof generateSchema>;

interface AiToolsProps {
  onImageGenerated: (url: string) => void;
}

export default function AiTools({ onImageGenerated }: AiToolsProps) {
  const [isIdeaLoading, setIdeaLoading] = useState(false);
  const [isSeoLoading, setSeoLoading] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [ideaResult, setIdeaResult] = useState<{ refinedPrompt: string; seoTags: string } | null>(null);
  const [seoResult, setSeoResult] = useState<string[] | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const { toast } = useToast();

  const ideaForm = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { prompt: '' },
  });

  const seoForm = useForm<SeoFormValues>({
    resolver: zodResolver(seoSchema),
    defaultValues: { description: '' },
  });

  const generateForm = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { prompt: '' },
  });

  const onIdeaSubmit: SubmitHandler<IdeaFormValues> = async (data) => {
    setIdeaLoading(true);
    setIdeaResult(null);
    try {
      const result = await suggestWallpaperIdea({ prompt: data.prompt });
      setIdeaResult(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to suggest wallpaper ideas. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIdeaLoading(false);
    }
  };

  const onSeoSubmit: SubmitHandler<SeoFormValues> = async (data) => {
    setSeoLoading(true);
    setSeoResult(null);
    try {
      const result = await generateSeoTags({ wallpaperDescription: data.description });
      setSeoResult(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate SEO tags. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSeoLoading(false);
    }
  };
  
  const onGenerateSubmit: SubmitHandler<GenerateFormValues> = async (data) => {
    setGenerating(true);
    setGeneratedImage(null);
    try {
      const result = await generateWallpaper({ prompt: data.prompt });
      setGeneratedImage(result.imageUrl);
      onImageGenerated(result.imageUrl);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate wallpaper. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'The text has been copied to your clipboard.',
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="idea" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="idea"><Wand2 className="mr-2 h-4 w-4" /> Suggest</TabsTrigger>
            <TabsTrigger value="generate"><ImageIcon className="mr-2 h-4 w-4" /> Generate</TabsTrigger>
            <TabsTrigger value="tags"><Tags className="mr-2 h-4 w-4" /> SEO Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="idea" className="p-6">
            <Form {...ideaForm}>
              <form onSubmit={ideaForm.handleSubmit(onIdeaSubmit)} className="space-y-4">
                <FormField
                  control={ideaForm.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Idea</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., a wolf howling at a neon moon, synthwave style" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isIdeaLoading} className="w-full">
                  {isIdeaLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Suggestion
                </Button>
              </form>
            </Form>
            {isIdeaLoading && <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin text-primary" />}
            {ideaResult && (
              <div className="mt-6 space-y-4 animate-in fade-in">
                <h4 className="font-headline font-semibold">AI Suggestion</h4>
                <div className="p-4 rounded-md bg-card border relative group">
                  <p className="font-body">{ideaResult.refinedPrompt}</p>
                   <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(ideaResult.refinedPrompt)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                 <h4 className="font-headline font-semibold">Suggested Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {ideaResult.seoTags.split(',').map((tag, i) => <Badge key={i} variant="secondary">{tag.trim()}</Badge>)}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="generate" className="p-6">
            <Form {...generateForm}>
              <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} className="space-y-4">
                <FormField
                  control={generateForm.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallpaper Prompt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A majestic wolf howling at a vibrant, neon moon in a dark forest, synthwave style." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating} className="w-full">
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Wallpaper
                </Button>
              </form>
            </Form>
            {isGenerating && <div className="text-center my-4"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground mt-2">Generating... this can take a moment.</p></div>}
            {generatedImage && (
               <div className="mt-6 space-y-4 animate-in fade-in">
                <h4 className="font-headline font-semibold">Generated Image</h4>
                <div className="rounded-md overflow-hidden border border-border">
                  <Image 
                    src={generatedImage}
                    alt="Generated Wallpaper"
                    width={375}
                    height={812}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="p-6">
            <Form {...seoForm}>
              <form onSubmit={seoForm.handleSubmit(onSeoSubmit)} className="space-y-4">
                <FormField
                  control={seoForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallpaper Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., A cyber-punk cityscape with flying cars and neon signs in purple and blue." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSeoLoading} className="w-full">
                  {isSeoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Tags
                </Button>
              </form>
            </Form>
             {isSeoLoading && <Loader2 className="mx-auto my-4 h-8 w-8 animate-spin text-primary" />}
            {seoResult && (
               <div className="mt-6 space-y-4 animate-in fade-in">
                <h4 className="font-headline font-semibold">Generated SEO Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {seoResult.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
