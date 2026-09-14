import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ProfileService } from '../../../core/services/profile.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Error } from '../../../shared/components/error/error';
import { ProfileForm } from '../../../models/profile.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [Error],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfile {
  private profileService = inject(ProfileService);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  savingContent = signal(false);
  previewUrl = signal<string | null>(null);
  originalProfileForm = signal<ProfileForm | null>(null);
  currentImageUrl = signal<string | null>(null);

  resumeUrl = signal('');
  savedResumeUrl = signal('');
  isErrorMsg = signal(false);
  saving = signal(false);
  message = signal('');

  profileForm = signal<ProfileForm>({
    heroGradientText: '',
    heroHeading: '',
    introduction: '',
    profileDescription: '',
  });

  touched = signal<{
    resumeUrl: boolean;
    heroGradientText: boolean;
    heroHeading: boolean;
    introduction: boolean;
    profileDescription: boolean;
  }>({
    resumeUrl: false,
    heroGradientText: false,
    heroHeading: false,
    introduction: false,
    profileDescription: false,
  });

  isProfileChanged = computed(() => {
    const original = this.originalProfileForm();
    const current = this.profileForm();

    if (!original) return false;

    return JSON.stringify(original) !== JSON.stringify(current);
  });

  markTouched(
    field: 'resumeUrl' | 'heroGradientText' | 'heroHeading' | 'introduction' | 'profileDescription',
  ) {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(
    field: 'resumeUrl' | 'heroGradientText' | 'heroHeading' | 'introduction' | 'profileDescription',
  ): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    if (field === 'resumeUrl') return !this.resumeUrl().trim();
    if (field === 'profileDescription') return !this.profileForm().profileDescription.trim();
    if (field === 'heroGradientText') return !this.profileForm().heroGradientText.trim();
    if (field === 'heroHeading') return !this.profileForm().heroHeading.trim();
    if (field === 'introduction') return !this.profileForm().introduction.trim();
    return false;
  }

  resumePreviewUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.resumeUrl().trim() || this.savedResumeUrl().trim();
    if (!url) return null;

    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = match?.[1];

    if (!fileId) return null;

    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
  });

  hasInvalidResumeLink = computed(() => {
    const url = this.resumeUrl().trim() || this.savedResumeUrl().trim();
    return !!url && !this.resumePreviewUrl();
  });

  ngOnInit() {
    this.loaderService.showApi();
    const profileSub = this.profileService
      .getProfile()
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          const formData = {
            heroGradientText: res.heroGradientText,
            heroHeading: res.heroHeading,
            introduction: res.introduction,
            profileDescription: res.profileDescription,
          };

          this.profileForm.set(formData);
          this.originalProfileForm.set(formData);
          this.currentImageUrl.set(res.imageUrl || null);
        },

        error: () => {
          this.isErrorMsg.set(true);
        },
      });

    const resumeSub = this.profileService.getResumeUrl().subscribe({
      next: (res) => {
        this.savedResumeUrl.set(res.resumeUrl || '');
      },
      error: () => {
        console.log('No resume found');
      },
    });

    this.destroyRef.onDestroy(() => {
      profileSub.unsubscribe();
      resumeSub.unsubscribe();
    });
  }

  updateField(field: keyof ProfileForm, value: string) {
    this.profileForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!this.allowedTypes.includes(file.type)) {
      this.snackBarService.error('Only JPG, PNG or WEBP images are allowed');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };

    reader.readAsDataURL(file);
  }

  uploadProfileImage() {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.loaderService.showApi();

    const profileImgSub = this.profileService
      .uploadProfileImage(file)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.snackBarService.success('Profile image uploaded successfully!');
          this.uploading.set(false);
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.currentImageUrl.set(res.imageUrl);

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        },
        error: () => {
          this.snackBarService.error('Upload failed!');
          this.uploading.set(false);
        },
      });

    this.destroyRef.onDestroy(() => {
      profileImgSub.unsubscribe();
    });
  }

  saveResume() {
    this.touched.update((t) => ({ ...t, resumeUrl: true }));

    if (!this.resumeUrl().trim()) {
      this.snackBarService.error('Please paste Google Drive resume link');
      return;
    }

    this.saving.set(true);
    this.loaderService.showApi();

    const profileResumeSub = this.profileService
      .saveResumeUrl(this.resumeUrl())
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: () => {
          this.snackBarService.success('Resume link saved successfully!');
          this.saving.set(false);
          this.savedResumeUrl.set(this.resumeUrl());
          this.resumeUrl.set('');
        },
        error: () => {
          this.snackBarService.error('Resume link save failed!');
          this.saving.set(false);
        },
      });

    this.destroyRef.onDestroy(() => {
      profileResumeSub.unsubscribe();
    });
  }

  saveProfileContent() {
    this.touched.update((t) => ({
      ...t,
      profileDescription: true,
    }));

    const form = this.profileForm();

    if (!form.profileDescription.trim()) {
      this.snackBarService.error('Description is required!');
      return;
    }

    this.savingContent.set(true);
    this.loaderService.showApi();

    const profileContentSub = this.profileService
      .updateProfileContent(form)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: () => {
          this.snackBarService.success('Profile content updated successfully!');
          this.savingContent.set(false);
          this.originalProfileForm.set(this.profileForm());
        },
        error: () => {
          this.snackBarService.error('Profile content update failed!');
          this.savingContent.set(false);
        },
      });

    this.destroyRef.onDestroy(() => {
      profileContentSub.unsubscribe();
    });
  }
}
