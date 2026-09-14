import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AboutService } from '../../../core/services/about.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Error } from '../../../shared/components/error/error';
import { AboutForm } from '../../../models/about.model';

import { LucideAngularModule } from 'lucide-angular';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, Error],
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
  imagePreviews = signal<(string | null)[]>([null, null, null, null]);
  originalAboutForm = signal<AboutForm | null>(null);

  aboutForm = signal<AboutForm>({
    description: '',
    email: '',
    location: '',
    imageFiles: [null, null, null, null],
    existingImages: [],
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
          const images = res.images || [];

          const formData = {
            description: res.description,
            email: res.email,
            location: res.location,
            imageFiles: [null, null, null, null],
            existingImages: images,
          };

          this.aboutForm.set(formData);
          this.originalAboutForm.set(formData);
          this.imagePreviews.set([
            images[0] || null,
            images[1] || null,
            images[2] || null,
            images[3] || null,
          ]);
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

    this.aboutForm.update((form) => {
      const imageFiles = [...form.imageFiles];
      imageFiles[index] = file;
      return { ...form, imageFiles };
    });

    this.imagePreviews.update((previews) => {
      const updated = [...previews];
      updated[index] = URL.createObjectURL(file);
      return updated;
    });
  }

  removeImage(index: number) {
    this.aboutForm.update((form) => {
      const imageFiles = [...form.imageFiles];
      imageFiles[index] = null;
      return { ...form, imageFiles };
    });

    this.imagePreviews.update((previews) => {
      const updated = [...previews];
      updated[index] = null;
      return updated;
    });
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

    form.imageFiles.forEach((file) => {
      if (file) {
        formData.append('images', file);
      }
    });

    this.saving.set(true);
    this.loaderService.showApi();

    const saveAboutSub = this.aboutService
      .saveAbout(formData)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.snackBarService.success(res.message);
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
