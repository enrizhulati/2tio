'use client';

import { Droplet, Zap, Wifi } from 'lucide-react';
import type { ServiceType } from '@/types/flow';

interface ServiceIconProps {
  type: ServiceType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
};

const colorMap = {
  water: 'text-[var(--color-water)]',
  electricity: 'text-[var(--color-electricity)]',
  internet: 'text-[var(--color-internet)]',
};

const iconMap = {
  water: Droplet,
  electricity: Zap,
  internet: Wifi,
};

export function ServiceIcon({ type, size = 'lg', className = '' }: ServiceIconProps) {
  const Icon = iconMap[type];
  const sizeClass = sizeMap[size];
  const colorClass = colorMap[type];

  return (
    <Icon className={`${sizeClass} ${colorClass} ${className}`} strokeWidth={2} />
  );
}

export { iconMap, colorMap };
