'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Editor from '@/components/wallpaper/editor';
import AiTools from '@/components/tools/ai-tools';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    'https://placehold.co/375x812.png'
  );

  const handleImageSelected = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const handleImageGenerated = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <h1 className="text-3xl font-headline font-bold text-center lg:text-left" data-ai-hint="wallpaper editor">Wallpaper Editor</h1>
            <Editor selectedImage={selectedImage} onImageChange={handleImageSelected} />
          </div>

          <aside className="lg:col-span-4">
             <div className="sticky top-8 space-y-8">
              <h1 className="text-3xl font-headline font-bold text-center lg:text-left">AI Tools</h1>
              <AiTools onImageGenerated={handleImageGenerated} />
            </div>
          </aside>
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground font-headline">
        <p>Built with Neonize</p>
      </footer>
    </div>
  );
}
