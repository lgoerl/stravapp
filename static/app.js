// Initialize AngularJS app and inject dependencies
var app = angular.module('myApp',['ui.router', 'ngResource', 'myApp.Services', 'myApp.Controllers', 'ui.grid', 'toaster', 'ngAria', 'ngAnimate', 'ngMaterial']);

// Create a Resource Object using the resource service to call the API
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
    $scope.reset = function(){
      angular.copy($scope.appForm.cleared, $scope.appForm.data);
    },
    $scope.clear_addresses = function(){
      $scope.appForm.data.start_loc = null;
      $scope.appForm.data.end_loc = null;
    },
    $scope.appForm = {
      cleared: {dist_max:null,
             dist_min:null,
             elev_max:null,
             elev_min:null,
             route_type:null,
             route_subtype:null,
             loop:null,
             start_loc:null,
             end_loc:null
      },
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
        }      
        endpoint = $httpParamSerializerJQLike(nonz);
        $state.go('routes.query',{end:endpoint}, {reload:'routes.query'});
      },
      selection: {
        base_type: [{id:1, value:'Cycling'},{id:2, value:'Running'}],
        base_subtype: [{id:1, value:'Road'},{id:2, value:'Mountain'},{id:3, value:'Cyclocross'},{id:4, value:'Trail Run'}]
      }
    };
  }
])
.controller('fetchController',['$scope','$stateParams', 'queryFactory', 'toaster',
  function($scope,$stateParams, queryFactory, toaster){
    // get query parameters and set options for ui-grid
    $scope.params = $stateParams;
    $scope.gridOptions = {
      enableSorting:true,
      columnDefs:[
        {name: 'id', visible:false},
        {name: 'Name', enableSorting:false, cellTemplate:'<a href="https://strava.com/routes/{{row.entity.id}}" target="_blank">{{COL_FIELD}}</a>'},
        {name: 'Length', enableSorting:true},
        {name: 'Elevation', enableSorting:true},
        {name: 'Type', enableSorting:false, cellTemplate:'<div>{{COL_FIELD == 1 ? "Cycling" : "Running"}}</div>'},
        {name: 'Subtype', enableSorting:false, cellTemplate:'<div>{{COL_FIELD == 1 ? "Road" : (COL_FIELD == 2 ? "Mountain" : (COL_FIELD == 3 ? "Cyclocross" : "Trail Run"))}}</div>'}
        ],
        data:[]
    };
    // call the API with factory resource, parse errors and format data
    queryFactory.get({endpoint:$stateParams.end},
    function(data){
      $scope.routes = [];
      // if query encountered an error finding the location or with search terms from dynamic endpoint query
      if (data.links.error){
        console.log(data.error)
        toaster.pop({
          type:'error',
          title:'Error '+data.status_code,
          body:data.error,
          timeout:3000
        });
      }
      else {
        // if query  failed to find any matching routes
        if (data.data.length == 0) {
          toaster.pop({
            type:'warning',
            title:'Error 204',
            body:'The specified search returned no results. Try a different search.',
            timeout:3000
          });
        }
        // if query successfully found routes
        else {
          angular.forEach(data.data, function(object){
            this.route = {};
            this.route.id = object.id;
            this.route.Name = object.attributes.name;
            this.route.Length = object.attributes.length_in_meters;
            this.route.Elevation = object.attributes.elevation_gain_in_meters;
            this.route.Type = object.attributes.route_type;
            this.route.Subtype = object.attributes.sub_type;
            this.push(this.route);
          }, 
          $scope.gridOptions.data);
        }
      }
    });
  }
]);