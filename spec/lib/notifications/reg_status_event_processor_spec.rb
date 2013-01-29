require "spec_helper"

describe RegStatusEventProcessor do

  before do
    @processor = RegStatusEventProcessor.new
  end

  it "should not handle an event type it doesn't know how to handle" do
    event = JSON.parse('{"id":"42341_1","system":"Bearfacts Testing System","code":"UnknownType","payload":{"uid":300846}}')
    timestamp = Time.now.to_datetime
    @processor.process(event, timestamp).should == false
  end

  it "should handle an event given to it and save a notification with corresponding data" do
    event = JSON.parse('{"id":"42341_1","system":"Bearfacts Testing System","code":"RegStatus","payload":{"uid":300846}}')
    timestamp = Time.now.to_datetime
    CampusData.stub(:get_reg_status, "300846").and_return({
        "ldap_uid" => "300846",
        "reg_status_cd" => "C",
        "on_probation_flag" => "N"
    })
    @processor.process(event, timestamp).should == true

    saved_notification = Notification.where(:uid => "300846").first
    saved_notification.should_not be_nil
    saved_notification.data.should_not be_nil
    saved_notification.translator.should == "RegStatusTranslator"
    Rails.logger.info "Saved notification's json is #{saved_notification.data}"
    translator_instance = saved_notification.translator.constantize.new
    translator_instance.should_not be_nil
    Rails.logger.info "Translated notification: #{translator_instance.translate saved_notification}"

  end

  it "should skip an event and do nothing if the reg_status can't be found" do
    event = JSON.parse('{"id":"42341_1","system":"Bearfacts Testing System","code":"RegStatus","payload":{"uid":300846}}')
    timestamp = Time.now.to_datetime
    CampusData.stub(:get_reg_status, "300846").and_return(nil)
    @processor.process(event, timestamp).should == false
  end

end