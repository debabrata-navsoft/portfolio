import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AdminProfile } from '../../components/admin-profile/admin-profile';
import { AdminAbout } from '../../components/admin-about/admin-about';
import { AdminSkillList } from '../../components/admin-skills/admin-skill-list/admin-skill-list';
import { AdminExperienceList } from '../../components/admin-experiences/admin-experience-list/admin-experience-list';
import { AdminEducationList } from '../../components/admin-education/admin-education-list/admin-education-list';
import { AdminTabService } from '../../../core/services/admin-tab.service';

@Component({
  selector: 'app-profile-admin',
  standalone: true,
  imports: [AdminProfile, AdminAbout, AdminSkillList, AdminExperienceList, AdminEducationList],
  templateUrl: './profile-admin.html',
  styleUrl: './profile-admin.css',
})
export class ProfileAdmin implements OnInit, OnDestroy {
  tabService = inject(AdminTabService);

  readonly tabs = [
    { id: 'image', label: 'Profile Image' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
  ];

  ngOnInit(): void {
    this.tabService.setTabs(this.tabs, 'image');
  }

  ngOnDestroy(): void {
    this.tabService.clear();
  }
}
