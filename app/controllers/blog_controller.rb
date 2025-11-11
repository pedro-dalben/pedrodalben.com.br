class BlogController < ApplicationController
  def index
    @posts = Post.published.limit(10)
  end

  def show
    @post = Post.published.find_by!(slug: params[:slug])
  end
end
