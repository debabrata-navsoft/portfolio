import {
  Component,
  computed,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { SkillFormData, SkillResponse } from '../../../../models/skills.model';
import { SkillsService } from '../../../../core/services/skills.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';

@Component({
  selector: 'app-admin-skill-form',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './admin-skill-form.html',
  styleUrl: './admin-skill-form.css',
})
export class AdminSkillForm implements OnInit {
  // @Output() closeForm = new EventEmitter<SkillResponse>();  // old way
  skill = input<SkillResponse | null>(null);
  closeForm = output<SkillResponse>();

  private skillsService = inject(SkillsService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  readonly categories: string[] = ['Frontend', 'Backend', 'Language', 'Tools'];

  selectedImage = signal<File | null>(null);
  imagePreview = signal<string>('');
  loading = signal(false);

  skillForm = signal<SkillFormData>({
    name: '',
    websiteUrl: '',
    category: '',
    percentage: 0,
  });

  touched = signal<{
    name: boolean;
    websiteUrl: boolean;
    category: boolean;
    percentage: boolean;
    image: boolean;
  }>({
    name: false,
    websiteUrl: false,
    category: false,
    percentage: false,
    image: false,
  });

  categoryOptions = computed(() => {
    const current = this.skillForm().category?.trim();
    if (current && !this.categories.some((c) => c.toLowerCase() === current.toLowerCase())) {
      return [...this.categories, current];
    }
    return this.categories;
  });

  get isEditMode(): boolean {
    return !!this.skill()?._id;
  }

  ngOnInit(): void {
    const existing = this.skill();

    if (existing) {
      const rawCategory = existing.category?.trim() ?? '';
      const matched = this.categories.find((c) => c.toLowerCase() === rawCategory.toLowerCase());

      this.skillForm.set({
        name: existing.name ?? '',
        websiteUrl: existing.websiteUrl ?? '',
        category: matched ?? rawCategory,
        percentage: existing.percentage ?? 0,
      });

      if (existing.imageUrl) {
        this.imagePreview.set(existing.imageUrl);
      }
    }
  }

  markTouched(field: 'name' | 'websiteUrl' | 'category' | 'percentage' | 'image') {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: 'name' | 'websiteUrl' | 'category' | 'percentage' | 'image'): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    const form = this.skillForm();
    if (field === 'name') return !form.name?.trim();
    if (field === 'websiteUrl') return !form.websiteUrl?.trim();
    if (field === 'category') return !form.category?.trim();
    if (field === 'percentage')
      return (
        form.percentage === null ||
        form.percentage === undefined ||
        form.percentage <= 0 ||
        isNaN(form.percentage)
      );
    if (field === 'image') return !this.isEditMode && !this.selectedImage() && !this.imagePreview();
    return false;
  }

  updateField(field: keyof SkillFormData, value: string) {
    this.skillForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  updatePercentage(value: string) {
    const parsed = Number(value);
    const percentage = Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, Math.round(parsed)));

    this.skillForm.update((form) => ({
      ...form,
      percentage,
    }));
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedImage.set(file);

    this.imagePreview.set(URL.createObjectURL(file));
  }

  submitSkill() {
    this.touched.set({
      name: true,
      websiteUrl: true,
      category: true,
      percentage: true,
      image: true,
    });

    const form = this.skillForm();

    const isNameEmpty = !form.name?.trim();
    const isWebsiteUrlEmpty = !form.websiteUrl?.trim();
    const isCategoryEmpty = !form.category?.trim();
    const isImageEmpty = !this.selectedImage() && !this.isEditMode;

    if (isNameEmpty && isWebsiteUrlEmpty && isCategoryEmpty && isImageEmpty) {
      this.snackBarService.error('All fields are required');
      return;
    }

    if (isNameEmpty) {
      this.snackBarService.error('Skill name is required');
      return;
    }

    if (isWebsiteUrlEmpty) {
      this.snackBarService.error('Website URL is required');
      return;
    }

    if (isCategoryEmpty) {
      this.snackBarService.error('Category is required');
      return;
    }

    if (isImageEmpty) {
      this.snackBarService.error('Skill image is required');
      return;
    }

    if (!form.percentage) {
      this.snackBarService.error('Skill percentage is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('websiteUrl', form.websiteUrl);
    formData.append('category', form.category);
    formData.append('percentage', String(form.percentage));
    if (this.selectedImage()) {
      formData.append('image', this.selectedImage()!);
    }

    this.loading.set(true);

    const request$ = this.isEditMode
      ? this.skillsService.updateSkill(this.skill()!._id!, formData)
      : this.skillsService.createSkill(formData);

    const skillSub = request$.subscribe({
      next: (res) => {
        this.snackBarService.success(res.message);
        this.loading.set(false);
        this.closeForm.emit(res.skill);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Skill create failed');

        this.loading.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      skillSub.unsubscribe();
    });
  }
}
