'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateWallpaper } from '@/ai/flows/generate-wallpaper';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, RefreshCw, Wand2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EditorProps {
  selectedImage: string | null;
  onImageChange: (url: string) => void;
}

const generateSchema = z.object({
  prompt: z.string().min(10, { message: 'Please describe the wallpaper you want to generate in at least 10 characters.' }),
  style: z.string().optional(),
});
type GenerateFormValues = z.infer<typeof generateSchema>;


const initialFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  blur: 0,
};

const wallpaperStyles = [
  "Photorealistic",
  "Digital Art",
  "Anime",
  "Cartoon",
  "Fantasy",
  "Sci-Fi",
  "Cyberpunk",
  "Synthwave",
  "Vaporwave",
  "Minimalist",
  "Abstract",
  "Watercolor",
  "Oil Painting",
  "Low Poly"
];

export default function Editor({ selectedImage, onImageChange }: EditorProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [isGenerating, setGenerating] = useState(false);
  const imagePreviewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const generateForm = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: { prompt: '', style: 'Photorealistic' },
  });

  const handleFilterChange = (filterName: keyof typeof filters) => (value: number[]) => {
    setFilters(prev => ({ ...prev, [filterName]: value[0] }));
  };
  
  const resetFilters = () => {
    setFilters(initialFilters);
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          onImageChange(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDownload = () => {
    if (!selectedImage || !canvasRef.current) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = selectedImage;
  
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
  
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%) blur(${filters.blur}px)`;
      ctx.drawImage(image, 0, 0);
  
      const link = document.createElement('a');
      link.download = 'neonize-wallpaper.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    image.onerror = (err) => {
      console.error("Error loading image for canvas: ", err);
    }
  };
  
  const onGenerateSubmit: SubmitHandler<GenerateFormValues> = async (data) => {
    setGenerating(true);
    try {
      const result = await generateWallpaper({ prompt: data.prompt, style: data.style });
      onImageChange(result.imageUrl);
      toast({
        title: 'Success!',
        description: 'Your new wallpaper has been generated.',
      });
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


  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 p-4 flex items-center justify-center bg-card/50 min-h-[550px]">
          <div 
            ref={imagePreviewRef}
            className="relative w-[225px] h-[487px] shrink-0 rounded-2xl border-4 border-foreground/50 shadow-2xl overflow-hidden bg-black"
          >
             {selectedImage && (
              <Image
                ref={imageRef}
                key={selectedImage}
                src={selectedImage}
                alt="Wallpaper preview"
                fill
                className="object-cover transition-all duration-300"
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%) invert(${filters.invert}%) blur(${filters.blur}px)`,
                }}
                crossOrigin="anonymous"
                priority
              />
            )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
        <div className="md:col-span-7 p-6 space-y-6 self-center">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate"><ImageIcon className="mr-2 h-4 w-4" /> Generate</TabsTrigger>
              <TabsTrigger value="filters"><Wand2 className="mr-2 h-4 w-4" /> Filters</TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="pt-4">
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
                  <FormField
                    control={generateForm.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-2"
                          >
                            {wallpaperStyles.map((style) => (
                              <FormItem key={style} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={style} id={style} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={style}
                                  className="px-3 py-1.5 border rounded-full cursor-pointer transition-colors text-sm font-medium
                                    data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground 
                                    hover:bg-accent hover:text-accent-foreground"
                                >
                                  {style}
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
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
            </TabsContent>
            <TabsContent value="filters" className="pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brightness" className="font-headline">Brightness</Label>
                    <Slider id="brightness" value={[filters.brightness]} onValueChange={handleFilterChange('brightness')} max={200} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contrast" className="font-headline">Contrast</Label>
                    <Slider id="contrast" value={[filters.contrast]} onValueChange={handleFilterChange('contrast')} max={200} step={1} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="saturate" className="font-headline">Saturation</Label>
                    <Slider id="saturate" value={[filters.saturate]} onValueChange={handleFilterChange('saturate')} max={200} step={1} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="sepia" className="font-headline">Sepia</Label>
                    <Slider id="sepia" value={[filters.sepia]} onValueChange={handleFilterChange('sepia')} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grayscale" className="font-headline">Grayscale</Label>
                    <Slider id="grayscale" value={[filters.grayscale]} onValueChange={handleFilterChange('grayscale')} max={100} step={1} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invert" className="font-headline">Invert</Label>
                    <Slider id="invert" value={[filters.invert]} onValueChange={handleFilterChange('invert')} max={100} step={1} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="blur" className="font-headline">Blur</Label>
                    <Slider id="blur" value={[filters.blur]} onValueChange={handleFilterChange('blur')} max={10} step={1} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
             <Button asChild variant="outline" className="font-headline">
                <Label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4"/> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </Label>
            </Button>
            <Button onClick={handleDownload} className="bg-primary hover:bg-primary/90 font-headline">
              <Download className="mr-2 h-4 w-4"/> Download
            </Button>
             <Button onClick={resetFilters} variant="ghost" className="font-headline">
              <RefreshCw className="mr-2 h-4 w-4"/> Reset
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
