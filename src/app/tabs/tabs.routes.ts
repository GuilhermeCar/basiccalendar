import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('../calendar/calendar.routes').then((m) => m.calendarRoutes),
      },
      {
        path: 'pacients',
        loadChildren: () =>
          import('../pacients/pacients.routes').then((m) => m.pacientsRoutes),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
