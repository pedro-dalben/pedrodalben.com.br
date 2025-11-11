class Admin::ClientsController < Admin::BaseController
  layout "admin"
  before_action :set_client, only: [:show, :edit, :update, :destroy]

  def index
    @clients = Client.order(created_at: :desc)
  end

  def show
  end

  def new
    @client = Client.new
  end

  def create
    @client = Client.new(client_params)
    if @client.save
      redirect_to admin_client_path(@client), notice: "Cliente criado com sucesso"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @client.update(client_params)
      redirect_to admin_client_path(@client), notice: "Cliente atualizado com sucesso"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @client.destroy
    redirect_to admin_clients_path, notice: "Cliente removido com sucesso"
  end

  private

  def set_client
    @client = Client.find(params[:id])
  end

  def client_params
    params.require(:client).permit(:name, :company_name, :email, :phone, :website_url, :logo_url, :notes)
  end
end
