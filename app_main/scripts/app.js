angular.module('MyApp', ['ngResource', 
'ngSanitize', 
'ui.bootstrap',
'ngAnimate',
 'ngRoute', 
 'ngFileUpload', 
 'ngCookies',
 'ui.date']).config(["$routeProvider","$locationProvider","$httpProvider",function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "public/login.html",
		controller:"LoginController"
    }).when("/set_new_password", {
      templateUrl : "public/setNewPassword.html",
       controller:"LoginController"
    })
    .when("/dashboard", {
      templateUrl : "public/dashboard.html",
       controller:"LoginController"
    })
    .when("/companies", {
      templateUrl : "public/companies.html",
       controller:"companyController"
    })
    .when("/locations", {
      templateUrl : "public/locations.html",
       controller:"companyController"
    })
    .when("/users", {
      templateUrl : "public/users.html",
       controller:"userController"
    })
    .when("/customers", {
      templateUrl : "public/customers.html",
       controller:"userController"
    })
    .when("/subscriptions", {
      templateUrl : "public/subscriptions.html",
       controller:"LoginController"
    })
    .when("/parking", {
      templateUrl : "public/parking.html",
       controller:"userController"
    })
    .when("/profile", {
      templateUrl : "public/profile.html",
       controller:"LoginController"
    })
	.otherwise({
		  redirectTo: ''
		});
}]).filter('capitalize', function() {
  return function(input) {
    return (angular.isString(input) && input.length > 0) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : input;
  }
});