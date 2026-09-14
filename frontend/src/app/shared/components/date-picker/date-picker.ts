import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

/** Panel views, in drill-down order: a 24-year grid → a 12-month grid → the days. */
export type CalendarView = 'days' | 'years' | 'months';

export interface CalendarDay {
  day: number;
  /** ISO `yyyy-mm-dd` — what the picker emits. */
  date: string;
  disabled: boolean;
  /** Ready-built button classes, so the grids do no work per change-detection pass. */
  class: string;
}

/** One cell of the year or the month grid — they share a layout. */
export interface CalendarCell {
  /** Year number, or month index. */
  id: number;
  label: string;
  disabled: boolean;
  class: string;
}

const YEARS_PER_PAGE = 24;
const MONTHS = 'JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC'.split(' ');
const STEP_LABEL: Record<CalendarView, string> = {
  years: 'years',
  months: 'year',
  days: 'month',
};

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toDisplay = (d: Date) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

/**
 * Accepts `DD-MM-YYYY` (what the field shows) or `yyyy-mm-dd` (what it emits).
 * ISO strings are parsed as **local** midnight — `new Date('2026-09-14')` alone
 * is UTC and lands on the 13th in any negative-offset timezone.
 */
const parse = (value: string): Date | null => {
  if (!value) return null;

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [d, m, y] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);

  return isNaN(date.getTime()) ? null : date;
};

const CELL = 'flex items-center justify-center rounded-full text-xs transition';
const DISABLED = 'cursor-not-allowed text-gray-300';
const PICKED = 'cursor-pointer border border-blue-600 font-semibold text-blue-600';
const PLAIN = 'cursor-pointer text-gray-800 hover:bg-gray-100';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePicker {
  private el = inject(ElementRef);

  value = input('');
  placeholder = input('DD-MM-YYYY');
  hasError = input(false);
  disabled = input(false);
  /** Selectable bounds, `yyyy-mm-dd` or `DD-MM-YYYY`. Empty means unbounded. */
  min = input('');
  max = input('');

  valueChange = output<string>();
  blur = output<void>();

  isOpen = signal(false);
  view = signal<CalendarView>('days');
  readonly weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth());
  private yearPageStart = signal(new Date().getFullYear());
  /** Day-of-month the header shows; survives month and year navigation. */
  private focusDay = signal(new Date().getDate());

  selectedDate = computed(() => parse(this.value()));
  displayValue = computed(() => {
    const date = this.selectedDate();
    return date ? toDisplay(date) : '';
  });

  private minTime = computed(() => parse(this.min())?.setHours(0, 0, 0, 0) ?? null);
  private maxTime = computed(() => parse(this.max())?.setHours(23, 59, 59, 999) ?? null);

  /**
   * Year range, year, or the focused `DD/MM/YYYY`. The day-of-month is sticky,
   * so paging keeps it (14/09/2026 → 14/06/2040) and only clamps on short months.
   */
  headerLabel = computed(() => {
    const year = this.currentYear();

    if (this.view() === 'years') {
      return `${this.yearPageStart()} – ${this.yearPageStart() + YEARS_PER_PAGE - 1}`;
    }
    if (this.view() === 'months') return `${year}`;

    const month = this.currentMonth();

    return `${pad(Math.min(this.focusDay(), daysIn(year, month)))}/${pad(month + 1)}/${year}`;
  });

  /** What the `‹` / `›` arrows page through in the current view. */
  stepLabel = computed(() => STEP_LABEL[this.view()]);

  /** Empty cells before the 1st, so the month starts under the right weekday. */
  leadingBlanks = computed(() =>
    Array.from({ length: new Date(this.currentYear(), this.currentMonth(), 1).getDay() }, (_, i) => i),
  );

  calendarDays = computed<CalendarDay[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const selected = this.selectedDate();
    const selectedIso = selected ? toIso(selected) : '';
    const todayIso = toIso(new Date());

    return Array.from({ length: daysIn(year, month) }, (_, i) => {
      const value = new Date(year, month, i + 1);
      const date = toIso(value);
      const time = value.getTime();
      const min = this.minTime();
      const max = this.maxTime();
      const disabled = (min !== null && time < min) || (max !== null && time > max);

      const variant = disabled
        ? DISABLED
        : date === selectedIso
          ? PICKED
          : date === todayIso
            ? 'cursor-pointer font-semibold text-blue-600 hover:bg-blue-50'
            : PLAIN;

      return { day: i + 1, date, disabled, class: `${CELL} h-8 w-8 ${variant}` };
    });
  });

  /** The year grid or the month grid, whichever view is open. */
  gridCells = computed<CalendarCell[]>(() => {
    const selected = this.selectedDate();

    if (this.view() === 'years') {
      const start = this.yearPageStart();
      const active = selected?.getFullYear() ?? this.currentYear();

      return Array.from({ length: YEARS_PER_PAGE }, (_, i) =>
        this.cell(start + i, `${start + i}`, start + i === active, 'h-8', [start + i, 0], [start + i, 11]),
      );
    }

    const year = this.currentYear();
    const active = selected?.getFullYear() === year ? selected.getMonth() : -1;

    return MONTHS.map((label, month) =>
      this.cell(month, label, month === active, 'h-9', [year, month], [year, month]),
    );
  });

  toggle(event?: MouseEvent): void {
    if (this.disabled()) return;

    event?.stopPropagation();
    this.isOpen.update((open) => !open);

    if (!this.isOpen()) return;

    const focus = this.selectedDate() ?? new Date();
    this.currentYear.set(focus.getFullYear());
    this.currentMonth.set(focus.getMonth());
    this.yearPageStart.set(focus.getFullYear());
    this.focusDay.set(focus.getDate());
    this.view.set('days');
  }

  /** Header click drills out to the year grid, and back down again. */
  toggleView(): void {
    this.view.update((view) => (view === 'years' ? 'days' : 'years'));
    if (this.view() === 'years') this.yearPageStart.set(this.currentYear());
  }

  step(direction: number): void {
    if (this.view() === 'years') {
      this.yearPageStart.update((start) => start + direction * YEARS_PER_PAGE);
    } else if (this.view() === 'months') {
      this.currentYear.update((year) => year + direction);
    } else {
      const next = new Date(this.currentYear(), this.currentMonth() + direction, 1);
      this.currentYear.set(next.getFullYear());
      this.currentMonth.set(next.getMonth());
    }
  }

  /** A year drills down to its months; a month drills down to its days. */
  selectCell(id: number): void {
    if (this.view() === 'years') {
      this.currentYear.set(id);
      this.view.set('months');
      return;
    }

    this.currentMonth.set(id);
    this.view.set('days');
  }

  select(date: string): void {
    this.valueChange.emit(date);
    this.isOpen.set(false);
  }

  selectToday(): void {
    const today = new Date();

    this.currentYear.set(today.getFullYear());
    this.currentMonth.set(today.getMonth());
    this.select(toIso(today));
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.blur.emit();
    }
  }

  /** Grid cell, disabled when no day in `[first … last]` month span is selectable. */
  private cell(
    id: number,
    label: string,
    picked: boolean,
    height: string,
    first: [number, number],
    last: [number, number],
  ): CalendarCell {
    const min = this.minTime();
    const max = this.maxTime();
    const disabled =
      (min !== null && new Date(last[0], last[1] + 1, 0, 23, 59, 59).getTime() < min) ||
      (max !== null && new Date(first[0], first[1], 1).getTime() > max);

    return {
      id,
      label,
      disabled,
      class: `${CELL} ${height} ${disabled ? DISABLED : picked ? PICKED : PLAIN}`,
    };
  }
}
