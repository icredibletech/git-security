declare module 'zstd-codec' {
  export function compress(data: Buffer, level?: number): Buffer;
  export function decompress(data: Buffer): Buffer;
}
