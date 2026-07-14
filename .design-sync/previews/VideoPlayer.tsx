import { VideoPlayer } from "workout-app";

// Note: the youtube variant renders an <iframe> to youtube.com — external
// iframes are blocked in the design-preview sandbox, so we show the uploaded-
// video player (native <video>, no network needed) plus the error state.
export const UploadedVideo = () => (
  <VideoPlayer videoType="upload" videoUrl="/api/video/goblet-squat-demo.mp4" />
);

export const InvalidYouTubeUrl = () => (
  <VideoPlayer videoType="youtube" videoUrl="https://example.com/not-a-video" />
);
