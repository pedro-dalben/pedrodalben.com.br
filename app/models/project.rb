class Project < ApplicationRecord
  validates :title, presence: true

  scope :published, -> { where(published: true) }
  scope :featured, -> { where(featured: true) }
  scope :personal, -> { where(project_type: 'personal') }
  scope :client, -> { where(project_type: 'client') }
end
