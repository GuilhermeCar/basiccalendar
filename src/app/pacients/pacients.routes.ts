import { Routes } from "@angular/router";

export const pacientsRoutes: Routes = [
  {
    path: "pacients-list",
    loadComponent: () =>
      import("./pacients-list-page/pacients-list.page").then(
        (m) => m.PacientsListPage
      ),
  },
  {
    path: "pacients-form",
    loadComponent: () =>
      import("./pacients-form-page/pacients-form.page").then(
        (m) => m.PacientsFormPage
      ),
  },
  {
    path: "pacients-form/:id",
    loadComponent: () =>
      import("./pacients-form-page/pacients-form.page").then(
        (m) => m.PacientsFormPage
      ),
  },
  {
    path: "",
    redirectTo: "pacients-list",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "pacients-list",
  }
]
