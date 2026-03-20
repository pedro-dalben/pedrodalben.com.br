require "kramdown"

class TableOfContentsGenerator
  def self.generate(markdown_content)
    return "" if markdown_content.blank?

    document = Kramdown::Document.new(
      markdown_content,
      input: "GFM",
      auto_ids: true,
      toc_levels: "1..6"
    )
    toc_html = document.to_toc

    return "<p>No headings found</p>" if toc_html.blank?

    "<div class='table-of-contents'>#{toc_html}</div>"
  end
end
