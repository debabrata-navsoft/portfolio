import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AboutService } from '../../../core/services/about.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Error } from '../../../shared/components/error/error';
import { MarkdownToolbar } from '../../../shared/components/markdown-toolbar/markdown-toolbar';
import { MarkdownPreview } from '../../../shared/components/markdown-preview/markdown-preview';
import { AboutForm } from '../../../models/about.model';

import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';

const IMAGE_SLOTS = 4;

/** The gallery is always `IMAGE_SLOTS` slots wide, padded with nulls. */
const imageSlots = (images: readonly string[] = []): (string | null)[] =>
  Array.from({ length: IMAGE_SLOTS }, (_, i) => images[i] || null);

const emptySlots = <T>(): (T | null)[] => Array.from({ length: IMAGE_SLOTS }, () => null);

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, Error, MarkdownToolbar, MarkdownPreview],
  templateUrl: './admin-about.html',
  styleUrl: './admin-about.css',
})
export class AdminAbout implements OnInit {
  private aboutService = inject(AboutService);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  isErrorMsg = signal(false);
  saving = signal(false);
  imagePreviews = signal<(string | null)[]>(imageSlots());
  originalAboutForm = signal<AboutForm | null>(null);

  aboutForm = signal<AboutForm>({
    description: '',
    email: '',
    location: '',
    imageFiles: emptySlots<File>(),
    existingImages: imageSlots(),
  });

  touched = signal<{
    description: boolean;
    email: boolean;
    location: boolean;
  }>({
    description: false,
    email: false,
    location: false,
  });

  isAboutChanged = computed(() => {
    return JSON.stringify(this.aboutForm()) !== JSON.stringify(this.originalAboutForm());
  });

  ngOnInit() {
    this.loaderService.showApi();
    const aboutSub = this.aboutService
      .getAbout()
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.aboutForm.update((form) => ({
            ...form,
            description: res.description,
            email: res.email,
            location: res.location,
          }));

          this.setSavedImages(res.images);
          this.originalAboutForm.set(this.aboutForm());
        },
        error: () => {
          this.isErrorMsg.set(true);
        },
      });

    this.destroyRef.onDestroy(() => {
      aboutSub.unsubscribe();
    });
  }

  markTouched(field: 'description' | 'email' | 'location') {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: 'description' | 'email' | 'location'): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    const form = this.aboutForm();
    if (field === 'description') return !form.description?.trim();
    if (field === 'email') return !form.email?.trim();
    if (field === 'location') return !form.location?.trim();
    return false;
  }

  updateField(field: 'description' | 'email' | 'location', value: string) {
    this.aboutForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  onImageSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.setSlot(index, file, URL.createObjectURL(file));
  }

  removeImage(index: number) {
    this.setSlot(index, null, null);
  }

  /** Adopt the gallery the API just returned, so the next save keeps these images too. */
  private setSavedImages(images?: string[]) {
    const slots = imageSlots(images);

    this.aboutForm.update((form) => ({
      ...form,
      imageFiles: emptySlots<File>(),
      existingImages: slots,
    }));
    this.imagePreviews.set([...slots]);
  }

  /** A picked or removed file always drops the URL saved in that slot. */
  private setSlot(index: number, file: File | null, preview: string | null) {
    this.aboutForm.update((form) => ({
      ...form,
      imageFiles: form.imageFiles.map((current, i) => (i === index ? file : current)),
      existingImages: form.existingImages.map((url, i) => (i === index ? null : url)),
    }));
    this.imagePreviews.update((previews) => previews.map((p, i) => (i === index ? preview : p)));
  }

  saveAbout() {
    this.touched.set({
      description: true,
      email: true,
      location: true,
    });

    const form = this.aboutForm();

    if (!form.description || !form.email || !form.location) {
      this.snackBarService.error('All fields are required');
      return;
    }

    const formData = new FormData();

    formData.append('description', form.description);
    formData.append('email', form.email);
    formData.append('location', form.location);

    // Images the admin didn't touch, plus the slot each upload belongs to, so the
    // API can rebuild the gallery instead of replacing it with this request's files.
    const uploadSlots: number[] = [];

    form.imageFiles.forEach((file, index) => {
      if (file) {
        formData.append('images', file);
        uploadSlots.push(index);
      }
    });

    formData.append('existingImages', JSON.stringify(form.existingImages));
    formData.append('imageSlots', JSON.stringify(uploadSlots));

    this.saving.set(true);
    this.loaderService.showApi();

    const saveAboutSub = this.aboutService
      .saveAbout(formData)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.snackBarService.success(res.message);
          this.setSavedImages(res.about?.images);
          this.originalAboutForm.set(this.aboutForm());
          this.saving.set(false);
        },
        error: (err) => {
          this.snackBarService.error(err.message);
          this.saving.set(false);
        },
      });

    this.destroyRef.onDestroy(() => {
      saveAboutSub.unsubscribe();
    });
  }

  // saveAbout() {
  //   if (!this.description() || !this.email() || !this.location()) {
  //     this.snacBarService.error('All fields are required');
  //     return;
  //   }

  //   this.saving.set(true);

  //   this.aboutService
  //     .saveAbout({
  //       description: this.description(),
  //       email: this.email(),
  //       location: this.location(),
  //     })
  //     .subscribe({
  //       next: () => {
  //         this.snacBarService.success('About saved successfully!');
  //         this.saving.set(false);
  //       },
  //       error: () => {
  //         this.snacBarService.error('About save failed!');
  //         this.saving.set(false);
  //       },
  //     });
  // }
}
