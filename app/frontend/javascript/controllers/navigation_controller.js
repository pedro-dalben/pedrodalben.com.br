import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["link", "section"];

  connect() {
    this.setupIntersectionObserver();
    this.handleInitialSection();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: "-25% 0px -65% 0px",
      threshold: [0, 0.1, 0.5, 1]
    };

    this.observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => ({
          id: entry.target.id,
          ratio: entry.intersectionRatio
        }))
        .sort((a, b) => b.ratio - a.ratio);

      if (visibleSections.length > 0) {
        this.updateActiveLink(visibleSections[0].id);
      }
    }, options);

    this.sectionTargets.forEach((section) => {
      if (section.id) {
        this.observer.observe(section);
      }
    });
  }

  handleInitialSection() {
    const scrollPosition = window.scrollY;
    if (scrollPosition < 100) {
      this.updateActiveLink("inicio");
    }
  }

  updateActiveLink(sectionId) {
    this.linkTargets.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${sectionId}`) {
        link.classList.remove("text-gray-300");
        link.classList.add("text-white", "font-semibold");
      } else {
        link.classList.remove("text-white", "font-semibold");
        link.classList.add("text-gray-300");
      }
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

