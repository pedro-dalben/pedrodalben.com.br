class Admin::ProjectsController < Admin::BaseController
  layout "admin"
  before_action :set_project, only: [:show, :edit, :update, :destroy]

  def index
    @projects = Project.order(created_at: :desc)
  end

  def show
  end

  def new
    @project = Project.new
  end

  def create
    @project = Project.new(project_params)
    if @project.save
      redirect_to admin_project_path(@project), notice: "Projeto criado com sucesso"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @project.update(project_params)
      redirect_to admin_project_path(@project), notice: "Projeto atualizado com sucesso"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @project.destroy
    redirect_to admin_projects_path, notice: "Projeto removido com sucesso"
  end

  private

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.require(:project).permit(:title, :description, :url, :github_url, :image_url, :featured, :published, :project_type)
  end
end
