import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

type GradientTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';

@Component({
  selector: 'app-gradient-text',
  standalone: true,
  imports: [NgClass],
  templateUrl: './gradient-text.html',
})
export class GradientText {
  tagName = input<GradientTag>('span');
  text = input('');
  className = input('');
  gradient = input(true);
  showLine = input(false);

  classes = computed(() => {
    const base = this.gradient()
      ? 'bg-gradient-to-r from-purple-400 via-red-500 to-orange-600 bg-clip-text text-transparent'
      : '';

    return `${base} ${this.className()}`;
  });
}
