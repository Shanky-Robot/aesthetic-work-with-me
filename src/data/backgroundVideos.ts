export interface BackgroundVideo {
  id: string;
  label: string;
  src: string;
}

export const BACKGROUND_VIDEOS: BackgroundVideo[] = [
  { id: 'rainy-city', label: 'Rainy City at Night', src: '/videos/scene-rainy-city.mp4' },
  { id: 'sunny-desk', label: 'Sunny Minimal Workspace', src: '/videos/scene-sunny-desk.mp4' },
  { id: 'soft-gradient', label: 'Soft Gradient', src: '/videos/scene-soft-gradient.mp4' },
  { id: 'aesthetic-1', label: 'Aesthetic Scene 1', src: '/videos/scene-aesthetic-1.mp4' },
  { id: 'aesthetic-2', label: 'Aesthetic Scene 2', src: '/videos/scene-aesthetic-2.mp4' },
  { id: 'aesthetic-3', label: 'Aesthetic Scene 3', src: '/videos/scene-aesthetic-3.mp4' },
];
