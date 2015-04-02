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


chooseApp.factory('indicator_factory', function($http, $q) {
    // we return this object containing a bunch of functions.
    var factory = {};

    factory.indicators = {};

    // Gets invoked as the factory is constructed.
    factory.getCatIndicators = function(i) {
        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        if (factory.indicators.hasOwnProperty(i)) {
            // Sends a resolved object.
            deferred_promise.resolve(factory.indicators[i]);
        } else {
            $http.get('/static/data/indicators/' + i + '.json').
                success(function(response) {
                    console.log(response);
                    factory.indicators[i] = response;
                    // Will be resolved later.
                    deferred_promise.resolve(response);
            })
        }
        console.log(factory.indicators);
        return deferred_promise.promise;
    }

    factory.getLocalCatIndicators = function(i) {
        if (factory.indicators.hasOwnProperty(i))
            return factory.indicators[i];
        return {};
    }

    factory.fetchData = function(ind, from, to, tableContainer) {
        // The promise is merely a wrapper that gives a
        // handle on the value that can be used
        // or referenced as pleased.
        var deferred_promise = $q.defer();

        var getQ = 'indData/' + ind + '/' + from + '/' + to;
        console.log(getQ);
        $http.get(getQ).
                success(function(response) {
                    console.log(response);
                    // Will be resolved later.
                    deferred_promise.resolve(response);
                    var keys = [], vals = [];

                    for (var i = 1; i < 10; i++) {
                        var key = Object.keys(response)[i];
                        keys.push(key);
                        if (response[key] == null)
                            response[key] = "NA";
                        vals.push(response[key]);
                    }
                    tableContainer.innerHTML = "";
                    var table = Handsontable(tableContainer, {
                                data: [keys, vals],
                                startRows: 3,
                                startCols: 3,
                                colHeaders: true
                    })
                    console.log(table);
        })

        return deferred_promise.promise;
    }

    return factory;
});


chooseApp.service('dataService', function () {
    this.dataVariables = {};
});

chooseApp.controller('chooseController', function ($scope, categories_factory, indicator_factory, dataService) {

    //share this item across
    $scope.dataVariables = dataService.dataVariables;

    $scope.range = function(min, max, step) {
        min = parseInt(min);
        max = parseInt(max);
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    // setInterval(function() {console.log($scope.categories)}, 100);
    categories_factory.getCategories().then(function(response) {
        $scope.categories = response;
    });

    // Update the data objects.
    $scope.updateInds = function (numInds) {
        console.log("Number of indicators: ", numInds);
    }


    // get indicators
    $scope.getCatIndicators = indicator_factory.getCatIndicators;
    $scope.getLocalCatIndicators = indicator_factory.getLocalCatIndicators;
    $scope.getData = function(i) {
        var ind = $scope.dataVariables[i]['ind'];
        var from = $scope.dataVariables[i]['from'];
        var to = $scope.dataVariables[i]['to'];
        var tableContainer = document.getElementById('table-' + i);
        tableContainer.innerHTML = '<img src="static/img/loading.gif">';
        $scope.dataVariables[i]['data'] = indicator_factory.fetchData(ind.trim(), from.trim(), to.trim(), tableContainer);
    }

});


// Helpers
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

String.prototype.trim = function()
{
    return String(this).replace(/^\s+|\s+$/g, '');
};