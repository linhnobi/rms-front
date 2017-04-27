/*
 *  API
 *  http://115.77.185.197:5050/rms-system-dev/services/meteorology/report/network/muangaydem/20-4-2017/3
 *  http://115.77.185.197:5050/rms-system-dev/services/meteorology/report/station/sum/1032/20-4-2017/10/360
*/
'use strict';
angular.module('rmsSystem').factory('Online', ['Config', '$http',
    function(Config, $http) {
        var api = Config.api + 'meteorology/report';
        return {
            getRainDay: function(date, countDay) {
                return $http.get(api + '/network/muangaydem/' + date + '/' + countDay);
            },
            getRainSum: function(station, date, day, minute) {
                return $http.get(api + '/station/sum/' + station + '/' + date + '/' + day + '/' + minute);
            }
        };
    }
]);