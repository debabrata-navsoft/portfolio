import { Component } from '@angular/core';

import { GradientText } from '../gradient-text/gradient-text';
import { FAQ } from './faq/faq';
import { ContactFooter } from './contact-footer/contact-footer';

/** Shell only — the links and social icons live in `contact-footer`. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [GradientText, FAQ, ContactFooter],
  templateUrl: './footer.html',
})
export class Footer {}
