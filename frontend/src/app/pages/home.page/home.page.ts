import { Component, inject, OnInit } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero';
import { About } from '../../shared/components/about/about';
import { Skills } from '../../shared/components/skills/skills';
import { EducationExperience } from '../../shared/components/education-experience/education-experience';
import { HomeProjects } from '../../shared/components/home-projects/home-projects';
import { HomeArticles } from '../../shared/components/home-articles/home-articles';
import { HomeServices } from '../../shared/components/home-services/home-services';
import { Error } from '../../shared/components/error/error';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [
    Hero,
    About,
    Skills,
    EducationExperience,
    HomeProjects,
    HomeArticles,
    HomeServices,
    Error,
  ],
  templateUrl: './home.page.html',
})
export class HomePage implements OnInit {
  loaderService = inject(LoaderService);

  ngOnInit(): void {
    // Runs before the sections' own ngOnInit, so a failure from a previous visit
    // can't keep the page in its error state.
    this.loaderService.clearContentError();
  }
}
