class MyLsAdvising < MyMergedModel

  def get_feed_internal
    feed = {}
    proxy = LSAdvisingProxy.new({user_id: @uid})
    proxy_response = proxy.get
    if proxy_response && body = proxy_response.body
      feed.merge!(JSON.parse(body))
    end
    feed
  end

end
