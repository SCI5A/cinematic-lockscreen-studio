/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Animation types and constants
export type AnimationProperty = 'scale' | 'opacity' | 'translateY' | 'blur' | 'rotateZ' | 'skewX';
export type EasingType = 'easeInOut' | 'easeOut' | 'easeIn' | 'easeOutBack' | 'spring' | 'linear';

export interface AnimationKeyframe {
  frame: number;
  property: AnimationProperty;
  value: number | string;
  easing: EasingType;
}

export interface NotificationLayerData {
  title: string;
  subtitle?: string;
  icon?: string;
  color: string;
  soundUrl?: string;
  soundKey?: string;
  startScale: number;
  startBlur: number;
  startOpacity: number;
  startTranslateY: number;
  peakScale: number;
  peakBlur: number;
  peakOpacity: number;
  peakTranslateY: number;
  duration: number;
}

export interface TextLayerData {
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'light';
  color: string;
  x: number;
  y: number;
  maxWidth: number;
  textAlign: 'left' | 'center' | 'right';
}

export interface WidgetLayerData {
  widgetType: 'time' | 'date' | 'datetime' | 'weather';
  timeFormat?: '24h' | '12h';
  dateFormat?: string;
  showSeconds?: boolean;
  color: string;
  fontSize: number;
  x: number;
  y: number;
}

export interface ProjectConfig {
  duration: number;
  fps: number;
  width: number;
  height: number;
  backgroundColor: string;
}

export const IOS_NOTIFICATION_PHYSICS = {
  START: { scale: 0.88, blur: 12, opacity: 0, translateY: -120 },
  PEAK: { scale: 1.06, blur: 1, opacity: 0.9, translateY: -35 },
  END: { scale: 1, blur: 0, opacity: 1, translateY: 0 },
};

export const EASING_FUNCTIONS = {
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  linear: 'linear',
};
