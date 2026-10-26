/* Phosphor regular icon geometry, MIT licensed: phosphor-icons/core. */
import type { SVGProps } from 'react';
type Props = SVGProps<SVGSVGElement> & { size?: number };
function Icon({ size = 16, children, ...props }: Props) { return <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>; }
export function ArrowUpRight(props: Props) { return <Icon {...props}><path d="M64 192 192 64M64 64h128v128" /></Icon>; }
export function Download(props: Props) { return <Icon {...props}><path d="M128 24v144m-56-56 56 56 56-56M40 168v40a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8v-40" /></Icon>; }
export function Mail(props: Props) { return <Icon {...props}><rect x="32" y="56" width="192" height="144" rx="8" /><path d="m32 64 96 72 96-72" /></Icon>; }
export function MapPin(props: Props) { return <Icon {...props}><path d="M208 104c0 64-80 120-80 120S48 168 48 104a80 80 0 0 1 160 0Z" /><circle cx="128" cy="104" r="24" /></Icon>; }
