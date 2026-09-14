import { Component, signal } from '@angular/core';
import { GradientText } from '../gradient-text/gradient-text';
import { LucideAngularModule } from 'lucide-angular';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home-services',
  standalone: true,
  imports: [GradientText, LucideAngularModule, RevealDirective],
  templateUrl: './home-services.html',
  styleUrl: './home-services.css',
})
export class HomeServices {
  services = signal([
    {
      _id: 1,
      icon: 'monitor-smartphone',
      title: 'Frontend Development',
      description:
        'Responsive and high-performance web applications using Angular, React and modern technologies.',
      lists: ['Angular', 'React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      _id: 2,
      icon: 'server',
      title: 'Backend Development',
      description: 'Scalable REST APIs with authentication and database integration.',
      lists: ['Node.js', 'Express', 'MongoDB', 'JWT Authentication'],
    },
    {
      _id: 3,
      icon: 'layout-dashboard',
      title: 'Admin Dashboard',
      description:
        'Professional admin panels with analytics, CRUD operations and secure authentication.',
      lists: ['Role Based Access', 'Charts', 'CMS', 'Responsive UI'],
    },
  ]);
}
