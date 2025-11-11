class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.string :title, null: false
      t.text :description
      t.string :url
      t.string :github_url
      t.string :image_url
      t.boolean :featured, default: false
      t.boolean :published, default: false
      t.string :project_type

      t.timestamps
    end

    add_index :projects, :published
    add_index :projects, :featured
    add_index :projects, :project_type
  end
end
