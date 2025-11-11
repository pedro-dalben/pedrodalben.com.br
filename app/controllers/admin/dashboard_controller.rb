class Admin::DashboardController < Admin::BaseController
  layout "admin"

  def index
    @projects_count = Project.count
    @published_projects = Project.published.count
    @posts_count = Post.count
    @published_posts = Post.published.count
    @clients_count = Client.count
  end
end
