(function() {
  'use strict';

  angular
    .module('ICA')

    //ensures no-overflow "get next index" kind of thing, simply returns first item after last item etc
    .factory('GetValidRevolvingIndex', [function () {
      return function (amount, currentIndex, itemSet) {
        return amount > 0
          ? currentIndex + amount < itemSet.length && amount + currentIndex || 0
          : currentIndex + amount < 0 && itemSet.length - 1 || currentIndex + amount;
      }
    }]);
}());
