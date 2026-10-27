import MediaEmbed from "@/components/media/MediaEmbed";
import type { VideoValue } from "@/lib/portfolio/types";

import Reveal from "./Reveal";

export default function Showreel({ video, title }: { video: VideoValue; title: string }) {
  return (
    <section id="showreel" className="mx-auto max-w-7xl px-5 py-20 md:px-10">
      <Reveal>
        <p className="eyebrow mb-6">Showreel</p>
        <div className="aspect-video overflow-hidden rounded-3xl border border-line bg-surface">
          <MediaEmbed media={video} title={`${title} showreel`} />
        </div>
      </Reveal>
    </section>
  );
}
