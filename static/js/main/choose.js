/**
 * Created by aditya on 21/01/15.
 */

var chooseApp = angular.module('chooseApp', []);

chooseApp.controller('chooseController', function($scope){

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

});


