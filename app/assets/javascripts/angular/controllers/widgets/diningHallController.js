(function(angular, calcentral) {
  'use strict';

  /**
   * Dining controller
   */

  calcentral.controller('DiningHallCtrl', [
    '$http', '$routeParams', '$scope', 'apiService', function($http, $routeParams, $scope, apiService) {

   	$scope.option = "false";

	$scope.getHalls = function() {
		var url = '/dummy/json/dining_halls.json';
		
		$http.get(url).success(function(data) {
			console.log(data)
	        angular.extend($scope, data);
      	});

		$scope.halls
  	}

  	$scope.getHalls();
 }])
})(window.angular, window.calcentral);