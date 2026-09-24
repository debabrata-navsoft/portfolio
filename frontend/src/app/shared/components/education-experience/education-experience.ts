import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ExperienceService } from '../../../core/services/experience.service';
import { EducationService } from '../../../core/services/education.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ExperienceResponse } from '../../../models/experience.model';
import { EducationResponse } from '../../../models/education.model';
import { GradientText } from '../gradient-text/gradient-text';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-education-experience',
  standalone: true,
  imports: [LucideAngularModule, GradientText, RevealDirective],
  templateUrl: './education-experience.html',
})
export class EducationExperience {
  private experienceService = inject(ExperienceService);
  private educationService = inject(EducationService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  experiences = signal<ExperienceResponse[]>([]);
  educations = signal<EducationResponse[]>([]);

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const experienceSub = this.experienceService.getExperiences().subscribe({
      next: (res) => {
        this.experiences.set(res);
        this.loaderService.completeRequest();
      },
      error: (err) => {
        this.loaderService.reportContentError();
        console.log(err.message);
        this.loaderService.completeRequest();
      },
    });

    this.loaderService.trackRequest();
    const educationSub = this.educationService.getEducation().subscribe({
      next: (res) => {
        this.educations.set(res);
        this.loaderService.completeRequest();
      },
      error: (err) => {
        this.loaderService.reportContentError();
        console.log(err.message);
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      experienceSub.unsubscribe();
      educationSub.unsubscribe();
    });
  }
}
