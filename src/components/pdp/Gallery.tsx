"use client";

import Image from "next/image";
import { useState } from "react";

/** جاليري صور المنتج — صورة كبيرة + شريط مصغرات بستايل أمازون */
export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0] ?? "/placeholder.svg";

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
        <Image
          src={main}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${title} — ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition-colors ${
                i === active ? "border-orion-accent" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
