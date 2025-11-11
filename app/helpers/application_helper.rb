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

    image_name = icons[tech]
    return nil if image_name.nil?

    image_tag(image_name, alt: tech, class: "w-8 h-8 object-contain")
  end

  def social_icon(platform)
    icons = {
      "linkedin" => "linkedin.png",
      "github" => "github.png",
      "instagram" => "Instagram_icon.png"
    }

    image_name = icons[platform.downcase]
    return nil if image_name.nil?

    image_tag(image_name, alt: platform, class: "w-5 h-5")
  end
end
