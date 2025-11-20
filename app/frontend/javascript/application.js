import "@hotwired/turbo-rails";
import { Application } from "@hotwired/stimulus";

const application = Application.start();

const controllers = import.meta.glob("./controllers/**/*_controller.js", { eager: true });
Object.keys(controllers).forEach((path) => {
  const module = controllers[path];
  let name = path
    .replace("./controllers/", "")
    .replace("_controller.js", "")
    .replace(/\//g, "--");
  
  const nameWithDashes = name.replace(/_/g, "-");
  
  if (module.default) {
    application.register(nameWithDashes, module.default);
    if (name !== nameWithDashes) {
      application.register(name, module.default);
    }
    console.log(`Stimulus: Controller "${nameWithDashes}" (também "${name}") registrado`);
  }
});

export { application };

