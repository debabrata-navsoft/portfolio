import { Component } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero';
import { About } from '../../shared/components/about/about';
import { SliderView } from '../../shared/components/slider-view/slider-view';
import { Skills } from '../../shared/components/skills/skills';
import { EducationExperience } from '../../shared/components/education-experience/education-experience';
import { HomeProjects } from '../../shared/components/home-projects/home-projects';
import { HomeArticles } from '../../shared/components/home-articles/home-articles';
import { HomeServices } from '../../shared/components/home-services/home-services';

@Component({
  selector: 'app-home.page',
  standalone: true,
  imports: [
    Hero,
    About,
    // SliderView,
    Skills,
    EducationExperience,
    HomeProjects,
    HomeArticles,
    HomeServices,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
})
export class HomePage {}
