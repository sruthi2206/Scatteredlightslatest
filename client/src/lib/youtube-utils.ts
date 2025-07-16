/**
 * Utility functions for handling YouTube URLs
 */

/**
 * Converts a YouTube watch URL to an embed URL format
 * @param url - The YouTube URL to convert
 * @returns The converted embed URL or null if not a valid YouTube URL
 */
export function convertYouTubeUrl(url: string): string | null {
  if (!url) return null;
  
  // Match different YouTube URL formats
  const ytRegExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(?:watch\?v=)?([^&]+)/;
  const match = url.match(ytRegExp);
  
  if (match && match[4]) {
    const videoId = match[4];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return null;
}

/**
 * Checks if a URL is a valid YouTube URL
 * @param url - The URL to check
 * @returns True if the URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Extracts the video ID from a YouTube URL
 * @param url - The YouTube URL
 * @returns The video ID or null if not a valid YouTube URL
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const ytRegExp = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(?:watch\?v=)?([^&]+)/;
  const match = url.match(ytRegExp);
  
  if (match && match[4]) {
    return match[4];
  }
  
  return null;
}
