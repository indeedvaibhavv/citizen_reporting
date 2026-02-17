import { useState, useRef } from "react";
import { Camera, X, Image } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface LiveCameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export function LiveCameraCapture({ onCapture, onCancel }: LiveCameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setPreviewImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (previewImage) {
      onCapture(previewImage);
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Capture or Upload Photo
        </h3>
        <p className="text-sm text-gray-600">
          Take a photo or choose from gallery to report an environmental issue.
        </p>
      </div>

      {!previewImage ? (
        <div className="space-y-4">
          {/* Camera Option */}
          <div 
            onClick={handleCameraClick}
            className="aspect-[4/3] bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">Tap to open camera</p>
          </div>

          {/* Gallery Option */}
          <Button 
            onClick={handleGalleryClick} 
            variant="outline" 
            className="w-full"
          >
            <Image className="w-4 h-4 mr-2" />
            Choose from Gallery
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={previewImage} 
              alt="Captured preview" 
              className="w-full h-auto"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleRetake} 
              variant="outline" 
              className="flex-1"
            >
              Retake
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Use This Photo
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}