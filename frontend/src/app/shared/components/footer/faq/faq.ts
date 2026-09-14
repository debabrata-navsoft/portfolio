import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { FaqService } from '../../../../core/services/faq.service';
import { FAQResponse } from '../../../../models/faq.model';
import { RevealDirective } from '../../../directives/reveal.directive';
import { faqAnimation } from '../../../animation/page.animations';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucideAngularModule, RevealDirective],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
  animations: [faqAnimation],
})
export class FAQ implements OnInit {
  private faqService = inject(FaqService);
  private destroyRef = inject(DestroyRef);

  faqs = signal<FAQResponse[]>([]);
  activeId = signal<string | null>(null);
  isErrorMsg = signal(false);

  ngOnInit(): void {
    const faqSub = this.faqService.getFAQs().subscribe({
      next: (res) => {
        this.faqs.set(res);
      },
      error: (err) => {
        this.isErrorMsg.set(true);

        console.log(err.message);
      },
    });

    this.destroyRef.onDestroy(() => {
      faqSub.unsubscribe();
    });
  }

  toggleFAQ(id: string) {
    this.activeId.update((prev) => (prev === id ? null : id));
  }
}
