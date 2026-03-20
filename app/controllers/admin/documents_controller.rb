class Admin::DocumentsController < Admin::BaseController
  before_action :set_document, only: [ :show, :edit, :update, :destroy, :download_pdf ]

  def index
    @documents = current_user.documents.order(updated_at: :desc)
  end

  def new
    @document = current_user.documents.new
  end

  def create
    @document = current_user.documents.new(document_params)

    if @document.save
      @document.generate_table_of_contents!
      redirect_to admin_document_path(@document), notice: "Documento criado com sucesso."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @document.update(document_params)
      @document.generate_table_of_contents!
      redirect_to admin_document_path(@document), notice: "Documento atualizado com sucesso."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @document.destroy
    redirect_to admin_documents_path, notice: "Documento removido com sucesso."
  end

  def show
    @document.generate_table_of_contents! if @document.table_of_contents.blank?
  end

  def download_pdf
    @document.generate_pdf!

    if @document.pdf.attached?
      redirect_to rails_blob_path(@document.pdf, disposition: "attachment")
    else
      redirect_to admin_document_path(@document), alert: "Falha ao gerar o PDF."
    end
  end

  private

  def set_document
    @document = current_user.documents.find_by!(slug: params[:id])
  end

  def document_params
    params.require(:document).permit(:title, :content, :published)
  end
end
