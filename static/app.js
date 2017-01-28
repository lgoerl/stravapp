//Initialize an Angularjs Application
var app =angular.module('myApp', ['ui.router','ngResource', 'myApp.controllers', 'myApp.services', 'toaster','ui.grid']);
 



// Create a Route Resource Object using the resource service
angular.module('myApp.services', ['ngResource']).factory('RouteFactory', function($resource) {
  return $resource('api/v1/routes/:id.json', 
    { id:'@routes.id' }, 
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
        abstract: true,
        url: '/',
        title: 'Routes',
        template: '<div ui-view></div>'
    })
      .state('routes.list', {
        url: 'list',
        templateUrl: '../static/partials/list2.html',
        controller: 'RouteListController',      
 
 
  })
});
 


// Define CRUD controllers to make the API calls using the RouteFactory resource we defined earlier
angular.module('myApp.controllers', []).controller('RouteListController', function($scope, RouteFactory, toaster) {
  RouteFactory.get(function(data){
    $scope.routes = [];
    angular.forEach(data.data, function(object){
      this.route = {}
      this.route['id'] = object.id;
      this.route['Name'] = object.attributes.name;
      this.route['Length'] = object.attributes.length_in_meters;
      this.route['Popularity'] = object.attributes.popularity;
      this.push(this.route);
    }, $scope.routes);
  },

/*      $scope.routes = data.data},*/

  function(error){
    toaster.pop({
      type: 'error',
      title: 'Error',
      body: error,
      showCloseButton: true,
      timeout: 0
    });
  });
});