import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FOOTER_MENU, SOCIAL_LINKS } from '../../../../portfolio-data';
import { Router, RouterLink } from '@angular/router';
import { GradientText } from '../../gradient-text/gradient-text';
import { LucideAngularModule } from 'lucide-angular';
import { FooterMenu } from '../../../../models/footer.model';
import { isPlatformBrowser } from '@angular/common';
import { RevealDirective } from '../../../directives/reveal.directive';

@Component({
  selector: 'app-contact-footer',
  standalone: true,
  imports: [RouterLink, GradientText, LucideAngularModule, RevealDirective],
  templateUrl: './contact-footer.html',
  styleUrl: './contact-footer.css',
})
export class ContactFooter {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  currentYear = new Date().getFullYear();

  footerMenu = FOOTER_MENU;
  socialLinks = SOCIAL_LINKS;

  email = 'debabratadas711@gmail.com';
  phone = '+91 9734990919';
  location = 'West Bengal, India';

  handleNavigation(item: FooterMenu) {
    const [path, fragment] = item.link.split('#');

    const targetPath = path || '/';

    if (!fragment) {
      this.router.navigateByUrl(item.link);
      return;
    }

    const currentPath = this.router.url.split('#')[0];

    if (currentPath === targetPath) {
      this.scrollToFragment(fragment);
      return;
    }

    this.router.navigateByUrl(targetPath).then(() => {
      this.scrollToFragment(fragment);
    });
  }

  private scrollToFragment(fragment: string, attempt = 0) {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = document.getElementById(fragment);

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    if (attempt < 20) {
      setTimeout(() => {
        this.scrollToFragment(fragment, attempt + 1);
      }, 50);
    }
  }
}
