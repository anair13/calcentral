class TemplatesController < ApplicationController

  def get_template
  	render layout: false, :file => Rails.root.join('app', 'views', 'templates', '_' + params[:partial] + '.html.erb').to_s

  end
end
