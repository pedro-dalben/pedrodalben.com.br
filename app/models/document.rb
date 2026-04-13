class Document < ApplicationRecord
  belongs_to :user

  validates :title, presence: true, length: { maximum: 255 }
  validates :content, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug

  has_one_attached :pdf

  scope :published, -> { where(published: true) }
  scope :by_user, ->(user) { where(user: user) }

  def generate_slug
    self.slug = title.to_s.parameterize if slug.blank? && title.present?
  end

  def to_param
    slug
  end

  def generate_table_of_contents!
    update(table_of_contents: TableOfContentsGenerator.generate(content))
  end

  def generate_pdf!
    pdf.purge if pdf.attached?
    pdf_path = PdfGenerator.generate(self)
    attach_file_from_path(pdf_path)
  end

  private

  def attach_file_from_path(path)
    file = File.open(path)
    pdf.attach(io: file, filename: "#{slug}.pdf", content_type: "application/pdf")
    file.close
    File.delete(path) if File.exist?(path)
  end
end
