class PortfolioController < ApplicationController
  def index
    @projects = Project.published.order(created_at: :desc)
  end

  def show
    @project = Project.published.find(params[:id])
  end
end
