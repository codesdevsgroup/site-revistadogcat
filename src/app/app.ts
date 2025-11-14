import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import AOS from "aos";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: "<router-outlet />",
})
export class AppComponent implements OnInit {
  title = "site-revistadogcat";
  constructor(private router: Router) {}

  ngOnInit(): void {
    AOS.init({
      duration: 600,
      easing: "ease-out",
      once: false,
      offset: 80,
      delay: 0,
      anchorPlacement: "top-bottom",
      startEvent: "DOMContentLoaded",
      disableMutationObserver: true,
    });
    AOS.refresh();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        requestAnimationFrame(() => {
          AOS.refresh();
        });
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    });
  }
}
