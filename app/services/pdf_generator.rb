require "prawn"
require "prawn/table"
require "kramdown"

class PdfGenerator
  Rails.logger.info "DEBUG: PdfGenerator loaded at #{Time.current}"
  HEADER_IMAGE_PATH = Rails.root.join("app", "assets", "images", "header.png")

  FOOTER_INFO = {
    name: "Pedro Henrique Dalben de Morais",
    cnpj: "58.148.688/0001-31",
    email: "pedrodalbenmorais@gmail.com",
    phone: "+55 19 99978-2571",
    location: "Ubatuba, São Paulo"
  }.freeze

  def self.generate(document)
    generator = new(document)
    generator.create_pdf
  end

  def initialize(document)
    @document = document
    @title = document.title
    @content = document.content
    @output_path = Rails.root.join("tmp", "#{document.slug}_#{Time.current.to_i}.pdf")
  end

  def create_pdf
    # Top margin 150 to accommodate header
    # Bottom margin 110 to accommodate footer
    pdf = Prawn::Document.new(
      page_size: "A4",
      margin: [ 150, 50, 110, 50 ]
    )
    setup_document(pdf)

    pdf.font("DejaVuSans") do
      add_content(pdf)
    end

    # Post-process all pages to add header and footer
    pdf.page_count.times do |i|
      pdf.go_to_page(i + 1)
      pdf.font("DejaVuSans") do
        draw_header(pdf)
        draw_footer(pdf)
      end
    end

    pdf.render_file(@output_path)
    @output_path
  end

  private

  def setup_document(pdf)
    pdf.font_families.update("DejaVuSans" => {
      normal: Rails.root.join("app/assets/fonts/DejaVuSans.ttf"),
      bold: Rails.root.join("app/assets/fonts/DejaVuSans-Bold.ttf"),
      italic: Rails.root.join("app/assets/fonts/DejaVuSans-Oblique.ttf"),
      bold_italic: Rails.root.join("app/assets/fonts/DejaVuSans-BoldOblique.ttf")
    })
    pdf.font_size 11 # Slightly smaller default font
    pdf.line_width 0.5
  end

  def draw_header(pdf)
    # Position header in the top margin area
    # pdf.bounds.top is the top of the content area
    header_top = pdf.bounds.top + 130

    if File.exist?(HEADER_IMAGE_PATH)
      # Scale the image to fit a 100pt height box in the margin
      pdf.image HEADER_IMAGE_PATH,
                at: [ 0, header_top ],
                width: pdf.bounds.width,
                height: 110,
                fit: [ pdf.bounds.width, 110 ],
                position: :center
    else
      pdf.text_box "Document Header",
                   at: [ 0, header_top ],
                   width: pdf.bounds.width,
                   height: 70,
                   size: 16,
                   style: :bold,
                   align: :center,
                   valign: :center
    end
  end

  def add_content(pdf)
    # Title
    pdf.text @title, size: 22, style: :bold, align: :center
    pdf.move_down 30

    html_content = convert_markdown_to_html
    add_formatted_content(pdf, html_content)
  end

  def convert_markdown_to_html
    Kramdown::Document.new(@content, input: "GFM", auto_ids: true).to_html
  end

  def add_formatted_content(pdf, html)
    list_type = nil
    list_index = 0

    html.split("\n").each do |line|
      next if line.strip.empty?

      if line.include?("<ul>")
        list_type = "ul"
        list_index = 0
        next
      elsif line.include?("<ol>")
        list_type = "ol"
        list_index = 0
        next
      elsif line.include?("</ul>") || line.include?("</ol>")
        list_type = nil
        list_index = 0
        next
      elsif line.include?("<h1>")
        pdf.move_down 15
        pdf.text extract_text_from_tag(line, "h1"), size: 18, style: :bold
        pdf.move_down 10
      elsif line.include?("<h2>")
        pdf.move_down 12
        pdf.text extract_text_from_tag(line, "h2"), size: 16, style: :bold
        pdf.move_down 8
      elsif line.include?("<h3>")
        pdf.move_down 10
        pdf.text extract_text_from_tag(line, "h3"), size: 14, style: :bold
        pdf.move_down 6
      elsif line.include?("<p>")
        text = extract_text_from_tag(line, "p")
        next if text.empty?
        pdf.text text, size: 11, align: :justify
        pdf.move_down 10
      elsif line.include?("<blockquote>")
        pdf.text extract_text_from_tag(line, "blockquote"), size: 11, style: :italic
        pdf.move_down 10
      elsif line.include?("<code>")
        pdf.text extract_text_from_tag(line, "code"), size: 10, font: "Courier"
        pdf.move_down 10
      elsif line.include?("<li>")
        list_index += 1
        add_list_item(pdf, line, list_type, list_index)
      elsif line.include?("<table>")
        add_table(pdf, line)
      end
    end
  end

  def extract_text_from_tag(line, tag)
    # Basic HTML tag extraction, could be improved with a proper parser if needed
    line.gsub(/<#{tag}[^>]*>/, "").gsub(/<\/#{tag}>/, "").strip
  end

  def add_list_item(pdf, line, list_type, list_index)
    if line.include?("<li>")
      text = extract_text_from_tag(line, "li")
      bullet = list_type == "ol" ? "#{list_index}." : "•"
      pdf.indent 20 do
        pdf.text "#{bullet} #{text}", size: 11
      end
      pdf.move_down 5
    end
  end

  def add_table(pdf, line)
    if line.include?("<tr>")
      cells = line.scan(/<td[^>]*>(.*?)<\/td>/).flatten.map(&:strip)
      unless cells.empty?
        pdf.table([ cells ],
          cell_style: {
            size: 10,
            borders: [ :top, :bottom, :left, :right ],
            padding: 5
          },
          width: pdf.bounds.width
        )
        pdf.move_down 10
      end
    end
  end

  def draw_footer(pdf)
    # Drawing in the bottom margin area (bounds.bottom is 0)
    footer_bottom = pdf.bounds.bottom

    pdf.stroke_color "AAAAAA"
    pdf.stroke do
      pdf.horizontal_line 0, pdf.bounds.width, at: footer_bottom - 10
    end

    footer_text = [
      FOOTER_INFO[:name],
      "CNPJ: #{FOOTER_INFO[:cnpj]}  |  #{FOOTER_INFO[:email]}",
      "#{FOOTER_INFO[:phone]}  |  #{FOOTER_INFO[:location]}"
    ].join("\n")

    pdf.text_box footer_text,
                 at: [ 0, footer_bottom - 20 ],
                 width: pdf.bounds.width,
                 height: 60,
                 align: :center,
                 size: 9,
                 leading: 3,
                 color: "666666"

    # Page number at the very bottom
    pdf.text_box "Página #{pdf.page_number} de #{pdf.page_count}",
                 at: [ 0, footer_bottom - 90 ],
                 width: pdf.bounds.width,
                 size: 8,
                 align: :center,
                 color: "888888"
  end
end
