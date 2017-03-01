'use strict';

angular.module('rmsSystem', [
    'ngCookies',
    'ngSanitize',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'angular-growl',
    'ngFileUpload',
    'angular-loading-bar',
    'mwl.confirm',
    'datatables',
    'ncy-angular-breadcrumb',
    'ui.select',
    'chart.js',
    'ui.select',
    'ui.grid',
    'ui.grid.cellNav',
    'ui.grid.edit',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    'ui.grid.pinning',
    'ui.grid.selection',
    'ui.grid.moveColumns',
    'ui.grid.exporter',
    'ui.grid.importer',
    'ui.grid.grouping',
    'ui.grid.autoResize',
    'moment-picker',
    'datatables.buttons',
    'datatables.bootstrap'//,
    //'datatables.scroller'

]).config(function ($urlRouterProvider, $locationProvider, $httpProvider, growlProvider, cfpLoadingBarProvider) {
    $urlRouterProvider.otherwise('/statistics');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    growlProvider.globalTimeToLive(2000);
    growlProvider.globalDisableCountDown(true);
    growlProvider.globalDisableIcons(true);
    growlProvider.globalPosition('bottom-right');

    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = true;
}).factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
        // Add authorization token to headers
        request: function (config) {
            config.headers = config.headers || {};
            if ($cookieStore.get('localData') && $cookieStore.get('localData')['token']) {
                config.headers['X-Auth-Token'] = $cookieStore.get('localData')['token'];
            }
            return config;
        },
        // Intercept 401s and redirect you to login
        responseError: function (response) {
            if (response.status === 401) {
                //$cookieStore.remove('localData');
                if (/^\/admin(.)*/.test($location.$$path)) {
                    $location.path('/admin/login');
                } else {
                    $location.path('/auth/login');
                }
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
}).run(function ($rootScope, $location, Auth, $cookieStore) {
    //cfpLoadingBar.start();
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
        $rootScope.adminLogin = (next.name === 'admin.login' || next.name === 'admin') ? true : false;
        $rootScope.adminSide = (/^admin\.(.)+/).test(next.name);
        if (next.authenticate) {
            Auth.isLoggedInAsync(function (loggedIn) {
                var authenticated = true;
                if (!loggedIn || (loggedIn && !loggedIn.roles)) {
                    authenticated = false;
                } else {
                    var validRole = false;
                    var roles = _.map(loggedIn.roles, 'roleName');
                    if (next.roles) {
                        for (var i = 0; i < roles.length; i++) {
                            var r = roles[i].toLowerCase();
                            if (next.roles.indexOf(r) !== -1) {
                                validRole = true;
                            }
                        }
                    } else {
                        validRole = true;
                    }
                    authenticated = validRole;
                }
                if (!authenticated) {
                    if ($cookieStore.get('localData') && $cookieStore.get('localData')['userId']) {
                        Auth.logout($cookieStore.get('localData')['userId']);
                    }
                    if ($rootScope.adminSide) {
                        return $location.path('/admin/login');
                    } else {
                        return $location.path('/auth/login');
                    }
                }
            });
        }
    });
});