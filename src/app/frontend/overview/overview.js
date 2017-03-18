'use strict';

angular.module('rmsSystem').config(function($stateProvider) {
    $stateProvider.state('overview', {
        url: '/overview',
        templateUrl: 'app/frontend/overview/overview.html',
        controller: 'OverviewCtrl',
        authenticate: true
    });
});