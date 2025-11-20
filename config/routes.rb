Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    passwords: 'users/passwords'
  }

  root "home#index"

  get "about", to: "about#index"
  get "portfolio", to: "portfolio#index"
  get "portfolio/:id", to: "portfolio#show", as: :portfolio_project
  get "blog", to: "blog#index"
  get "blog/:slug", to: "blog#show", as: :blog_post

  namespace :admin do
    get "dashboard", to: "dashboard#index"
    resources :projects
    resources :posts
    resources :clients
    post "images", to: "images#create"
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
