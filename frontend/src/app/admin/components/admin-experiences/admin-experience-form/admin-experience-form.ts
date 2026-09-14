import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { ExperienceService } from '../../../../core/services/experience.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { ExperienceForm, ExperienceResponse } from '../../../../models/experience.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-experience-form',
  standalone: true,
  imports: [],
  templateUrl: './admin-experience-form.html',
  styleUrl: './admin-experience-form.css',
})
export class AdminExperienceForm {
  editData = input<ExperienceResponse | null>(null);
  closeForm = output<ExperienceResponse>();

  private experienceService = inject(ExperienceService);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);

  experienceForm = signal<ExperienceForm>({
    company: '',
    role: '',
    years: '',
  });

  touched = signal<Record<keyof ExperienceForm, boolean>>({
    company: false,
    role: false,
    years: false,
  });

  constructor() {
    effect(() => {
      const exp = this.editData();

      if (exp) {
        this.experienceForm.set({
          company: exp.company,
          role: exp.role,
          years: exp.years,
        });
      } else {
        this.experienceForm.set({
          company: '',
          role: '',
          years: '',
        });
      }
      this.touched.set({
        company: false,
        role: false,
        years: false,
      });
    });
  }

  markTouched(field: keyof ExperienceForm) {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(field: keyof ExperienceForm): boolean {
    return this.touched()[field] && !this.experienceForm()[field]?.trim();
  }

  updateField(field: keyof ExperienceForm, value: string) {
    this.experienceForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  submitExperience() {
    this.touched.set({
      company: true,
      role: true,
      years: true,
    });

    const form = this.experienceForm();

    const isCompanyEmpty = !form.company.trim();
    const isRoleEmpty = !form.role.trim();
    const isYearsEmpty = !form.years.trim();

    if (isCompanyEmpty && isRoleEmpty && isYearsEmpty) {
      this.snackBarService.error('All fields are required');
      return;
    }

    if (isCompanyEmpty) {
      this.snackBarService.error('Company name is required');
      return;
    }

    if (isRoleEmpty) {
      this.snackBarService.error('Role is required');
      return;
    }

    if (isYearsEmpty) {
      this.snackBarService.error('Years is required');
      return;
    }

    this.loading.set(true);
    this.loaderService.showApi();

    const editExperience = this.editData();

    const experienceUpdate = editExperience?._id
      ? this.experienceService.updateExperience(editExperience._id, form)
      : this.experienceService.createExperience(form);

    const experienceSub = experienceUpdate
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.snackBarService.success(res.message);
          this.loading.set(false);
          this.closeForm.emit(res.experience);
        },
        error: (err) => {
          this.snackBarService.error(err.error?.message || 'Experience save failed');
          this.loading.set(false);
        },
      });

    this.destroyRef.onDestroy(() => {
      experienceSub.unsubscribe();
    });
  }
}
