declare module "zzfx" {
  export function zzfx(...params: number[]): AudioBufferSourceNode;
  export const ZZFX: { volume: number; play: (...params: number[]) => AudioBufferSourceNode };
}
