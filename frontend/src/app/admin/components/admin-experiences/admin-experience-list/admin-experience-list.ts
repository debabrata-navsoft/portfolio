import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ExperienceService } from '../../../../core/services/experience.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { ExperienceResponse } from '../../../../models/experience.model';
import { AdminExperienceForm } from '../admin-experience-form/admin-experience-form';
import { AdminCard, AdminCardList } from '../../admin-card-list/admin-card-list';
import { finalize } from 'rxjs';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-experience-list',
  standalone: true,
  imports: [AdminExperienceForm, AdminCardList],
  templateUrl: './admin-experience-list.html',
})
export class AdminExperienceList implements OnInit {
  private experienceService = inject(ExperienceService);
  private confirmDialog = inject(ConfirmDialogService);
  private destroyRef = inject(DestroyRef);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);

  experiences = signal<ExperienceResponse[]>([]);
  editingExperience = signal<ExperienceResponse | null>(null);
  showForm = signal(false);
  isErrorMsg = signal(false);

  cards = computed<AdminCard[]>(() =>
    this.experiences().map((experience) => ({
      id: experience._id!,
      title: experience.company,
      subtitle: experience.role,
      meta: experience.years,
    })),
  );

  byId(id: string): ExperienceResponse | undefined {
    return this.experiences().find((experience) => experience._id === id);
  }

  ngOnInit(): void {
    this.loaderService.showApi();
    const experienceSub = this.experienceService
      .getExperiences()
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.experiences.set(res);
        },

        error: (err) => {
          this.isErrorMsg.set(true);
          console.log(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      experienceSub.unsubscribe();
    });
  }

  async deleteExperience(id: string) {
    if (
      !(await this.confirmDialog.confirm({
        title: 'Delete experience?',
        message: 'This work experience will be removed from your profile.',
      }))
    )
      return;

    this.loaderService.showApi();

    const exSub = this.experienceService
      .deleteExperience(id)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.experiences.update((experiences) =>
            experiences.filter((experience) => experience._id !== id),
          );
          this.snackBarService.success(res.message);
        },
        error: (err) => {
          this.snackBarService.error(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      exSub.unsubscribe();
    });
  }

  openForm(experience?: ExperienceResponse) {
    this.editingExperience.set(experience || null);
    this.showForm.set(true);
  }

  closeForm(savedExperience?: ExperienceResponse) {
    this.showForm.set(false);

    if (!savedExperience) {
      this.editingExperience.set(null);
      return;
    }

    if (this.editingExperience()) {
      this.experiences.update((items) =>
        items.map((item) => (item._id === savedExperience._id ? savedExperience : item)),
      );
    } else {
      this.experiences.update((items) => [savedExperience, ...items]);
    }

    this.editingExperience.set(null);
  }
}
