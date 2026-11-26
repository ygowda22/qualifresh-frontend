// Minimal typing for the part of "qrcode" the invoice uses (the package ships no types).
declare module "qrcode" {
  export function create(text: string, options?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H" }): {
    modules: { size: number; data: Uint8Array | boolean[]; get(row: number, col: number): number | boolean };
  };
}
