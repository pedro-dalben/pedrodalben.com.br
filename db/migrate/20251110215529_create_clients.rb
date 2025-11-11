class CreateClients < ActiveRecord::Migration[8.0]
  def change
    create_table :clients do |t|
      t.string :name
      t.string :company_name
      t.string :email
      t.string :phone
      t.string :website_url
      t.string :logo_url
      t.text :notes

      t.timestamps
    end
  end
end
