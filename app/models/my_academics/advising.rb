class MyAcademics::Advising

  include MyAcademics::AcademicsModule
  include DatedFeed

  def merge(data)
    history = MyLsAdvising.new(@uid, original_uid: @original_uid).get_feed
    data[:appointments] = history["appointments"]
  end
end
