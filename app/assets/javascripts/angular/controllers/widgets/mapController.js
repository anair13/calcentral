(function(angular) {
  'use strict';

  /**
   * Textbook controller
   */
  angular.module('calcentral.controllers').controller('MapController', function($http, $scope) {
    $scope.floor = 1;
    $scope.$watch('$parent.nextClass', function(newValue, oldValue) {
      console.log(newValue);
    });

    $scope.$watch('selectedFeature', function(newValue, oldValue) {
      console.log('selected', newValue);
    });

  });

})(window.angular);
