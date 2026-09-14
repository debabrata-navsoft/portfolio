import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FilterChip } from '../../../models/filter.model';

@Component({
  selector: 'app-list-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './list-toolbar.html',
})
export class ListToolbar {
  total = input(0);
  /** Plural noun shown in the counter, e.g. "projects" / "articles". */
  label = input('items');
  search = input('');
  placeholder = input('Search...');
  activeFilterCount = input(0);
  chips = input<FilterChip[]>([]);

  searchChange = output<string>();
  openFilters = output<void>();
  removeChip = output<FilterChip>();

  onSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchChange.emit('');
  }
}
