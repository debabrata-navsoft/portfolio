import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import {
  DateRange,
  FilterGroup,
  FilterOption,
  FilterSelection,
} from '../../../models/filter.model';
import { cloneFilterSelection, emptyFilterSelection } from '../filter.utils';
import { CustomButton } from '../../components/custom-button/custom-button';
import { DatePicker } from '../../components/date-picker/date-picker';

const DATE_PRESETS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: 'last-7', label: 'Last 7 days', days: 7 },
  { id: 'last-30', label: 'Last 30 days', days: 30 },
  { id: 'all', label: 'All', days: 0 },
];

const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const presetRange = (days: number): DateRange => {
  if (!days) return { from: '', to: '' };

  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));

  return { from: toIsoDate(from), to: toIsoDate(to) };
};

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [LucideAngularModule, NgClass, CustomButton, DatePicker],
  templateUrl: './filter-drawer.html',
  styleUrl: './filter-drawer.css',
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class FilterDrawer {
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  open = input(false);
  groups = input<FilterGroup[]>([]);
  selection = input<FilterSelection>(emptyFilterSelection());
  totalResults = input(0);

  closed = output<void>();
  draftChange = output<FilterSelection>();
  applied = output<FilterSelection>();
  cleared = output<void>();

  draft = signal<FilterSelection>(emptyFilterSelection());
  datePresets = DATE_PRESETS;
  private expanded = signal<Record<string, boolean>>({});
  private optionSearch = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      if (this.open()) {
        this.draft.set(cloneFilterSelection(this.selection()));
      }
      this.toggleScrollLock(this.open());
    });

    this.destroyRef.onDestroy(() => this.toggleScrollLock(false));
  }

  private toggleScrollLock(lock: boolean): void {
    if (!this.isBrowser) return;

    const navbar = document.querySelector('app-navbar nav') as HTMLElement | null;
    const padding = lock
      ? `${Math.max(0, window.innerWidth - document.documentElement.clientWidth)}px`
      : '';

    document.body.style.overflow = lock ? 'hidden' : '';
    document.body.style.paddingRight = padding;
    if (navbar) navbar.style.paddingRight = padding;
  }

  onEscape(): void {
    if (this.open()) this.closed.emit();
  }

  isExpanded(groupId: string): boolean {
    return this.expanded()[groupId] ?? this.groups()[0]?.id === groupId;
  }

  toggleGroup(groupId: string): void {
    const current = this.isExpanded(groupId);
    this.expanded.update((state) => ({ ...state, [groupId]: !current }));
  }

  optionSearchTerm(groupId: string): string {
    return this.optionSearch()[groupId] ?? '';
  }

  updateOptionSearch(groupId: string, value: string): void {
    this.optionSearch.update((state) => ({ ...state, [groupId]: value }));
  }

  visibleOptions(group: FilterGroup): FilterOption[] {
    const options = group.options ?? [];
    const term = this.optionSearchTerm(group.id).trim().toLowerCase();

    return term ? options.filter((option) => option.label.toLowerCase().includes(term)) : options;
  }

  isChecked(groupId: string, optionId: string): boolean {
    return (this.draft().checkboxes[groupId] ?? []).includes(optionId);
  }

  toggleOption(groupId: string, optionId: string): void {
    const current = this.draft().checkboxes[groupId] ?? [];

    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];

    this.draft.update((draft) => ({
      ...draft,
      checkboxes: { ...draft.checkboxes, [groupId]: next },
    }));

    this.draftChange.emit(this.draft());
  }

  dateValue(groupId: string, bound: 'from' | 'to'): string {
    return this.draft().dates[groupId]?.[bound] ?? '';
  }

  activePreset(groupId: string): string {
    const range = this.draft().dates[groupId];

    if (!range || (!range.from && !range.to)) return 'all';

    const match = DATE_PRESETS.filter((preset) => preset.days).find((preset) => {
      const candidate = presetRange(preset.days);

      return candidate.from === range.from && candidate.to === range.to;
    });

    return match?.id ?? '';
  }

  applyPreset(groupId: string, days: number): void {
    const range = presetRange(days);

    this.draft.update((draft) => ({
      ...draft,
      dates: { ...draft.dates, [groupId]: range },
    }));

    this.draftChange.emit(this.draft());
  }

  updateDate(groupId: string, bound: 'from' | 'to', value: string): void {
    const current = this.draft().dates[groupId] ?? { from: '', to: '' };

    this.draft.update((draft) => ({
      ...draft,
      dates: { ...draft.dates, [groupId]: { ...current, [bound]: value } },
    }));

    this.draftChange.emit(this.draft());
  }

  groupBadge(group: FilterGroup): number {
    if (group.type === 'checkbox') return (this.draft().checkboxes[group.id] ?? []).length;

    const range = this.draft().dates[group.id];

    return range && (range.from || range.to) ? 1 : 0;
  }

  clear(): void {
    this.draft.set(emptyFilterSelection());
    this.optionSearch.set({});
    this.cleared.emit();
  }

  apply(): void {
    this.applied.emit(cloneFilterSelection(this.draft()));
  }
}
