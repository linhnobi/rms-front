//http://www.thoitietviet.com:8080/rms-system-dev/services/meteorology/report/network/muangaydem/11-3-2017/10
//http://www.thoitietviet.com:8080/rms-system-dev/services/meteorology/report/station/all/1050/11-3-2017/1/2
'use strict';
angular.module('rmsSystem').factory('Overview', ['Config', '$http',
    function(Config, $http) {
        var api = Config.api + 'meteorology/report';
        console.log('api', api);
        return {
            getRainDay: function(date, countDay) {
                return $http.get(api + '/network/muangaydem/' + date + '/' + countDay);
            },
            getRainAll: function(station, date, day, minute) {
                return $http.get(api + '/station/all/' + station + '/' + date + '/' + day + '/' + minute);
            }
        };
    }
]);