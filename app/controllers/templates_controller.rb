class TemplatesController < ApplicationController

  def get_template

  	#path = Rails.root.join('app', 'views', 'templates', '_' + params[:partial] + '.*')
  	#file = File.open(Dir.glob(path).first).read()
  	#render :inline => file
  	#render template: "templates/" + params[:partial]
  	#render :file => Rails.root.join('app', 'views', 'templates', params[:partial]).to_s
  	# bump
  	puts layout: false, :file => Rails.root.join('app', 'views', 'templates', '_' + params[:partial] + '.html.erb').to_s
  	render layout: false, :file => Rails.root.join('app', 'views', 'templates', '_' + params[:partial] + '.html.erb').to_s

  end
end
