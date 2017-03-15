// Initialize AngularJS app and inject dependencies
var app = angular.module('myApp',['ui.router', 'ngResource', 'myApp.Services', 'myApp.Controllers', 'ui.grid', 'toaster']);

// Create a Route Resource Object using the resource service
angular.module('myApp.Services', ['ngResource']).factory('queryFactory', function($resource) {
  return $resource('api/v2/routes/:endpoint.json', 
    { endpoint:'@endpoint' }, 
    { 'query': {method: 'GET', isArray:true }},
    { update: {method: 'PATCH' }}, 
    { stripTrailingSlashes: false }
    );
}).factory('RouteFactory', function($resource) {
  return $resource('api/v2/routes/:id.json', 
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
      url: '/',
      templateUrl: '/static/partials/form.html',
      controller: 'formController'
    })
    .state('routes.query', {
      url: 'query',
      templateUrl: '../static/partials/list2.html',
      controller: 'fetchController',
      params: {end:null}
    })
    .state('routes.list', {
      url: 'list',
      templateUrl: '../static/partials/list2.html',
      controller: 'listController'
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
             route_subtype:null,
             loop:null,
             start_loc:null,
             end_loc:null
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
        $state.go('routes.query',{end:endpoint}, {reload:'routes.query'});
    }
  };
}])
.controller('fetchController',['$scope','$stateParams', 'queryFactory',
  function($scope,$stateParams, queryFactory){
    $scope.params = $stateParams;
    $scope.gridOptions = {
      enableSorting:true,
      columnDefs:[
        {name: 'id', visible:false},
        {name: 'Name', enableSorting:false, cellTemplate:'<a href="https://strava.com/routes/{{row.entity.id}}">{{COL_FIELD}}</a>'},
        {name: 'Length', enableSorting:true},
        {name: 'Elevation', enableSorting:true},
        {name: 'Type', enableSorting:false, cellTemplate:'<div>{{COL_FIELD == 1 ? "Cycling" : "Running"}}</div>'}
        ],
        data:[]
    };
    queryFactory.get({endpoint:$stateParams.end},
    function(data){
      $scope.routes = [];
      angular.forEach(data.data, function(object){
        this.route = {};
        this.route.id = object.id;
        this.route.Name = object.attributes.name;
        this.route.Length = object.attributes.length_in_meters;
        this.route.Elevation = object.attributes.elevation_gain_in_meters;
        this.route.Type = object.attributes.route_type;
        this.push(this.route);
      }, $scope.gridOptions.data);
    });
  }
]).controller('listController', function($scope, RouteFactory) {
  RouteFactory.get(function(data){
    //$scope.routes = data.data;
    $scope.routes = [];
    angular.forEach(data.data, function(object){
      this.route = {};
      this.route['id'] = object.id;
      this.route['Name'] = object.attributes.name;
      this.route['Length'] = object.attributes.length_in_meters;
      this.route['Popularity'] = object.attributes.popularity;
      console.log(this.route)
      this.push(this.route);
    }, $scope.routes);
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
});