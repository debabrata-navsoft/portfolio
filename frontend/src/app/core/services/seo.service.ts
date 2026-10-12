import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_NAME = 'Debabrata Das';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  // The site-wide defaults from index.html, restored when a page that overrides them is left.
  private defaultTitle = this.title.getTitle();
  private defaultDescription = this.meta.getTag('name="description"')?.content ?? '';

  // Runs during SSR too, so crawlers get the page's own title and description.
  set(title: string, description = '') {
    this.title.setTitle(`${title} | ${SITE_NAME}`);

    const text = description.replace(/[*`#>_]/g, '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (text) this.meta.updateTag({ name: 'description', content: text });
  }

  reset() {
    this.title.setTitle(this.defaultTitle);
    this.meta.updateTag({ name: 'description', content: this.defaultDescription });
  }
}
