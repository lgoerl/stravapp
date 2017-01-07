//Initialize an Angularjs Application
var app =angular.module('myApp', ['ui.router','ngResource', 'myApp.controllers', 'myApp.services']);
 



// Create a Route Resource Object using the resource service
angular.module('myApp.services', ['ngResource']).factory('RouteFactory', function($resource) {
  return $resource('api/v1/routes/:id', 
    { id:'@routes.id' }, 
    { update: {method: 'PATCH' }}, 
    { stripTrailingSlashes: false }
    );
});
 



// Create routes with UI-Router and display the appropriate HTML file for listing routes
angular.module('myApp').config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/");
  
    $stateProvider
      .state('routes', {       
        // https://github.com/angular-ui/ui-router/wiki/Nested-States-and-Nested-Views
        abstract: true,
        url: '/',
        title: 'Routes',
        template: '<div ui-view></div>'
    })
      .state('routes.list', {
        url: 'list',
        templateUrl: '../static/partials/list.html',
        controller: 'RouteListController',      
 
 
  })
});
 


// Define CRUD controllers to make the add, update and delete calls using the Route resource we defined earlier
angular.module('myApp.controllers', []).controller('RouteListController', function($scope, RouteFactory) {
    $scope.routes = RouteFactory.query();

//    RouteFactory.query().$promise.then(function(data){
//     $scope.routes = data;
//    });
  $scope.routes = RouteFactory.query().$promise.then(function(data){
      $scope.routes = data;
  },
  function(error){ console.log(error); }); 
});