import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

interface TimelineEditorProps {
  duration: number; // milliseconds
  fps: number;
  currentFrame?: number;
  onFrameChange?: (frame: number) => void;
  isPlaying?: boolean;
  onPlayToggle?: (playing: boolean) => void;
}

export function TimelineEditor({
  duration,
  fps,
  currentFrame = 0,
  onFrameChange,
  isPlaying = false,
  onPlayToggle,
}: TimelineEditorProps) {
  const totalFrames = Math.ceil((duration / 1000) * fps);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const elapsed = currentTime - lastTimeRef.current;
      const frameDelta = (elapsed / 1000) * fps * playbackSpeed;
      const newFrame = Math.min(currentFrame + frameDelta, totalFrames);

      onFrameChange?.(newFrame);

      if (newFrame >= totalFrames) {
        onPlayToggle?.(false);
        lastTimeRef.current = 0;
      } else {
        lastTimeRef.current = currentTime;
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, currentFrame, fps, totalFrames, playbackSpeed, onFrameChange, onPlayToggle]);

  const currentTime = (currentFrame / fps) * 1000; // milliseconds
  const minutes = Math.floor(currentTime / 60000);
  const seconds = Math.floor((currentTime % 60000) / 1000);
  const milliseconds = Math.floor(currentTime % 1000);

  const handleFrameClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newFrame = Math.floor(percentage * totalFrames);
    onFrameChange?.(Math.max(0, Math.min(newFrame, totalFrames)));
  };

  return (
    <Card className="w-full p-4 bg-gray-50 dark:bg-gray-900 space-y-4">
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPlayToggle?.(!isPlaying)}
          className="h-9 w-9 p-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onFrameChange?.(0);
            onPlayToggle?.(false);
          }}
          className="h-9 w-9 p-0"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        {/* Time display */}
        <div className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300">
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}.
          {String(milliseconds).padStart(3, '0')}
        </div>

        {/* Playback speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      {/* Timeline scrubber */}
      <div className="space-y-2">
        <div
          onClick={handleFrameClick}
          className="relative w-full h-12 bg-gray-200 dark:bg-gray-800 rounded cursor-pointer overflow-hidden group"
        >
          {/* Ruler */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: Math.ceil(totalFrames / 30) }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-gray-300 dark:border-gray-700"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  {i * 30}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500/30 transition-all"
            style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 w-1 h-full bg-blue-500 transition-all"
            style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
          />
        </div>

        {/* Frame counter */}
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Frame: {Math.floor(currentFrame)} / {totalFrames}</span>
          <span>Duration: {(duration / 1000).toFixed(2)}s</span>
        </div>
      </div>

      {/* Frame navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFrameChange?.(Math.max(0, currentFrame - 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Slider
          value={[currentFrame]}
          onValueChange={(value) => onFrameChange?.(value[0])}
          min={0}
          max={totalFrames}
          step={1}
          className="flex-1"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => onFrameChange?.(Math.min(totalFrames, currentFrame + 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
