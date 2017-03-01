'use strict';
angular.module('rmsSystem').directive('userInfo', function (Upload, $cookieStore, Config) {
	return {
		restrict: 'AE',
		scope: {
			user: '=',
			allowChange: '='
		},
		templateUrl: 'components/directives/user-info/user-info.html',
		link: function (scope) {
			if (scope.allowChange) {
				scope.upload = function (file) {
					Upload.upload({
						url: Config.api + 'user/avatar/' + scope.user.id,
						data: {avatar: file},
						headers: {'X-Auth-Token': $cookieStore.get('localData')['token']}
					}).then(function (resp) {
						scope.user = _.merge(scope.user, resp.data);
					});
				};
			}
		}
	};
});
