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
    // Inicializar AOS (Animate On Scroll)
    AOS.init({
      duration: 800, // Duração da animação em ms
      easing: "ease-in-out", // Tipo de easing
      once: true, // Animar apenas uma vez
      offset: 100, // Offset (em pixels) do trigger original
      delay: 0, // Delay inicial
      anchorPlacement: "top-bottom", // Define onde o trigger acontece
    });

    // Refresh AOS quando houver mudanças no DOM (navegação)
    AOS.refresh();
  }
}
