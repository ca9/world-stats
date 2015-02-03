/**
 * Created by aditya on 21/01/15.
 */

var chooseApp = angular.module('chooseApp', []);

chooseApp.factory('categories_factory', function($http, $q) {
    var factory = {};

    factory.categories = {};

    // Gets invoked as the factory is constructed.
    factory.getCategories = function() {

        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        if (!isEmpty(factory.categories)) {
            // Sends a resolved object.
            deferred_promise.resolve(factory.categories);
        } else {
            $http.get('/static/data/categories.json').
                success(function(response) {
                    console.log(response);
                    factory.categories = response;
                    // Will be resolved later.
                    deferred_promise.resolve(response);
            })
        }

        return deferred_promise.promise;
    }

    return factory;
});

chooseApp.controller('chooseController', function($scope, categories_factory) {

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

//    setInterval(function() {console.log($scope.categories)}, 100);
    categories_factory.getCategories().then(function(response) {
        $scope.categories = response;
    });

    // Update the data objects.
    $scope.updateInds = function (numInds) {
        console.log(numInds);
    }

});



// Helpers
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
