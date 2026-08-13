import { Routes } from "@angular/router";

export const calendarRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./calendar-page/calendar.page').then((m) => m.CalendarPage),
  },
  {
    path: '**',
    redirectTo: '',
  }
]
