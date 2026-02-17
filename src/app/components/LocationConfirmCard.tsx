import { useEffect, useState } from "react";
import { MapPin, Info } from "lucide-react";
import { Card } from "./ui/card";

interface LocationConfirmCardProps {
  coords: GeolocationCoordinates;
}

export function LocationConfirmCard({ coords }: LocationConfirmCardProps) {
  const [address, setAddress] = useState<string>("Locating...");

  useEffect(() => {
    // Mock reverse geocoding - in production, use a real geocoding API
    const mockAddresses = [
      "Near Connaught Place, Delhi",
      "Near Sector 18, Noida",
      "Near Marine Drive, Mumbai",
      "Near MG Road, Bangalore",
      "Near Park Street, Kolkata",
    ];
    
    setTimeout(() => {
      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      setAddress(randomAddress);
    }, 1000);
  }, [coords]);

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Location Confirmation</h3>
        <p className="text-sm text-gray-600">
          Location is auto-detected to maintain report authenticity.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900 mb-1">
              📍 {address}
            </p>
            <p className="text-xs text-emerald-700 font-mono">
              {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-emerald-700">
            Location is auto-detected to maintain report authenticity. Manual editing is disabled.
          </p>
        </div>
      </div>
    </Card>
  );
}