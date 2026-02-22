import { useState, useEffect } from 'react';
import { getCityImage } from '../../services/unsplashService';

export function Hero() {
  const [cityImage, setCityImage] = useState<string>('');

  useEffect(() => {
    const loadCityImage = async () => {
      // Use user's city or default to "Smart City"
      const userCity = localStorage.getItem('userCity') || 'delhi';
      const imageUrl = await getCityImage(userCity);
      setCityImage(imageUrl);
    };
    loadCityImage();
  }, []);

  return (
    <div className="relative h-screen">
      {/* Background Image */}
      {cityImage && (
        <img
          src={cityImage}
          alt="City"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <h1 className="text-5xl font-bold mb-4">Citizen Reporting</h1>
        <p className="text-xl mb-8">Report environmental issues in real-time</p>
        <button className="px-8 py-3 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
          Get Started
        </button>
      </div>
    </div>
  );
}