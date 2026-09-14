import { trigger, transition, style, animate, query, stagger, state } from '@angular/animations';

export const fadeUpAnimation = trigger('fadeUpAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(70px)',
    }),
    animate(
      '1000ms cubic-bezier(0.22, 1, 0.36, 1)',
      style({
        opacity: 1,
        transform: 'translateY(0)',
      }),
    ),
  ]),
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({
          opacity: 0,
          transform: 'translateY(80px)',
        }),
        stagger(150, [
          animate(
            '1000ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({
              opacity: 1,
              transform: 'translateY(0)',
            }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

// FAQ Accordion Animation
export const faqAnimation = trigger('faqAnimation', [
  state(
    'closed',
    style({
      height: '0px',
      opacity: 0,
      marginTop: '0',
      overflow: 'hidden',
    }),
  ),

  state(
    'open',
    style({
      height: '*',
      opacity: 1,
      marginTop: '12px',
      overflow: 'hidden',
    }),
  ),

  transition('closed <=> open', animate('800ms cubic-bezier(0.22, 1, 0.36, 1)')),
]);
