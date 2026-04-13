class ContactController < ApplicationController
  def create
    # Simples implementação - em produção, você enviaria email ou salvaria no banco
    name = params[:name]
    email = params[:email]
    message = params[:message]

    # Aqui você pode integrar com ActionMailer ou outros serviços
    # Por enquanto, apenas redireciona com sucesso
    redirect_to root_path(anchor: 'contato'), notice: 'Mensagem enviada com sucesso! Entrarei em contato em breve.'
  end
end
