import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AboutService } from '../../../core/services/about.service';
import { LoaderService } from '../../../core/services/loader.service';
import { AboutResponse } from '../../../models/about.model';
import { LucideAngularModule } from 'lucide-angular';
import { GradientText } from '../gradient-text/gradient-text';
import { RevealDirective } from '../../directives/reveal.directive';
import { FormatTextPipe } from '../../../pipes/format-text.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LucideAngularModule, GradientText, RevealDirective, FormatTextPipe],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  private aboutService = inject(AboutService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  abouts = signal<AboutResponse>({
    description: '',
    email: '',
    location: '',
    images: [],
  });

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const aboutSub = this.aboutService.getAbout().subscribe({
      next: (res) => {
        this.abouts.set({
          ...res,
          images: res.images || [],
        });
        this.loaderService.completeRequest();
      },

      error: (err) => {
        this.loaderService.reportContentError();
        console.error('About fetch failed', err);
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      aboutSub.unsubscribe();
    });
  }
}
