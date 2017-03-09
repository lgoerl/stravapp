// Initialize AngularJS app and inject dependencies
var app = angular.module('myApp',['ui.router', 'ngResource', 'myApp.Services', 'myApp.Controllers']);

// Create a Route Resource Object using the resource service
angular.module('myApp.Services', ['ngResource']).factory('queryFactory', function($resource) {
  return $resource('api/v2/routes/:endpoint.json', 
    { endpoint:'@endpoint' }, 
    { 'query': {method: 'GET', isArray:true }},
    { update: {method: 'PATCH' }}, 
    { stripTrailingSlashes: false }
    );
});



// Create routes with UI-Router and display the appropriate HTML file for listing routes
angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");
  
  $stateProvider
    .state('routes', {       
      url: '/',
      templateUrl: '/static/partials/form.html',
      controller: 'formController'
    })
    .state('routes.query', {
      url: 'query',
      templateUrl: '../static/partials/endpoint.html',
      controller: 'fetchController',
      params: {end:null}
    })
});


// Define CRUD controllers to receive user input and to make the API calls using the RouteFactory resource we defined earlier
angular.module('myApp.Controllers',[])
.controller('formController',['$state', '$scope', '$http', '$httpParamSerializerJQLike', 
  function($state,$scope,$http,$httpParamSerializerJQLike){
    $scope.appForm = {
      data: {dist_max:null,
             dist_min:null,
             elev_max:null,
             elev_min:null,
             route_type:null,
             route_subtype:null
      },
      submit: function(){
        nonz = {};
        keys = Object.keys($scope.appForm.data)
        for (var k in Object.keys($scope.appForm.data)){
          if ($scope.appForm.data[keys[k]]){
            nonz[keys[k]]=$scope.appForm.data[keys[k]];}
            $scope.appForm.data[keys[k]]=null
        }      
        endpoint = $httpParamSerializerJQLike(nonz);
        $state.go('routes.query',{end:endpoint});
    }
  };
}])
.controller('fetchController',['$scope','$stateParams', 'queryFactory',
  function($scope,$stateParams, queryFactory){
    $scope.params = $stateParams;
  }
]);