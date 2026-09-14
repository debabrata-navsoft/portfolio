import { Component, inject, input, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, MoveRight } from 'lucide-angular';

@Component({
  selector: 'app-custom-nav',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './custom-nav.html',
  styleUrl: './custom-nav.css',
})
export class CustomNav {
  private router = inject(Router);

  text = input('');
  iconSize = input(16);
  class = input('');
  to = input<string>();
  href = input<string>();

  ArrowRight = MoveRight;

  navigate() {
    if (this.href()) {
      window.open(this.href()!, '_blank');
      return;
    }

    if (this.to()) {
      this.router.navigate([this.to()]);
    }
  }

  // navigate() {
  //   if (this.to?.length) {
  //     this.router.navigate([this.to]);
  //   }
  // }
}
