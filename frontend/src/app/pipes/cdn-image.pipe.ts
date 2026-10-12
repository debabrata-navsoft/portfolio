import { Pipe, PipeTransform } from '@angular/core';

const SRCSET_WIDTHS = [480, 800, 1200, 1600];

/**
 * Asks Cloudinary for a resized, modern-format copy (`f_auto` → WebP/AVIF, `q_auto`) instead of
 * the original upload. Non-Cloudinary URLs pass through untouched.
 */
export const cdnImage = (url: string | null | undefined, width = 1200): string =>
  url ? url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`) : '';

@Pipe({
  name: 'cdnImage',
})
export class CdnImagePipe implements PipeTransform {
  transform(url: string | null | undefined, width = 1200): string {
    return cdnImage(url, width);
  }
}

/** `srcset` of resized copies, so a phone downloads a phone-sized image. Pair it with `sizes`. */
@Pipe({
  name: 'cdnSrcset',
})
export class CdnSrcsetPipe implements PipeTransform {
  transform(url: string | null | undefined): string | null {
    if (!url?.includes('/image/upload/')) return null;
    return SRCSET_WIDTHS.map((w) => `${cdnImage(url, w)} ${w}w`).join(', ');
  }
}
