import { useState, useEffect } from 'react';

export interface YouTubePlaylist {
  id: string;
  title: string;
  thumbnail: string;
}

export const useYouTubePlaylists = (token: string | null) => {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      return;
    }

    const fetchPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch playlists');
        const data = await res.json();
        
        const mapped = data.items.map((item: any) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.default?.url || ''
        }));
        setPlaylists(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [token]);

  return { playlists, loading, error };
};
