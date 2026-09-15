import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { UpperCasePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { ProjectService } from '../../../core/services/project.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ProjectResponse } from '../../../models/project.model';
import { CustomButton } from '../custom-button/custom-button';
import { GradientText } from '../gradient-text/gradient-text';
import { CustomNav } from '../custom-nav/custom-nav';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home-projects',
  standalone: true,
  imports: [
    CustomButton,
    GradientText,
    UpperCasePipe,
    LucideAngularModule,
    CustomNav,
    RevealDirective,
  ],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.css',
})
export class HomeProjects implements OnInit {
  private projectService = inject(ProjectService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  projects = signal<ProjectResponse[]>([]);

  emblaViewport = viewChild<ElementRef<HTMLDivElement>>('emblaViewport');
  private emblaApi?: EmblaCarouselType;

  private options: EmblaOptionsType = { loop: true, align: 'start', dragFree: true };

  constructor() {
    afterNextRender(() => {
      const viewport = this.emblaViewport()?.nativeElement;
      if (!viewport) return;

      this.emblaApi = EmblaCarousel(viewport, this.options, [
        Autoplay({ delay: 3000, stopOnInteraction: false }),
      ]);

      this.destroyRef.onDestroy(() => {
        this.emblaApi?.destroy();
      });
    });
  }

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const projectSub = this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects.set(res);
        this.loaderService.completeRequest();
      },

      error: (err) => {
        this.loaderService.reportContentError();
        console.log(err.message);
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      projectSub.unsubscribe();
    });
  }

  viewProject(slug: string) {
    this.router.navigate(['/projects', slug]);
  }

  prev() {
    this.emblaApi?.scrollPrev();
  }

  next() {
    this.emblaApi?.scrollNext();
  }
}

// import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
// import { ProjectService } from '../../../core/services/project.service';
// import { Router } from '@angular/router';
// import { ProjectResponse } from '../../../models/project.model';
// import { CustomButton } from '../custom-button/custom-button';
// import { GradientText } from '../../animation/gradient-text/gradient-text';

// @Component({
//   selector: 'app-home-projects',
//   standalone: true,
//   imports: [CustomButton, GradientText],
//   templateUrl: './home-projects.html',
//   styleUrl: './home-projects.css',
// })
// export class HomeProjects implements OnInit {
//   private projectService = inject(ProjectService);
//   private destroyRef = inject(DestroyRef);
//   private router = inject(Router);

//   projects = signal<ProjectResponse[]>([]);

//   ngOnInit(): void {
//     const projectSub = this.projectService.getProjects().subscribe({
//       next: (res) => {
//         this.projects.set(res);
//       },

//       error: (err) => {
//         console.log(err.message);
//       },
//     });

//     this.destroyRef.onDestroy(() => {
//       projectSub.unsubscribe();
//     });
//   }

//   viewProject(slug: string) {
//     this.router.navigate(['/projects', slug]);
//   }
// }
