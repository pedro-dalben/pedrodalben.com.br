class Post < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, if: -> { slug.blank? && title.present? }
  before_save :set_published_at, if: -> { published? && published_at.nil? }

  scope :published, -> { where(published: true).order(published_at: :desc) }

  private

  def generate_slug
    self.slug = title.parameterize
  end

  def set_published_at
    self.published_at = Time.current
  end
end
