(function(angular, calcentral) {
  'use strict';

  /**
   * Meal points controller
   */

  calcentral.controller('MealPointsCtrl', [
    '$http', '$routeParams', '$scope', 'apiService', function($http, $routeParams, $scope, apiService) {

    $scope.money = 56.32

	$scope.submit = function() {
		$scope.money += 10;
	}    
  }])
})(window.angular, window.calcentral);