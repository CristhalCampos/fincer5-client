import { Injectable, signal, effect } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ThemeService {
  darkMode = signal<boolean>(
    localStorage.getItem("theme") === "dark" ||
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  constructor() {
    effect(() => {
      const mode = this.darkMode() ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", mode);
      localStorage.setItem("theme", mode);
    });
  }

  toggleTheme() {
    this.darkMode.update((prev) => !prev);
  }
}