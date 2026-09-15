import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ProjectService } from '../../../../core/services/project.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { ImageModal } from '../../../../shared/components/image-modal/image-modal';
import { ProjectResponse } from '../../../../models/project.model';
import { Error } from '../../../../shared/components/error/error';
import { FormatTextPipe } from '../../../../pipes/format-text.pipe';
import { CodeCopyDirective } from '../../../../shared/directives/code-copy.directive';

@Component({
  selector: 'app-admin-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    LucideAngularModule,
    Error,
    FormatTextPipe,
    CodeCopyDirective,
    ImageModal,
  ],
  templateUrl: './admin-project-detail.html',
  styleUrl: './admin-project-detail.css',
})
export class AdminProjectDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private loaderService = inject(LoaderService);
  private snackBar = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  project = signal<ProjectResponse | null>(null);
  isErrorMsg = signal(false);
  copiedSlug = signal(false);
  activeImage = signal<string | null>(null);
  isImageModalOpen = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return EMPTY;
          this.loaderService.showApi();
          this.project.set(null);
          return this.projectService.getProjectBySlug(slug);
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
            this.snackBar.error(err.error?.message || 'Project not found');
            this.cdr.detectChanges();
          });
        },
      });
  }

  copySlug(slug: string): void {
    navigator.clipboard.writeText(slug);
    this.copiedSlug.set(true);
    this.snackBar.success('Slug copied to clipboard');
    setTimeout(() => this.copiedSlug.set(false), 2000);
  }

  deleteProject(): void {
    const current = this.project();
    if (!current || !confirm(`Are you sure you want to delete "${current.title}"?`)) return;

    this.loaderService.showApi();
    this.projectService
      .deleteProject(current._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loaderService.hideApi();
          this.snackBar.success('Project deleted successfully');
          this.router.navigate(['/admin/projects']);
        },
        error: (err) => {
          this.loaderService.hideApi();
          this.snackBar.error(err.error?.message || 'Failed to delete project');
        },
      });
  }

  openImage(url?: string | null): void {
    if (url?.trim()) {
      this.activeImage.set(url.trim());
      this.isImageModalOpen.set(true);
    }
  }
}
