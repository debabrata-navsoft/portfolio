import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { SOCIAL_LINKS } from '../../../portfolio-data';
import { ProfileService } from '../../../core/services/profile.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ProfileResponse } from '../../../models/profile.model';
import { LucideAngularModule } from 'lucide-angular';
import { CustomButton } from '../custom-button/custom-button';
import { GradientText } from '../gradient-text/gradient-text';
import { CustomNav } from '../custom-nav/custom-nav';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LucideAngularModule, CustomButton, GradientText, CustomNav, RevealDirective],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {
  private profileService = inject(ProfileService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  socialLinks = SOCIAL_LINKS;

  profileContent = signal<ProfileResponse>({
    imageUrl: '',
    heroGradientText: '',
    heroHeading: '',
    introduction: '',
    profileDescription: '',
  });

  resumeUrl = signal('');

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const profileSub = this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profileContent.set(res);
        this.loaderService.completeRequest();
      },
      error: (err) => {
        console.error('Profile fetch failed', err);
        this.loaderService.completeRequest();
      },
    });

    this.loaderService.trackRequest();
    const resumeSub = this.profileService.getResumeUrl().subscribe({
      next: (resume) => {
        this.resumeUrl.set(resume.resumeUrl);
        this.loaderService.completeRequest();
      },
      error: () => {
        this.resumeUrl.set('');
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      profileSub.unsubscribe();
      resumeSub.unsubscribe();
    });
  }
}
