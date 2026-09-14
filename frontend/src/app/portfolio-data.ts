import { FooterMenu, SocialLink } from './models/footer.model';
import { NavbarMenu } from './models/navbar.model';

export const NAVBAR_MENU: NavbarMenu[] = [
  { id: 'about', title: 'About', link: '/#about' },
  { id: 'services', title: 'Services', link: '/#services' },
  { id: 'projects', title: 'Projects', link: '/projects' },
  { id: 'articles', title: 'Articles', link: '/articles' },
  { id: 'contact', title: 'Book a call', link: '/contact', icon: 'move-right' },
];

export const FOOTER_MENU: FooterMenu[] = [
  { id: 'home', title: 'Home', link: '/' },
  { id: 'about', title: 'About', link: '/#about' },
  { id: 'services', title: 'Services', link: '/#services' },
  // { id: 'experience', title: 'Experience', link: '/#experience' },
  { id: 'projects', title: 'Projects', link: '/projects' },
  { id: 'articles', title: 'Articles', link: '/articles' },
  { id: 'contact', title: 'Contact', link: '/contact' },
];

// export const NAVBAR_MENU: NavbarMenu[] = [
//   // { id: 'home', title: 'Home', type: 'route' },
//   { id: 'about', title: 'About', type: 'section' },
//   // { id: 'skills', title: 'Skills', type: 'section' },
//   // { id: 'experience', title: 'Experience', type: 'section' },
//   { id: 'projects', title: 'Projects', type: 'route' },
//   { id: 'articles', title: 'Articles', type: 'route' },
//   { id: 'contact', title: 'Book a call', type: 'route', icon: 'move-right' },
// ];

// export const FOOTER_MENU: FooterMenu[] = [
//   { name: 'Home', id: 'home', type: 'route' },
//   { name: 'About', id: 'about', type: 'section' },
//   { name: 'Experience', id: 'experience', type: 'section' },
//   { name: 'Projects', id: 'projects', type: 'route' },
//   { name: 'Articles ', id: 'articles', type: 'route' },
//   { name: 'Contact', id: 'contact', type: 'route' },
// ];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    title: 'GitHub',
    icon: 'github',
    link: 'https://github.com/dev-debabrata',
  },
  {
    title: 'LinkedIn',
    icon: 'linkedin',
    link: 'https://www.linkedin.com/in/debabrata-das-01b371152/',
  },

  {
    title: 'Twitter',
    icon: 'twitter',
    link: 'https://www.linkedin.com/in/debabrata-das-01b371152/',
  },

  {
    title: 'Facebook',
    icon: 'facebook',
    link: 'https://facebook.com',
  },

  {
    title: 'Instagram',
    icon: 'instagram',
    link: 'https://facebook.com',
  },
];

