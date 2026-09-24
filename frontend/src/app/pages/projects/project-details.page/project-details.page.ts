import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ProjectService } from '../../../core/services/project.service';
import { ProjectResponse } from '../../../models/project.model';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { LoaderService } from '../../../core/services/loader.service';
import { Error } from '../../../shared/components/error/error';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { fadeUpAnimation } from '../../../shared/animation/page.animations';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { FormatTextPipe } from '../../../pipes/format-text.pipe';
import { ImageModal } from '../../../shared/components/image-modal/image-modal';

@Component({
  selector: 'app-project-details.page',
  standalone: true,
  imports: [
    CommonModule,
    UpperCasePipe,
    LucideAngularModule,
    Error,
    GradientText,
    RevealDirective,
    TimeAgoPipe,
    DatePipe,
    FormatTextPipe,
    ImageModal,
  ],
  templateUrl: './project-details.page.html',
  animations: [fadeUpAnimation],
})
export class ProjectDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  project = signal<ProjectResponse | null>(null);
  projects = signal<ProjectResponse[]>([]);
  isErrorMsg = signal(false);
  isImageModalOpen = signal(false);

  nextProject = computed(() => {
    const currentProject = this.project();
    const allProjects = this.projects();

    if (!currentProject || allProjects.length === 0) return null;

    const currentIndex = allProjects.findIndex((p) => p._id === currentProject._id);

    if (currentIndex === -1) return null;

    return allProjects[(currentIndex + 1) % allProjects.length];
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const projectSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const projectSlug = params.get('slug');
          if (!projectSlug) return EMPTY;

          this.loaderService.showApi();
          this.project.set(null);

          return this.projectService.getProjectBySlug(projectSlug, true);
        }),
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.project.set(res);
            this.loaderService.hideApi();
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isErrorMsg.set(true);
            this.loaderService.hideApi();
            this.snackBarService.error(err.error?.message || 'Project not found');
            this.cdr.detectChanges();
          });
        },
      });

    const projectsSub = this.projectService.getProjects(true).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.projects.set(res);
          this.cdr.detectChanges();
        });
      },
    });

    this.destroyRef.onDestroy(() => {
      projectSub.unsubscribe();
      projectsSub.unsubscribe();
    });
  }

  goToNextProject() {
    const next = this.nextProject();

    if (!next) return;

    this.router.navigate(['/projects', next.slug]);
  }
}
