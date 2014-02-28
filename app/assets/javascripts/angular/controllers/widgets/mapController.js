(function(angular) {
  'use strict';

  /**
   * Textbook controller
   */
  angular.module('calcentral.controllers').controller('MapController', function($http, $scope) {

    $scope.$watch('$parent.nextClass', function(newValue, oldValue) {
      console.log(newValue);
    });

  });

})(window.angular);
