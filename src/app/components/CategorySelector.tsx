import { useState, useEffect } from 'react';
import { getCategoryImage } from "../../services/unsplashService";

interface CategoryCardProps {
  category: 'air' | 'garbage' | 'construction' | 'water';
  title: string;
  onClick: () => void;
}

export function CategoryCard({ category, title, onClick }: CategoryCardProps) {
  const [bgImage, setBgImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      const imageUrl = await getCategoryImage(category);
      setBgImage(imageUrl);
      setLoading(false);
    };
    loadImage();
  }, [category]);

  return (
    <div
      onClick={onClick}
      className="relative h-48 rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Background Image */}
      {loading ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      ) : (
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-xl font-bold">{title}</h3>
      </div>
    </div>
  );
}
export type IssueCategory = 'air' | 'garbage' | 'construction' | 'water';

interface CategorySelectorProps {
  selectedCategory: IssueCategory | null;
  onSelect: (category: IssueCategory) => void;
}

export function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  const categories = [
    { id: 'air' as const, title: '🏭 Air Pollution', icon: '🏭' },
    { id: 'garbage' as const, title: '🗑️ Garbage / Waste', icon: '🗑️' },
    { id: 'construction' as const, title: '🚧 Construction Dust', icon: '🚧' },
    { id: 'water' as const, title: '💧 Water Pollution', icon: '💧' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Issue Category</h3>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`${
              selectedCategory === cat.id ? 'ring-2 ring-emerald-600' : ''
            }`}
          >
            <CategoryCard
              category={cat.id}
              title={cat.title}
              onClick={() => onSelect(cat.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}