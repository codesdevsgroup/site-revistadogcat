import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import AOS from "aos";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: "<router-outlet />",
})
export class AppComponent implements OnInit {
  title = "site-revistadogcat";

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 100,
      delay: 0,
      anchorPlacement: "top-bottom",
    });
    AOS.refresh();
  }
}
