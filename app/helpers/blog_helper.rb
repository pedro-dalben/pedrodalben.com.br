require 'redcarpet'

module BlogHelper

  def markdown(content)
    return "".html_safe if content.blank?
    
    content_string = content.to_s.strip
    return "".html_safe if content_string.empty?
    
    normalized_content = content_string.gsub(/\r\n/, "\n").gsub(/\r/, "\n")
    
    # Primeiro, converte sintaxe especial [color:...] e [bg:...] para HTML
    processed_content = normalized_content.gsub(/\[color:([^\]]+)\](.*?)\[\/color\]/m) do |match|
      color = $1
      inner_content = $2
      "<span style=\"color: #{color}\">#{inner_content}</span>"
    end
    
    processed_content = processed_content.gsub(/\[bg:([^\]]+)\](.*?)\[\/bg\]/m) do |match|
      color = $1
      inner_content = $2
      "<span style=\"background-color: #{color}\">#{inner_content}</span>"
    end
    
    # Depois, extrai spans com cores e substitui por placeholders
    color_spans = []
    placeholder_pattern = /<span\s+style="(color|background-color):\s*([^"]+)"[^>]*>(.*?)<\/span>/m
    processed_content = processed_content.gsub(placeholder_pattern) do |match|
      style_type = $1
      color = $2
      inner_content = $3
      
      placeholder = "<!--COLOR_SPAN_#{color_spans.length}-->"
      color_spans << { style_type: style_type, color: color, content: inner_content }
      placeholder
    end
    
    # Processa o markdown
    renderer = Redcarpet::Render::HTML.new(
      filter_html: false,
      hard_wrap: true,
      link_attributes: { target: "_blank", rel: "noopener noreferrer" },
      no_images: false,
      no_links: false,
      no_styles: false,
      safe_links_only: false,
      with_toc_data: false,
      prettify: false
    )
    
    markdown_parser = Redcarpet::Markdown.new(
      renderer,
      autolink: true,
      tables: true,
      fenced_code_blocks: true,
      strikethrough: true,
      superscript: true,
      underline: true,
      highlight: true,
      quote: true,
      footnotes: true,
      no_intra_emphasis: false,
      space_after_headers: true,
      lax_spacing: true,
      lax_html_blocks: false
    )
    
    begin
      rendered_html = markdown_parser.render(processed_content)
      
      # Processa markdown dentro dos spans de cor e restaura
      color_spans.each_with_index do |span_data, index|
        placeholder = "<!--COLOR_SPAN_#{index}-->"
        
        # Processa o conteúdo interno como markdown
        inner_renderer = Redcarpet::Render::HTML.new(
          filter_html: false,
          hard_wrap: true,
          no_styles: false
        )
        
        inner_parser = Redcarpet::Markdown.new(
          inner_renderer,
          autolink: true,
          tables: true,
          fenced_code_blocks: true,
          strikethrough: true,
          superscript: true,
          underline: true,
          highlight: true,
          no_intra_emphasis: false,
          space_after_headers: true,
          lax_spacing: true,
          lax_html_blocks: true
        )
        
        processed_inner = inner_parser.render(span_data[:content])
        
        # Se o conteúdo processado contém elementos block (headings, paragraphs, etc),
        # aplica a cor diretamente nesses elementos ao invés de usar span
        if processed_inner =~ /<[hH][1-6]|<[pP]|<[dD][iI][vV]|<[uU][lL]|<[oO][lL]|<[bB][lL]/
          # Aplica a cor diretamente nos elementos block
          # Lida com tags sem atributos: <h3> -> <h3 style="...">
          processed_inner = processed_inner.gsub(/<([hH][1-6])\s*>/, "<\\1 style=\"#{span_data[:style_type]}: #{span_data[:color]}\">")
          processed_inner = processed_inner.gsub(/<([hH][1-6])(?![^>]*style)/, "<\\1 style=\"#{span_data[:style_type]}: #{span_data[:color]}\"")
          processed_inner = processed_inner.gsub(/<([pP])(?![^>]*style)([^>]*)>/, "<\\1\\2 style=\"#{span_data[:style_type]}: #{span_data[:color]}\">")
          restored_content = processed_inner
        else
          # Para conteúdo inline, usa span
          restored_content = "<span style=\"#{span_data[:style_type]}: #{span_data[:color]}\">#{processed_inner}</span>"
        end
        
        rendered_html = rendered_html.gsub(placeholder, restored_content)
      end
      
      rendered_html.html_safe
    rescue => e
      Rails.logger.error "Erro ao processar markdown: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      content_string.html_safe
    end
  end
end
