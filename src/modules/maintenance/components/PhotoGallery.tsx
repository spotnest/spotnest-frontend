"use client";

import React, { useState } from "react";
import type { MaintenanceImage } from "../types/maintenance";

interface PhotoGalleryProps {
    images: MaintenanceImage[];
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!images || images.length === 0) {
        return <p className="text-xs text-slate-400 italic">No photos uploaded.</p>;
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2.5">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img.url)}
                        className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00696b] focus:ring-offset-2"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={img.url}
                            alt={`Maintenance attachment ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">View</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedImage}
                            alt="Full size maintenance image"
                            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg hover:bg-slate-100 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoGallery;
