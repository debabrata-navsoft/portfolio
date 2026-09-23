import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { EMPTY, switchMap, finalize } from 'rxjs';

import { ProjectService } from '../../../../core/services/project.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { Error } from '../../../../shared/components/error/error';
import { ProjectForm } from '../../../../models/project.model';
import { DatePicker } from '../../../../shared/components/date-picker/date-picker';
import { MarkdownToolbar } from '../../../../shared/components/markdown-toolbar/markdown-toolbar';
import { MarkdownPreview } from '../../../../shared/components/markdown-preview/markdown-preview';

@Component({
  selector: 'app-admin-project-form',
  standalone: true,
  imports: [LucideAngularModule, DatePicker, MarkdownToolbar, MarkdownPreview, Error],
  templateUrl: './admin-project-form.html',
  styleUrl: './admin-project-form.css',
})
export class AdminProjectForm implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  isErrorMsg = signal(false);
  imagePreview = signal<string | null>(null);
  projectCardImagePreview = signal<string | null>(null);
  technologyInput = signal('');
  editingId = signal<string | null>(null);

  touched = signal<{
    title: boolean;
    category: boolean;
    projectDate: boolean;
    projectCardImage: boolean;
    image: boolean;
    technologies: boolean;
    overview: boolean;
    description: boolean;
  }>({
    title: false,
    category: false,
    projectDate: false,
    projectCardImage: false,
    image: false,
    technologies: false,
    overview: false,
    description: false,
  });

  projects = signal<ProjectForm>({
    title: '',
    slug: '',
    projectDate: '',
    overview: '',
    description: '',
    category: '',
    projectCardImageFile: null,
    imageFile: null,
    technologies: [],
    liveUrl: '',
    githubUrl: '',
    isActive: true,
  });

  ngOnInit(): void {
    const projectSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');

          if (!slug) return EMPTY;

          this.loaderService.showApi();

          return this.projectService
            .getProjectBySlug(slug)
            .pipe(finalize(() => this.loaderService.hideApi()));
        }),
      )
      .subscribe({
        next: (project) => {
          this.editingId.set(project._id);
          this.projects.set({
            title: project.title,
            slug: project.slug,
            projectDate: project.projectDate
              ? new Date(project.projectDate).toISOString().split('T')[0]
              : '',
            overview: project.overview,
            description: project.description,
            category: project.category,
            projectCardImageFile: null,
            imageFile: null,
            technologies: project.technologies || [],
            liveUrl: project.liveUrl || '',
            githubUrl: project.githubUrl || '',
            isActive: project.isActive !== false,
          });

          this.imagePreview.set(project.image);
          this.projectCardImagePreview.set(project.projectCardImage);
        },
        error: (err) => {
          this.snackBarService.error(err.error?.message || 'Project not found');
          this.isErrorMsg.set(true);
        },
      });

    this.destroyRef.onDestroy(() => {
      projectSub.unsubscribe();
    });
  }

  markTouched(
    field:
      | 'title'
      | 'category'
      | 'projectDate'
      | 'projectCardImage'
      | 'image'
      | 'technologies'
      | 'overview'
      | 'description',
  ) {
    this.touched.update((t) => ({
      ...t,
      [field]: true,
    }));
  }

  isFieldInvalid(
    field:
      | 'title'
      | 'category'
      | 'projectDate'
      | 'projectCardImage'
      | 'image'
      | 'technologies'
      | 'overview'
      | 'description',
  ): boolean {
    const isTouched = this.touched()[field];
    if (!isTouched) return false;

    const form = this.projects();
    if (field === 'title') return !form.title?.trim();
    if (field === 'category') return !form.category?.trim();
    if (field === 'projectDate') return !form.projectDate?.trim();
    if (field === 'projectCardImage')
      return !this.editingId() && !form.projectCardImageFile && !this.projectCardImagePreview();
    if (field === 'image') return !this.editingId() && !form.imageFile && !this.imagePreview();
    if (field === 'technologies') return !form.technologies || form.technologies.length === 0;
    if (field === 'overview') return !form.overview?.trim();
    if (field === 'description') return !form.description?.trim();
    return false;
  }

  updateField<K extends keyof ProjectForm>(field: K, value: ProjectForm[K]) {
    this.projects.update((project) => ({
      ...project,
      [field]: value,
    }));
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  updateTitle(title: string) {
    this.projects.update((form) => ({
      ...form,
      title,
      slug: this.generateSlug(title),
    }));
  }

  onProjectCardImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    this.projects.update((project) => ({
      ...project,
      projectCardImageFile: file,
    }));

    this.projectCardImagePreview.set(URL.createObjectURL(file));
  }

  removeProjectCardImage() {
    this.projects.update((project) => ({
      ...project,
      projectCardImageFile: null,
    }));

    this.projectCardImagePreview.set(null);
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    this.projects.update((project) => ({
      ...project,
      imageFile: file,
    }));

    this.imagePreview.set(URL.createObjectURL(file));
  }

  removeImage() {
    this.projects.update((project) => ({
      ...project,
      imageFile: null,
    }));

    this.imagePreview.set(null);
  }

  addTechnology() {
    const value = this.technologyInput().trim();
    if (!value) return;

    const exists = this.projects().technologies.includes(value);
    if (exists) return;

    this.projects.update((project) => ({
      ...project,
      technologies: [...project.technologies, value],
    }));

    this.technologyInput.set('');
  }

  removeTechnology(index: number) {
    this.projects.update((project) => ({
      ...project,
      technologies: project.technologies.filter((_, i) => i !== index),
    }));
  }

  submitProject() {
    this.touched.set({
      title: true,
      category: true,
      projectDate: true,
      projectCardImage: true,
      image: true,
      technologies: true,
      overview: true,
      description: true,
    });

    const form = this.projects();
    const id = this.editingId();

    if (!form.title || !form.overview || !form.description || !form.category || !form.projectDate) {
      this.snackBarService.error('All fields are required');
      return;
    }

    if (!id && (!form.imageFile || !form.projectCardImageFile)) {
      this.snackBarService.error('Project image and card image are required');
      return;
    }

    const formData = new FormData();

    formData.append('title', form.title);
    formData.append('overview', form.overview);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('projectDate', form.projectDate);
    formData.append('technologies', JSON.stringify(form.technologies));
    formData.append('liveUrl', form.liveUrl);
    formData.append('githubUrl', form.githubUrl);
    formData.append('isActive', String(form.isActive));

    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }

    if (form.projectCardImageFile) {
      formData.append('projectCardImage', form.projectCardImageFile);
    }

    this.loading.set(true);
    this.loaderService.showApi();

    const projectUpdate = id
      ? this.projectService.updateProject(id, formData)
      : this.projectService.createProject(formData);

    const projectSub = projectUpdate.pipe(finalize(() => this.loaderService.hideApi())).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBarService.success(res.message);
        this.router.navigate(['/admin/projects']);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBarService.error(err.error?.message || 'Something went wrong');
      },
    });

    this.destroyRef.onDestroy(() => {
      projectSub.unsubscribe();
    });
  }

  onCancel() {
    this.router.navigate(['/admin/projects']);
  }
}
