export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

// Placeholder metadata. Audio files should be placed in public/audio.
// Sourced from copyright-safe / CC sources (e.g., YouTube Audio Library).
export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Lofi Study',
    artist: 'CC Audio',
    url: '/audio/lofi-study.mp3',
  },
  {
    id: '2',
    title: 'Aesthetic Chill',
    artist: 'No Copyright Music',
    url: '/audio/aesthetic-chill.mp3',
  },
  {
    id: '3',
    title: 'Ambient Rain',
    artist: 'Nature Sounds',
    url: '/audio/ambient-rain.mp3',
  }
];
