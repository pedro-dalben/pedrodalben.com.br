class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :posts, dependent: :destroy
  has_many :documents, dependent: :destroy

  validates :name, presence: true
  validates :role, presence: true, inclusion: { in: %w[admin user] }

  def admin?
    role == "admin"
  end
end
