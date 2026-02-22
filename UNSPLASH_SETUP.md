# Unsplash API Integration Guide

## 1. Get API Key
1. Go to https://unsplash.com/developers
2. Create new application
3. Copy Access Key

## 2. Add to Environment Variables

Create or edit `frontend/.env`:
```env
VITE_UNSPLASH_ACCESS_KEY=your_access_key_here
```

## 3. Add Service File

Copy `unsplashService.ts` to:
```
src/services/unsplashService.ts
```

## 4. Usage Examples

### Get Random Category Image:
```typescript
import { getCategoryImage } from './services/unsplashService';

const imageUrl = await getCategoryImage('garbage');
```

### Get City Skyline:
```typescript
import { getCityImage } from './services/unsplashService';

const cityUrl = await getCityImage('Delhi');
```

### Search Images:
```typescript
import { searchImages } from './services/unsplashService';

const images = await searchImages('pollution', 5);
```

## 5. Where to Use Unsplash Images

### Landing Page (Home.tsx)
- Hero section background → city skyline
- Feature section images → environmental themes

### Category Selector
- Each category card background → relevant issue images
- Makes categories more visually appealing

### Guidelines Page
- Show good vs bad photo examples
- Help users understand what to capture

### Report History
- Placeholder for reports without images
- Background patterns based on issue type

### Dashboard
- City overview section backgrounds
- Stats cards with relevant imagery

## 6. Best Practices

### Cache Images
```typescript
const [cachedImage, setCachedImage] = useState<string>('');

useEffect(() => {
  const cached = localStorage.getItem(`unsplash_${category}`);
  if (cached) {
    setCachedImage(cached);
  } else {
    getCategoryImage(category).then(url => {
      setCachedImage(url);
      localStorage.setItem(`unsplash_${category}`, url);
    });
  }
}, [category]);
```

### Trigger Downloads
```typescript
import { triggerDownload } from './services/unsplashService';

// When user views an image
useEffect(() => {
  if (image?.links?.download_location) {
    triggerDownload(image.links.download_location);
  }
}, [image]);
```

### Always Show Attribution
```tsx
<img src={imageUrl} alt="Description" />
<UnsplashAttribution
  photographerName={image.user.name}
  photographerUsername={image.user.username}
  photoUrl={image.links.html}
/>
```

## 7. API Rate Limits

**Free Tier:**
- 50 requests per hour
- Production: 5,000 requests per hour (need to apply)

**Optimization Tips:**
- Cache images in localStorage
- Use smaller image sizes (`urls.small` instead of `urls.full`)
- Load images on-demand, not all at once
- Consider using same image for category until user refreshes

## 8. Example: Update Your CategorySelector

```tsx
// src/app/components/CategorySelector.tsx

import { useState, useEffect } from 'react';
import { getCategoryImage } from '../services/unsplashService';

export function CategoryCard({ category, title, icon, onClick }) {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    getCategoryImage(category).then(setBgImage);
  }, [category]);

  return (
    <div
      onClick={onClick}
      className="relative h-32 rounded-xl overflow-hidden cursor-pointer"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <div className="text-3xl mb-2">{icon}</div>
          <p className="font-semibold">{title}</p>
        </div>
      </div>
    </div>
  );
}
```

## 9. Testing

After setup, test it:
```typescript
import { searchImages } from './services/unsplashService';

// In console
searchImages('garbage pollution', 1).then(console.log);
```

Should return an array of image objects.

## 10. Fallback Images

Always have fallback images in case API fails:

```typescript
const defaultImages = {
  air: '/assets/air-default.jpg',
  garbage: '/assets/garbage-default.jpg',
  construction: '/assets/construction-default.jpg',
  water: '/assets/water-default.jpg',
};

const imageUrl = await getCategoryImage(category) || defaultImages[category];
```

## Complete Integration Checklist

- [ ] Get Unsplash API key
- [ ] Add to `.env` file
- [ ] Copy `unsplashService.ts` to `src/services/`
- [ ] Update category cards with backgrounds
- [ ] Add hero image to landing page
- [ ] Add attribution component
- [ ] Test API calls
- [ ] Add localStorage caching
- [ ] Add fallback images
- [ ] Commit and push to GitHub