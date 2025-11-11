import "@hotwired/turbo-rails";
import { Application } from "@hotwired/stimulus";

const application = Application.start();

const controllers = import.meta.glob("./controllers/**/*_controller.js", { eager: true });
Object.keys(controllers).forEach((path) => {
  const module = controllers[path];
  const name = path
    .replace("./controllers/", "")
    .replace("_controller.js", "")
    .replace(/\//g, "--");
  if (module.default) {
    application.register(name, module.default);
  }
});

