"use client";

import { useState } from "react";
import Image from "next/image";
import type { Property } from "../types";

interface PropertyGalleryProps {
    property: Property;
}

export default function PropertyGallery({ property }: PropertyGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const images = property.images;
    const image = images[activeIndex]?.url ?? images[0]?.url;

    return (
        <div>
            <div className="relative aspect-[1.2/1] overflow-hidden rounded-2xl bg-[#e7e8e9]">
                {image && (
                    <Image
                        src={image}
                        alt={property.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        preload
                        className="object-cover"
                    />
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                    {images.map((img, index) => (
                        <button
                            key={img.publicId || index}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            aria-label={`View image ${index + 1}`}
                            className={`overflow-hidden rounded-lg border-2 transition ${
                                index === activeIndex
                                    ? "border-[#00696b]"
                                    : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                        >
                            <Image
                                src={img.url}
                                alt=""
                                width={112}
                                height={80}
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}