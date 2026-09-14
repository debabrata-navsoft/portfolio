import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../../../core/services/faq.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { FAQForm } from '../../../../models/faq.model';
import { EMPTY, switchMap } from 'rxjs';

import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-faq-form',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './admin-faq-form.html',
  styleUrl: './admin-faq-form.css',
})
export class AdminFaqForm {
  private faqService = inject(FaqService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  editingId = signal<string | null>(null);

  touched = signal<{
    question: boolean;
    answer: boolean;
  }>({
    question: false,
    answer: false,
  });

  faqs = signal<FAQForm>({
    question: '',
    answer: '',
    isActive: true,
    order: 0,
  });

  ngOnInit(): void {
    const faqSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) return EMPTY;

          return this.faqService.getFAQById(id);
        }),
      )
      .subscribe({
        next: (faq) => {
          this.editingId.set(faq._id);
          this.faqs.set({
            question: faq.question,
            answer: faq.answer,
            isActive: faq.isActive,
            order: faq.order,
          });
        },
        error: (err) => {
          this.snackBarService.error(err.error?.message || 'FAQ not found');
          this.router.navigate(['/admin/faqs']);
        },
      });

    this.destroyRef.onDestroy(() => {
      faqSub.unsubscribe();
    });
  }

  markTouched(field: 'question' | 'answer') {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: 'question' | 'answer'): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    const form = this.faqs();
    if (field === 'question') return !form.question?.trim();
    if (field === 'answer') return !form.answer?.trim();
    return false;
  }

  updateField<K extends keyof FAQForm>(field: K, value: FAQForm[K]) {
    this.faqs.update((faq) => ({
      ...faq,
      [field]: value,
    }));
  }

  submitFAQ() {
    this.touched.set({
      question: true,
      answer: true,
    });

    const form = this.faqs();
    const id = this.editingId();

    if (!form.question || !form.answer) {
      this.snackBarService.error('Question and Answer are required');
      return;
    }

    const payload = {
      question: form.question,
      answer: form.answer,
      isActive: form.isActive,
      order: form.order,
    };

    this.loading.set(true);

    const faqUpdate = id
      ? this.faqService.updateFAQ(id, payload)
      : this.faqService.createFAQ(payload);

    const Sub = faqUpdate.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBarService.success(res.message);
        this.router.navigate(['/admin/faqs']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBarService.error(err.error?.message || 'Something went wrong');
      },
    });

    this.destroyRef.onDestroy(() => {
      Sub.unsubscribe();
    });
  }

  onCancel() {
    this.router.navigate(['/admin/faqs']);
  }
}
