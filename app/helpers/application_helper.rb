module ApplicationHelper
  def tech_icon(tech)
    icons = {
      "Vue.js" => "Vue.js.png",
      "Ruby" => "ruby.png",
      "Ruby on Rails" => "rails.png",
      "JavaScript" => "javascript.png",
      "Python" => "Python.png",
      "Java" => "Java.png",
      "Liderança" => nil
    }

    alt_texts = {
      "Vue.js" => "Ícone do framework Vue.js",
      "Ruby" => "Ícone da linguagem Ruby",
      "Ruby on Rails" => "Ícone do framework Ruby on Rails",
      "JavaScript" => "Ícone da linguagem JavaScript",
      "Python" => "Ícone da linguagem Python",
      "Java" => "Ícone da linguagem Java"
    }

    image_name = icons[tech]
    return nil if image_name.nil?

    alt_text = alt_texts[tech] || tech
    image_tag(image_name, alt: alt_text, class: "w-8 h-8 object-contain")
  end

  def social_icon(platform)
    icons = {
      "linkedin" => "linkedin.png",
      "github" => "github.png",
      "instagram" => "Instagram_icon.png"
    }

    alt_texts = {
      "linkedin" => "LinkedIn - perfil profissional",
      "github" => "GitHub - repositórios de código",
      "instagram" => "Instagram - perfil pessoal"
    }

    image_name = icons[platform.downcase]
    return nil if image_name.nil?

    alt_text = alt_texts[platform.downcase] || platform
    image_tag(image_name, alt: alt_text, class: "w-5 h-5")
  end
end
