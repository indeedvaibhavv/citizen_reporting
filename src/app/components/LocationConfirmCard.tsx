import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { MapPin, Loader2 } from "lucide-react";

interface LocationConfirmCardProps {
  coords: GeolocationCoordinates;
}

interface AddressData {
  formattedAddress: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function LocationConfirmCard({ coords }: LocationConfirmCardProps) {
  const [address, setAddress] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      setLoading(true);
      setError(false);

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          console.warn('Google Maps API key not found, using coordinates only');
          setAddress({
            formattedAddress: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
          });
          setLoading(false);
          return;
        }

        // Google Maps Geocoding API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const result = data.results[0];
          const components = result.address_components;

          // Extract address parts
          const getComponent = (type: string) => {
            const component = components.find((c: any) => c.types.includes(type));
            return component?.long_name || '';
          };

          setAddress({
            formattedAddress: result.formatted_address,
            street: getComponent('route') || getComponent('premise'),
            area: getComponent('sublocality_level_1') || getComponent('sublocality'),
            city: getComponent('locality') || getComponent('administrative_area_level_2'),
            state: getComponent('administrative_area_level_1'),
            country: getComponent('country'),
          });
        } else {
          // Fallback to coordinates
          setAddress({
            formattedAddress: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
          });
        }
      } catch (err) {
        console.error('Error fetching address:', err);
        setError(true);
        // Fallback to coordinates
        setAddress({
          formattedAddress: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [coords.latitude, coords.longitude]);

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Location Confirmation</h3>
        <p className="text-sm text-gray-600">
          Location is auto-detected to maintain report authenticity.
        </p>
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <MapPin className="text-emerald-600" size={20} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center gap-2 text-emerald-700">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-sm">Detecting your location...</span>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-900 text-sm break-words">
                      {address?.formattedAddress || 'Location detected'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-emerald-700 font-mono">
                  {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                </p>

                {address?.city && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {address.area && (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                        {address.area}
                      </span>
                    )}
                    {address.city && (
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                        {address.city}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-300">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-emerald-700">
              Location is auto-detected to maintain report authenticity. Manual editing is disabled.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
          ⚠️ Could not fetch detailed address. Using coordinates only.
        </div>
      )}

      {/* Accuracy indicator */}
      {coords.accuracy && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Accuracy: ±{Math.round(coords.accuracy)}m</span>
        </div>
      )}
    </Card>
  );
}