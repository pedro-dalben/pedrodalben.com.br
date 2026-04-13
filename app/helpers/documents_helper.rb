module DocumentsHelper
  def render_markdown(markdown)
    return "" if markdown.blank?

    Kramdown::Document.new(markdown, input: "GFM", auto_ids: true).to_html
  end
end
