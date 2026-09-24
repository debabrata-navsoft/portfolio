import { Component, computed, inject } from '@angular/core';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ProjectService } from '../../../core/services/project.service';
import { ProjectListFilters, ProjectQuery, ProjectResponse } from '../../../models/project.model';
import { FilterGroup, FilterSelection } from '../../../models/filter.model';
import { Error } from '../../../shared/components/error/error';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CustomNav } from '../../../shared/components/custom-nav/custom-nav';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { ListToolbar } from '../../../shared/components/list-toolbar/list-toolbar';
import { FilterDrawer } from '../../../shared/filters/filter-drawer/filter-drawer';
import { ServerListPage } from '../../../shared/filters/server-list-page';
import { dateBound, facetToOption, selectedValues } from '../../../utils/filter.utils';

@Component({
  selector: 'app-projects-list-page',
  standalone: true,
  imports: [
    NgClass,
    UpperCasePipe,
    Error,
    GradientText,
    LucideAngularModule,
    RevealDirective,
    CustomNav,
    TimeAgoPipe,
    DatePipe,
    ListToolbar,
    FilterDrawer,
  ],
  templateUrl: './projects-list.page.html',
})
export class ProjectsListPage extends ServerListPage<
  ProjectResponse,
  ProjectListFilters,
  ProjectQuery
> {
  private router = inject(Router);
  private projectService = inject(ProjectService);

  filterGroups = computed<FilterGroup[]>(() => [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      searchable: true,
      options: this.facets().categories.map(facetToOption),
    },
    {
      id: 'technology',
      label: 'Technology',
      type: 'checkbox',
      searchable: true,
      options: this.facets().technologies.map(facetToOption),
    },
    { id: 'projectDate', label: 'Project Date', type: 'date' },
    { id: 'createdAt', label: 'Created Date', type: 'date' },
  ]);

  protected emptyFacets(): ProjectListFilters {
    return { categories: [], technologies: [] };
  }

  protected fetch(query: ProjectQuery) {
    return this.projectService.queryProjects(query);
  }

  protected filterQuery(selection: FilterSelection): ProjectQuery {
    return {
      category: selectedValues(selection, 'category'),
      technology: selectedValues(selection, 'technology'),
      dateFrom: dateBound(selection, 'projectDate', 'from'),
      dateTo: dateBound(selection, 'projectDate', 'to'),
      createdFrom: dateBound(selection, 'createdAt', 'from'),
      createdTo: dateBound(selection, 'createdAt', 'to'),
      active: true, // hide inactive projects from a signed-in admin too
    };
  }

  viewProject(slug: string): void {
    this.router.navigate(['/projects', slug]);
  }
}
