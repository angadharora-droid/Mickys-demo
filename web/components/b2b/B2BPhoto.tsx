import Image from "next/image";

type Photo = { src: string; alt: string; brief: string };
type Props = { photo: Photo; available: boolean; sizes: string; className?: string; priority?: boolean };

/**
 * A photography slot. Shows the photo once the file exists at photo.src; until then an
 * art-directed maroon panel (the brief is visible in development only, never on the live site).
 */
export default function B2BPhoto({ photo, available, sizes, className = "", priority }: Props) {
  return (
    <div className={`b2b-photo ${className}`} data-photo={available ? undefined : `pending: ${photo.src}`}>
      {available ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="b2b-photo-ph" role="presentation">
          <span className="b2b-photo-grid" aria-hidden="true" />
          {process.env.NODE_ENV !== "production" && (
            <span className="b2b-photo-brief">Photo pending · {photo.brief}<br />{photo.src}</span>
          )}
        </div>
      )}
    </div>
  );
}
