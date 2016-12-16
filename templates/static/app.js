//Initialize an Angularjs Application
var app =angular.module('myApp', ['ui.router','ngResource', 'myApp.controllers', 'myApp.services', 'toaster']);
 
// Create a Route Resource Object using the resource service
angular.module('myApp.services', []).factory('Route', function($resource) {
  return $resource('api/v1/routes/:id.json', { id:'@routes.id' }, {
    update: {
      method: 'PATCH',
    }
    }, {
    stripTrailingSlashes: false
    });
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
        template: '<ui-view/>'
    })
  .state('routes.list', {
    url: 'list',
    templateUrl: 'list.html',
    controller: 'RouteListController',      
 
 
  })
});
 
// Define CRUD controllers to make the add, update and delete calls using the Route resource we defined earlier
angular.module('myApp.controllers', []).controller('RouteListController', function($scope, Route, $state, toaster) {
        Route.get(function(data) {// Get all the routes. Issues a GET to /api/v1/routes.json
                                        
                     $scope.routes = [];
                     angular.forEach(data.data, function(value, key)
                                                        {
                                                       this.route = value.attributes;
                                                       this.route['id'] = value.id;
                                                       this.push(this.route);
                                                        },   $scope.route);                
                   
                               },
                function(error){
 
                     toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: error,
                            showCloseButton: true,
                            timeout: 0
                            });
                                              });

 
 
  })