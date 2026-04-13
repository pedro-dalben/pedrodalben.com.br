class CreateDocuments < ActiveRecord::Migration[8.0]
  def change
    create_table :documents do |t|
      t.string :title, null: false
      t.text :content, null: false
      t.text :table_of_contents
      t.references :user, null: false, foreign_key: true
      t.string :slug, null: false
      t.boolean :published, default: false

      t.timestamps
    end

    add_index :documents, :slug, unique: true
    add_index :documents, :published
  end
end
