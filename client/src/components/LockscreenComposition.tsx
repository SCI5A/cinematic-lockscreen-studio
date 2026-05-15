import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { NotificationLayerData } from '@shared/types';
import { IOS_NOTIFICATION_PHYSICS } from '@shared/types';

interface LockscreenCompositionProps {
  backgroundUrl?: string;
  notifications: NotificationLayerData[];
  width: number;
  height: number;
  fps: number;
}

export const LockscreenComposition: React.FC<LockscreenCompositionProps> = ({
  backgroundUrl,
  notifications,
  width,
  height,
  fps,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        width,
        height,
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      {backgroundUrl && (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Dark overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Notifications */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          paddingTop: 64,
          paddingLeft: 16,
          paddingRight: 16,
          pointerEvents: 'none',
        } as React.CSSProperties}
      >
        {notifications.map((notif, index) => (
          <NotificationCard
            key={index}
            notification={notif}
            index={index}
            frame={frame}
            fps={fps}
          />
        ))}
      </AbsoluteFill>

      {/* Time display */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 8,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: '300',
            color: 'white',
            letterSpacing: 2,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      </AbsoluteFill>

      {/* Home indicator */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            width: 128,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

interface NotificationCardProps {
  notification: NotificationLayerData;
  index: number;
  frame: number;
  fps: number;
}

function NotificationCard({
  notification,
  index,
  frame,
  fps,
}: NotificationCardProps) {
  const durationFrames = (notification.duration / 1000) * fps;
  const startFrame = index * (fps * 0.1); // 100ms stagger between notifications
  const endFrame = startFrame + durationFrames;

  // Calculate animation progress
  let progress = 0;
  if (frame >= startFrame && frame <= endFrame) {
    progress = (frame - startFrame) / durationFrames;
  } else if (frame > endFrame) {
    progress = 1;
  }

  // Spring animation using Remotion's spring function
  const springValue = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: 10,
      mass: 1,
      overshootClamping: false,
      stiffness: 100,
    },
  });

  // Interpolate animation values
  const scale = interpolate(
    progress,
    [0, 0.5, 1],
    [
      notification.startScale,
      notification.peakScale,
      1,
    ]
  );

  const blur = interpolate(
    progress,
    [0, 0.5, 1],
    [
      notification.startBlur,
      notification.peakBlur,
      0,
    ]
  );

  const opacity = interpolate(
    progress,
    [0, 0.5, 1],
    [
      notification.startOpacity,
      notification.peakOpacity,
      1,
    ]
  );

  const translateY = interpolate(
    progress,
    [0, 0.5, 1],
    [
      notification.startTranslateY,
      notification.peakTranslateY,
      0,
    ]
  );

  if (frame < startFrame || progress === 0) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        padding: 16,
        borderRadius: 16,
        backdropFilter: 'blur(20px)',
        backgroundColor: `${notification.color}33`,
        borderWidth: 1,
        borderColor: `${notification.color}66`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        gap: 12,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        opacity,
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
      } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: notification.color,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: 'white',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {notification.title}
        </div>
        {notification.subtitle && (
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {notification.subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
