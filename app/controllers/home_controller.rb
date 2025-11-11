class HomeController < ApplicationController
  def index
    @featured_projects = Project.published.featured.limit(3)
    @recent_posts = Post.published.limit(3)
  end
end
