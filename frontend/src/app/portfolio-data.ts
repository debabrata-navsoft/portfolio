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
  { id: 'projects', title: 'Projects', link: '/projects' },
  { id: 'articles', title: 'Articles', link: '/articles' },
  { id: 'contact', title: 'Contact', link: '/contact' },
];

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
