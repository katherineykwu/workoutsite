// Displays either a YouTube embed or an uploaded video file
"use client";

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface VideoPlayerProps {
  videoType: "youtube" | "upload" | "none";
  videoUrl: string;
}

export default function VideoPlayer({ videoType, videoUrl }: VideoPlayerProps) {
  if (videoType === "none" || !videoUrl) return null;

  if (videoType === "youtube") {
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
      return (
        <div className="bg-slate-100 px-4 py-3 text-sm text-slate-400">
          Invalid YouTube URL
        </div>
      );
    }

    return (
      <div className="relative w-full pt-[56.25%] bg-slate-900">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Exercise video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative w-full bg-slate-900">
      <video className="w-full" controls preload="metadata" src={videoUrl}>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
