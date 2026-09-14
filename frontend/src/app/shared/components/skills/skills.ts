import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { SkillsService } from '../../../core/services/skills.service';
import { LoaderService } from '../../../core/services/loader.service';
import { SkillResponse } from '../../../models/skills.model';
import { GradientText } from '../gradient-text/gradient-text';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [GradientText, RevealDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills implements OnInit {
  private skillsService = inject(SkillsService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  skills = signal<SkillResponse[]>([]);

  // Display order of the category cards — anything else is appended after these.
  private readonly categoryOrder = ['language', 'backend', 'frontend', 'tool'];

  categorySkills = computed(() => {
    const groups: { category: string; list: SkillResponse[] }[] = [];

    this.skills().forEach((skill) => {
      const category = skill.category || 'Others';
      const existing = groups.find((g) => g.category.toLowerCase() === category.toLowerCase());

      if (existing) {
        existing.list.push(skill);
      } else {
        groups.push({
          category,
          list: [skill],
        });
      }
    });

    return groups.sort((a, b) => this.categoryRank(a.category) - this.categoryRank(b.category));
  });

  private categoryRank(category: string): number {
    const normalized = category.trim().toLowerCase().replace(/s$/, '');
    const index = this.categoryOrder.indexOf(normalized);
    return index === -1 ? this.categoryOrder.length : index;
  }

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const skillsSub = this.skillsService.getSkills().subscribe({
      next: (res) => {
        this.skills.set(res);
        this.loaderService.completeRequest();
      },
      error: (err) => {
        console.log(err.message);
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      skillsSub.unsubscribe();
    });
  }
}
