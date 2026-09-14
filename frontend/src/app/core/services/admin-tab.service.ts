import { Injectable, signal } from '@angular/core';

export interface AdminTab {
  id: string;
  label: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminTabService {
  tabs = signal<AdminTab[]>([]);
  activeTab = signal<string>('');

  setTabs(tabs: AdminTab[], defaultActive?: string): void {
    this.tabs.set(tabs);
    if (defaultActive) {
      this.activeTab.set(defaultActive);
    } else if (tabs.length > 0 && !tabs.some((t) => t.id === this.activeTab())) {
      this.activeTab.set(tabs[0].id);
    }
  }

  selectTab(id: string): void {
    this.activeTab.set(id);
  }

  clear(): void {
    this.tabs.set([]);
    this.activeTab.set('');
  }
}
