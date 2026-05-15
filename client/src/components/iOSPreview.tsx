import { motion } from 'framer-motion';
import { IOS_NOTIFICATION_PHYSICS } from '@shared/types';
import type { NotificationLayerData } from '@shared/types';

interface iOSPreviewProps {
  backgroundUrl?: string;
  notifications?: NotificationLayerData[];
  isPlaying?: boolean;
}

export function iOSPreview({
  backgroundUrl,
  notifications = [],
  isPlaying = false,
}: iOSPreviewProps) {
  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[9/19] rounded-3xl overflow-hidden shadow-2xl border-8 border-black dark:border-gray-900 bg-black">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />

      {/* Screen content */}
      <div className="relative w-full h-full bg-gradient-to-b from-gray-900 via-black to-gray-950 overflow-hidden">
        {/* Background */}
        {backgroundUrl && (
          <img
            src={backgroundUrl}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Notifications */}
        <div className="absolute inset-0 flex flex-col gap-3 pt-16 px-4 pointer-events-none">
          {notifications.map((notif, index) => (
            <NotificationCard
              key={index}
              notification={notif}
              index={index}
              isPlaying={isPlaying}
            />
          ))}
        </div>

        {/* Time display */}
        <div className="absolute top-2 left-0 right-0 flex justify-center z-40">
          <div className="text-white text-3xl font-light tracking-wider">
            {new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-30" />
    </div>
  );
}

interface NotificationCardProps {
  notification: NotificationLayerData;
  index: number;
  isPlaying: boolean;
}

function NotificationCard({
  notification,
  index,
  isPlaying,
}: NotificationCardProps) {
  const staggerDelay = index * 0.1;

  const variants = {
    hidden: {
      scale: notification.startScale,
      opacity: notification.startOpacity,
      y: notification.startTranslateY,
      filter: `blur(${notification.startBlur}px)`,
    },
    visible: {
      scale: notification.peakScale,
      opacity: notification.peakOpacity,
      y: notification.peakTranslateY,
      filter: `blur(${notification.peakBlur}px)`,
      transition: {
        duration: notification.duration / 1000,
        delay: staggerDelay,
      },
    },
    exit: {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate={isPlaying ? 'visible' : 'hidden'}
      exit="exit"
      variants={variants}
      className="w-full"
    >
      <div
        className="rounded-2xl p-4 backdrop-blur-lg border border-white/20 shadow-lg"
        style={{
          backgroundColor: `${notification.color}20`,
          borderColor: `${notification.color}40`,
        }}
      >
        <div className="flex gap-3">
          {/* Icon placeholder */}
          <div
            className="w-12 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: notification.color }}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {notification.title}
            </p>
            {notification.subtitle && (
              <p className="text-xs text-gray-300 truncate">
                {notification.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
