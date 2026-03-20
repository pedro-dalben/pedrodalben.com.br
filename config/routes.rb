Rails.application.routes.draw do
  namespace :admin do
    get "dashboard", to: "dashboard#index"
    resources :documents do
      member do
        get :download_pdf
      end
    end
    resources :projects
    resources :posts
    resources :clients
    post "images", to: "images#create"
  end
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations",
    passwords: "users/passwords"
  }

  root "home#index"

  get "about", to: "about#index"
  get "portfolio", to: "portfolio#index"
  get "portfolio/:id", to: "portfolio#show", as: :portfolio_project
  get "blog", to: "blog#index"
  get "blog/:slug", to: "blog#show", as: :blog_post
  post "contact", to: "contact#create"

  get "up" => "rails/health#show", as: :rails_health_check
end
