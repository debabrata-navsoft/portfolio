import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AdminSkillForm } from '../admin-skill-form/admin-skill-form';
import { LucideAngularModule } from 'lucide-angular';

import { SkillsService } from '../../../../core/services/skills.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { SkillResponse } from '../../../../models/skills.model';
import { Error } from '../../../../shared/components/error/error';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-skill-list',
  standalone: true,
  imports: [AdminSkillForm, LucideAngularModule, Error],
  templateUrl: './admin-skill-list.html',
})
export class AdminSkillList implements OnInit {
  private skillsService = inject(SkillsService);

  private destroyRef = inject(DestroyRef);
  private snackBarService = inject(SnackBarService);
  private loaderService = inject(LoaderService);

  skills = signal<SkillResponse[]>([]);
  showForm = signal(false);
  isErrorMsg = signal(false);
  editingSkill = signal<SkillResponse | null>(null);

  // Display order of the category boxes — anything else is appended after these.
  private readonly categoryOrder = ['frontend', 'backend', 'language', 'tool'];

  groupedSkills = computed(() => {
    const groups = new Map<string, SkillResponse[]>();

    for (const skill of this.skills()) {
      const category = skill.category || 'Other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(skill);
    }

    return Array.from(groups.entries())
      .map(([category, skills]) => ({
        category,
        skills,
      }))
      .sort((a, b) => this.categoryRank(a.category) - this.categoryRank(b.category));
  });

  private categoryRank(category: string): number {
    // 'Tools' / 'Languages' should match 'tool' / 'language' in categoryOrder.
    const normalized = category.trim().toLowerCase().replace(/s$/, '');
    const index = this.categoryOrder.indexOf(normalized);

    return index === -1 ? this.categoryOrder.length : index;
  }

  ngOnInit(): void {
    this.loaderService.showApi();
    const skillsSub = this.skillsService
      .getSkills()
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.skills.set(res);
        },
        error: (err) => {
          this.isErrorMsg.set(true);
          console.log(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      skillsSub.unsubscribe();
    });
  }

  deleteSkill(id: string) {
    const confirmed = confirm('Are you sure delete this skill?');

    if (!confirmed) {
      return;
    }

    this.loaderService.showApi();

    const skillSub = this.skillsService
      .deleteSkill(id)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({
        next: (res) => {
          this.skills.update((skills) => skills.filter((skill) => skill._id !== id));
          this.snackBarService.success(res.message);
        },
        error: (err) => {
          this.snackBarService.error(err.message);
        },
      });

    this.destroyRef.onDestroy(() => {
      skillSub.unsubscribe();
    });
  }

  openForm(skill?: SkillResponse) {
    this.editingSkill.set(skill ?? null);
    this.showForm.set(true);
  }

  closeForm(savedSkill?: SkillResponse) {
    this.showForm.set(false);
    this.editingSkill.set(null);

    if (!savedSkill) {
      return;
    }

    this.skills.update((skills) => {
      const exists = skills.some((s) => s._id === savedSkill._id);
      return exists
        ? skills.map((s) => (s._id === savedSkill._id ? savedSkill : s))
        : [savedSkill, ...skills];
    });
  }
}
