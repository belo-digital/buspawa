import React from 'react';
import { cn } from '../lib/utils';
const LOADER_URL = "/loader.svg";
export function BrandLoader({
  label = 'Loading',
  className,
  imageClassName




}: {label?: string;className?: string;imageClassName?: string;}) {
  return <span className={cn('inline-flex items-center justify-center', className)} role="status">
      <img src={LOADER_URL} alt="" aria-hidden="true" className={cn('h-5 w-5 animate-spin', imageClassName)} />
      <span className="sr-only">{label}</span>
    </span>;
}