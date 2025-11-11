User.create!(
  email: "admin@pedrodalben.com",
  password: "password123",
  password_confirmation: "password123",
  name: "Pedro Dalben",
  role: "admin"
)

Project.create!(
  title: "IntegrarPlus",
  description: "Plataforma especializada para gestão de clínicas terapêuticas, com automação de processos, integração com APIs externas (Google Calendar, Feegow, Asaas), e transformação digital do fluxo operacional da clínica.",
  url: "https://integrarplus.com.br/",
  github_url: nil,
  image_url: nil,
  featured: true,
  published: true,
  project_type: "client"
)

Project.create!(
  title: "Happily Ever After",
  description: "Sistema completo em Ruby on Rails para ajudar casais a gerenciar eventos de casamento, incluindo RSVPs familiares, listas de presentes e comunicação com convidados.",
  url: "https://giovanaepedro.com.br/",
  github_url: "https://github.com/pedro-dalben/HappilyEverAfter",
  image_url: nil,
  featured: true,
  published: true,
  project_type: "personal"
)

Project.create!(
  title: "MaxiCorretor",
  description: "Sistema imobiliário completo para gestão de imóveis, corretores, clientes e leads.",
  url: "https://maxicorretor.com.br/",
  github_url: nil,
  image_url: nil,
  featured: true,
  published: true,
  project_type: "client"
)

puts "Seeds criados com sucesso!"
