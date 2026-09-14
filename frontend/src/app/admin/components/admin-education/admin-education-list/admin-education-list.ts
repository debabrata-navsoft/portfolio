import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { EducationService } from '../../../../core/services/education.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { EducationResponse } from '../../../../models/education.model';
import { AdminEducationForm } from '../admin-education-form/admin-education-form';
import { AdminCard, AdminCardList } from '../../admin-card-list/admin-card-list';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-education-list',
  standalone: true,
  imports: [AdminEducationForm, AdminCardList],
  templateUrl: './admin-education-list.html',
})
export class AdminEducationList implements OnInit {
  private educationService = inject(EducationService);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  educations = signal<EducationResponse[]>([]);
  editingEducation = signal<EducationResponse | null>(null);
  showForm = signal(false);
  isErrorMsg = signal(false);

  cards = computed<AdminCard[]>(() =>
    this.educations().map((education) => ({
      id: education._id!,
      title: education.school,
      subtitle: education.degree,
      meta: education.years,
    })),
  );

  byId(id: string): EducationResponse | undefined {
    return this.educations().find((education) => education._id === id);
  }

  ngOnInit(): void {
    this.loaderService.showApi();
    const educationSub = this.educationService
      .getEducation()
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.educations.set(res);
        },

        error: (err) => {
          this.isErrorMsg.set(true);
          console.log(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      educationSub.unsubscribe();
    });
  }

  deleteEducation(id: string) {
    const confirmed = confirm('Are you sure delete this Education');

    if (!confirmed) {
      return;
    }

    this.loaderService.showApi();

    const eduSub = this.educationService
      .deleteEducation(id)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.educations.update((educations) =>
            educations.filter((education) => education._id !== id),
          );
          this.snackBarService.success(res.message);
        },

        error: (err) => {
          this.snackBarService.error(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      eduSub.unsubscribe();
    });
  }

  openForm(education?: EducationResponse) {
    this.editingEducation.set(education || null);
    this.showForm.set(true);
  }

  closeForm(saveEducation?: EducationResponse) {
    this.showForm.set(false);

    if (!saveEducation) {
      this.editingEducation.set(null);
      return;
    }

    if (this.editingEducation()) {
      this.educations.update((items) =>
        items.map((item) => (item._id === saveEducation._id ? saveEducation : item)),
      );
    } else {
      this.educations.update((items) => [saveEducation, ...items]);
    }

    this.editingEducation.set(null);
  }
}
