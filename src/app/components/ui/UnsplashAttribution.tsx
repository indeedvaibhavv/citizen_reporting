/**
 * Required attribution component for Unsplash images
 * Place this wherever you display Unsplash images
 */

interface UnsplashAttributionProps {
  photographerName: string;
  photographerUsername: string;
  photoUrl: string;
}

export function UnsplashAttribution({
  photographerName,
  photographerUsername,
  photoUrl,
}: UnsplashAttributionProps) {
  return (
    <div className="text-xs text-gray-500 mt-2">
      Photo by{' '}
      <a
        href={`https://unsplash.com/@${photographerUsername}?utm_source=citizen_reporting&utm_medium=referral`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700"
      >
        {photographerName}
      </a>{' '}
      on{' '}
      <a
        href="https://unsplash.com?utm_source=citizen_reporting&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700"
      >
        Unsplash
      </a>
    </div>
  );
}