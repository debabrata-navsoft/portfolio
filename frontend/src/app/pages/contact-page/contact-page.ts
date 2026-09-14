import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { CustomButton } from '../../shared/components/custom-button/custom-button';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { ContactForm } from '../../models/contact.model';
import { ContactService } from '../../core/services/contact.service';
import { SnackBarService } from '../../core/services/snack-bar.service';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CustomButton, RevealDirective],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
  // animations: [fadeUpAnimation],
})
export class ContactPage {
  private contactService = inject(ContactService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  contactForm = signal<ContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  touched = signal<Record<keyof ContactForm, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    subject: false,
    message: false,
  });

  submitted = signal(false);
  isSending = signal(false);

  markTouched(field: keyof ContactForm) {
    this.touched.update((prev) => ({ ...prev, [field]: true }));
  }

  hasError(field: keyof ContactForm): boolean {
    return (this.submitted() || this.touched()[field]) && !this.contactForm()[field].trim();
  }

  update(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    this.contactForm.update((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  }

  isEmpty(data: ContactForm) {
    return Object.values(data).some((value) => value.trim() === '');
  }

  private scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submit(event: Event) {
    event.preventDefault();

    this.submitted.set(true);
    this.touched.set({
      firstName: true,
      lastName: true,
      email: true,
      subject: true,
      message: true,
    });

    const data = this.contactForm();

    if (this.isEmpty(data)) {
      this.snackBarService.error('Please fill all fields');
      this.scrollToTop();
      return;
    }

    this.isSending.set(true);

    const ContactSub = this.contactService.createContact(data).subscribe({
      next: (res) => {
        this.isSending.set(false);
        this.snackBarService.success(res.message);

        this.contactForm.set({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: '',
        });

        this.submitted.set(false);
        this.touched.set({
          firstName: false,
          lastName: false,
          email: false,
          subject: false,
          message: false,
        });
        this.scrollToTop();
      },

      error: (err) => {
        this.isSending.set(false);
        this.snackBarService.error(err.message || 'Something went wrong');
        this.scrollToTop();
      },
    });

    this.destroyRef.onDestroy(() => {
      ContactSub.unsubscribe();
    });
  }
}
