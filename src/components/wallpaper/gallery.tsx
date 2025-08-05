import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GalleryProps {
  onImageSelect: (url: string) => void;
}

const galleryItems = [
  { src: 'https://placehold.co/375x812.png', hint: 'cyberpunk city' },
  { src: 'https://placehold.co/375x812.png', hint: 'synthwave sunset' },
  { src: 'https://placehold.co/375x812.png', hint: 'neon jungle' },
  { src: 'https://placehold.co/375x812.png', hint: 'glowing forest' },
  { src: 'https://placehold.co/375x812.png', hint: 'abstract shapes' },
  { src: 'https://placehold.co/375x812.png', hint: 'retro car' },
  { src: 'https://placehold.co/375x812.png', hint: 'space nebula' },
  { src: 'https://placehold.co/375x812.png', hint: 'futuristic warrior' },
];

export default function Gallery({ onImageSelect }: GalleryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-headline font-semibold">Gallery</h2>
      <div className="relative">
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {galleryItems.map((item, index) => (
              <Card
                key={index}
                className="w-40 shrink-0 overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                onClick={() => onImageSelect(item.src)}
              >
                <CardContent className="p-0">
                  <Image
                    src={item.src}
                    alt={`Gallery item ${index + 1}`}
                    width={160}
                    height={284}
                    className="aspect-[9/16] object-cover"
                    data-ai-hint={item.hint}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
