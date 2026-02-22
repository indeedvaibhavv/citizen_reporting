import { useState, useEffect } from 'react';
import { searchImages } from '../../services/unsplashService';

export function GuidelineGallery() {
  const [examples, setExamples] = useState<Array<{url: string, title: string}>>([]);

  useEffect(() => {
    const loadExamples = async () => {
      const [good, bad] = await Promise.all([
        searchImages('clear environmental problem photo', 3),
        searchImages('blurry unclear photo', 3),
      ]);

      setExamples([
        ...good.map(img => ({ url: img.urls.small, title: '✅ Good Example' })),
        ...bad.map(img => ({ url: img.urls.small, title: '❌ Avoid This' })),
      ]);
    };
    loadExamples();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Photo Guidelines</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {examples.map((example, idx) => (
          <div key={idx} className="space-y-2">
            <img
              src={example.url}
              alt={example.title}
              className="w-full h-40 object-cover rounded-lg"
            />
            <p className="text-sm font-medium text-center">{example.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}