import { WatcherEye } from './WatcherEye'

export function Logo({ size = 32, animate = true, track = true }) {
  return <WatcherEye size={size} animate={animate} track={track} blink />
}