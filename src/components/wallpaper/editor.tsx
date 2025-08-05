'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, RefreshCw } from 'lucide-react';

interface EditorProps {
  selectedImage: string | null;
  onImageChange: (url: string) => void;
}

const initialFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
};

export default function Editor({ selectedImage, onImageChange }: EditorProps) {
  const [filters, setFilters] = useState(initialFilters);
  const imagePreviewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
  
      ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
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
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`,
                }}
                crossOrigin="anonymous"
                priority
              />
            )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
        <div className="md:col-span-7 p-6 space-y-6 self-center">
          <h3 className="font-headline text-xl font-semibold">Customize</h3>
          <div className="space-y-4">
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
          </div>
          <div className="flex flex-wrap gap-2 pt-4">
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
