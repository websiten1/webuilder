"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";

// shadcnblocks.com no longer serves these assets publicly (403 AccessDenied) —
// using Simple Icons' CDN for the same four brand marks instead, pre-tinted white.
const logos = [
  {
    id: "logo-2",
    description: "Figma",
    image: "https://cdn.simpleicons.org/figma/ffffff",
    className: "h-7 w-auto",
  },
  {
    id: "logo-3",
    description: "Next.js",
    image: "https://cdn.simpleicons.org/nextdotjs/ffffff",
    className: "h-7 w-auto",
  },
  {
    id: "logo-6",
    description: "Supabase",
    image: "https://cdn.simpleicons.org/supabase/ffffff",
    className: "h-7 w-auto",
  },
  {
    id: "logo-8",
    description: "Vercel",
    image: "https://cdn.simpleicons.org/vercel/ffffff",
    className: "h-7 w-auto",
  },
];

export function LogosSlider() {
  return (
    <div className="relative h-[100px] w-full overflow-hidden">
      <InfiniteSlider
        className="flex h-full w-full items-center"
        duration={30}
        gap={48}
      >
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex w-32 items-center justify-center"
          >
            <img
              src={logo.image}
              alt={logo.description}
              className={`${logo.className} opacity-40 transition-opacity hover:opacity-80`}
            />
          </div>
        ))}
      </InfiniteSlider>
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 left-0 h-full w-[200px]"
        direction="left"
        blurIntensity={1}
      />
      <ProgressiveBlur
        className="pointer-events-none absolute top-0 right-0 h-full w-[200px]"
        direction="right"
        blurIntensity={1}
      />
    </div>
  );
}
