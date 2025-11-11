class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.string :slug, null: false
      t.text :content
      t.text :excerpt
      t.datetime :published_at
      t.boolean :published, default: false
      t.string :featured_image_url
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :posts, :slug, unique: true
    add_index :posts, :published
    add_index :posts, :published_at
  end
end
