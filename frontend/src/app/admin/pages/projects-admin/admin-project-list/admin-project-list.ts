import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../../../../core/services/project.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { ProjectResponse } from '../../../../models/project.model';
import { LoaderService } from '../../../../core/services/loader.service';
import { Error } from '../../../../shared/components/error/error';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import {
  deleteAction,
  editAction,
  TableAction,
  TableActionEvent,
  TableColumn,
  TableFilter,
  viewAction,
} from '../../../../shared/components/data-table/data-table.model';

@Component({
  selector: 'app-admin-project-list',
  standalone: true,
  imports: [Error, DataTable],
  templateUrl: './admin-project-list.html',
  styleUrl: './admin-project-list.css',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class AdminProjectList implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  projects = signal<ProjectResponse[]>([]);
  isErrorMsg = signal(false);

  readonly columns: TableColumn<ProjectResponse>[] = [
    { key: 'id', header: 'ID', type: 'index', align: 'center' },
    { key: 'image', header: 'IMAGE', type: 'image', imageAlt: (row) => row.title },
    { key: 'title', header: 'PROJECT TITLE', cellClass: 'tbl-col-title' },
    { key: 'projectDate', header: 'DATE', type: 'date' },
    {
      key: 'category',
      header: 'CATEGORY',
      type: 'badge',
      align: 'center',
      value: (row) => row.category?.toUpperCase() || 'GENERAL',
    },
    { key: 'technologies', header: 'TECHNOLOGIES', type: 'tags' },
  ];

  readonly filters: TableFilter<ProjectResponse>[] = [
    { key: 'category', label: 'Category' },
    { key: 'technologies', label: 'Technology' },
    { key: 'projectDate', label: 'Project Date', type: 'date' },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
  ];

  readonly actions: TableAction<ProjectResponse>[] = [
    viewAction('project', 'eye'),
    editAction('project'),
    deleteAction('project'),
  ];

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loaderService.showApi();
    const projectSub = this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects.set(
          res.sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
        );
        this.loaderService.hideApi();
      },
      error: (err) => {
        this.isErrorMsg.set(true);
        this.loaderService.hideApi();
        console.log(err.message);
      },
    });

    this.destroyRef.onDestroy(() => {
      projectSub.unsubscribe();
    });
  }

  onAction(event: TableActionEvent<ProjectResponse>) {
    switch (event.id) {
      case 'view':
        this.viewProject(event.row.slug);
        break;
      case 'edit':
        this.editProject(event.row.slug);
        break;
      case 'delete':
        this.deleteProject(event.row._id);
        break;
    }
  }

  addProject() {
    this.router.navigate(['/admin/projects/add']);
  }

  viewProject(slug: string) {
    this.router.navigate(['/admin/projects', slug]);
  }

  editProject(slug: string) {
    this.router.navigate(['/admin/projects/edit', slug]);
  }

  deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.loaderService.showApi();
      const deleteSub = this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.projects.update((projs) => projs.filter((p) => p._id !== id));
          this.loaderService.hideApi();
          this.snackBarService.success('Project deleted successfully.');
        },
        error: (err) => {
          this.loaderService.hideApi();
          this.snackBarService.error('Failed to delete project.');
          console.log(err.message);
        },
      });

      this.destroyRef.onDestroy(() => {
        deleteSub.unsubscribe();
      });
    }
  }
}
