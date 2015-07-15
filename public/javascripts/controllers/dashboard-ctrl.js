/**
 * Created by matjames007 on 5/20/15.
 */

angular.module('jasmic.controllers')
    .controller('DashboardCtrl', ['$scope','$location','$routeParams', 'CurrentDemandsFactory',
        'OpenTransactionsFactory', 'TransactionsFactory','CallLogFactory', 'CallsListingFactory',
        function ($scope, $location, $routeParams, CurrentDemandsFactory, OpenTransactionsFactory,
        TransactionsFactory, CallLogFactory, CallsListingFactory) {

            CallLogFactory.create({name: "Test"}, function(data){
                console.log('Works');
            }, function(err){
                console.log(fail);
            });

            CallsListingFactory.query({id: "1234"}, function(calls){
                console.log('Works');
            }, function(error){
                console.log('Error');
            });
            /**
             * looks up current demands
             */
            CurrentDemandsFactory.query( function(demands) {
                    $scope.demands = demands;
                },
                function(error) {
                    $scope.demands = [];
                });

            /**
             * Looks up all opened transactions
             */
            OpenTransactionsFactory.query(function (o_trans) {
                $scope.open_transactions = o_trans;
            },
            function(err) {
                $scope.open_transactions = [];
            });


            /**
             * States of the drop down - false = closed
             * @type {{demand: boolean, calls: boolean, transactions: boolean}}
             */
            $scope.states = {
                demand: false,
                calls: false,
                transactions: false
            };

            /**
             * sets the states of the drop down menus
             * @param item
             */
            $scope.setSelected = function(item) {
                var temp = $scope.states[item];
                for(i in $scope.states) {
                    $scope.states[i] = false;
                }
                $scope.states[item] = temp;
                $scope.states[item] = !$scope.states[item];
            }
        }
    ]);