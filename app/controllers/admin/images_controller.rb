class Admin::ImagesController < Admin::BaseController
  def create
    uploaded_file = params[:file]
    
    if uploaded_file.present?
      filename = SecureRandom.hex(8) + File.extname(uploaded_file.original_filename)
      uploads_dir = Rails.root.join('public', 'uploads')
      FileUtils.mkdir_p(uploads_dir)
      
      file_path = uploads_dir.join(filename)
      
      File.open(file_path, 'wb') do |file|
        file.write(uploaded_file.read)
      end
      
      image_url = "/uploads/#{filename}"
      
      render json: { 
        success: 1, 
        file: { 
          url: image_url 
        } 
      }
    else
      render json: { success: 0, message: "Nenhum arquivo enviado" }, status: :unprocessable_entity
    end
  rescue => e
    render json: { success: 0, message: e.message }, status: :unprocessable_entity
  end
end

