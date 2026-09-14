import { useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';

/** Thin wrapper around expo-video — plays/pauses on `isActive`, reports end-of-playback via `onEnd`
 * and, if `onProgress` is passed, the current playback ratio (0-1) as it advances. */
export function VideoPlayer({ uri, isActive = false, muted = false, loop = false, resizeMode = 'cover', style, onEnd, onProgress }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = loop;
    p.muted = muted;
  });

  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);

  useEffect(() => {
    player.loop = loop;
  }, [player, loop]);

  useEffect(() => {
    if (isActive) player.play();
    else player.pause();
  }, [player, isActive]);

  useEventListener(player, 'playToEnd', () => onEnd?.());
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    if (onProgress && player.duration > 0) onProgress(currentTime / player.duration);
  });

  return <VideoView player={player} style={style} contentFit={resizeMode} nativeControls={false} />;
}
