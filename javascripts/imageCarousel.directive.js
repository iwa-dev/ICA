(function() {
  'use strict';

  angular
    .module('ICA')
    .directive('imageCarousel', ['$timeout',function($timeout) {
      return {
        scope: {
          config: '=', //{items = Array,numVisible = uneven Number, allowSwipe = false, transitionDuration = milliseconds}
          selectedIndex: '=' //Number
        },
        transclude: true,
        link: function (scope, element, attrs, ctrl, transclude) {

          scope.currentItems = [];
          scope.itemRange = scope.config.items.length >= scope.config.numVisible
            ? (scope.config.numVisible + 1) / 2
            : 0;

          scope.animation = {
            armed: false,
            active: false,
            reverse: false
          }

          //ACTIONS

          scope.getItemContent = function (customScope, callback) {
            transclude(customScope, callback);
          }

          scope.incSelectedIndex = function (amount) {
            $timeout(function () {
              scope.selectedIndex = getItemByOffset(scope.selectedIndex, amount, scope.config.items.length);
            });
          }

          //WATCHES
          scope.$watch('selectedIndex', function (newValue, oldValue) {
            //note: since this carousel works on css classes, atm it only supports single step scrolling
            //which is also the whole idea of this more optimized solution, so even with 3 visible item scrolling is in steps of one
            newValue != oldValue && scroll(
              oldValue == 0 && newValue == scope.config.items.length - 1 && -1
              || oldValue == scope.config.items.length - 1 && newValue == 0 && 1
              || newValue - oldValue
            );
          });

          //INIT
          initCurrentItems(scope.config.items, scope.selectedIndex, scope.currentItems);

          //PRIVATE

          function initCurrentItems(items, selectedIndex, currentItems) {
            for (var i = -scope.itemRange; i <= scope.itemRange; i++) {
              currentItems.push({
                data: items[getItemByOffset(selectedIndex, i, items.length)],
                index: i
              });
            }
          }

          function updateCurrentItems(items, newIndex, change, currentItems) {
            change > 0
            && currentItems.shift()
            && currentItems.splice(1, 1, {
              data: items[newIndex],
              index: 0
            })
            && currentItems.push({
              data: items[getItemByOffset(newIndex, scope.itemRange, items.length)],
              index: scope.itemRange
            })
            || change < 0
            && currentItems.pop()
            && currentItems.splice(0, 1, {
              data: items[newIndex],
              index: 0
            })
            && currentItems.unshift({
              data: items[getItemByOffset(newIndex, -scope.itemRange, items.length)],
              index: -scope.itemRange
            });

            scope.currentItems.forEach(function (item, index) {
              item.index = index - scope.itemRange;
            });
          }

          function getItemByOffset(selectedIndex, offset, numItems) {
            return (function (itemIndex) {
              return itemIndex < 0
                ? numItems + itemIndex
                : itemIndex >= numItems ? itemIndex - numItems : itemIndex;
            })(selectedIndex + offset);
          }

          function scroll(amount) {
            if (!scope.animation.active && scope.config.items.length > 1) {
              scope.animation.armed = true;
              scope.animation.reverse = amount < 0;

              updateCurrentItems(scope.config.items, scope.selectedIndex, amount, scope.currentItems);

              $timeout(function () {
                scope.animation.armed = false;
                scope.animation.active = true;
              })
                .then(function () {
                  $timeout(function () {
                    scope.animation.active = false;
                  }, 150 + scope.config.transitionDuration);
                });
            }
          }
        },
        template: '' +
        '<div class="image_carousel__frame">' +
        '   <div class="image_carousel__album" ng-swipe-left="config.allowSwipe && incSelectedIndex(1); $event.stopPropagation();" ng-swipe-right="config.allowSwipe && incSelectedIndex(-1); $event.stopPropagation();"' +
        '       ng-class="{\'image_carousel__album--offset_forward\': animation.armed && !animation.reverse, \'image_carousel__album--offset_backward\': animation.armed && animation.reverse, \'image_carousel__album--scroll_forward\': animation.active && !animation.reverse, \'image_carousel__album--scroll_backward\': animation.active && animation.reverse}">' +
        '       <div class="image_carousel__item" ' +
        '           ng-repeat="item in currentItems" ' +
        '           ng-class="{\'image_carousel__item--selected\': item.index == 0 && !animation.armed || item.index == -1 && animation.armed && !animation.reverse || item.index == 1 && animation.armed && animation.reverse, \'image_carousel__item--scroll\': animation.active}" ' +
        '       >' +
        '           <image-carousel-item class="image_carousel__item_content" get-content="getItemContent" ng-if="animation.armed && animation.reverse || !animation.reverse && animation.active || !animation.armed && animation.active && item.index == 1 || !animation.armed && animation.reverse && !animation.active && item.index == -1 || !animation.armed && item.index == 0 || animation.armed && !animation.reverse && item.index == -1"></image-carousel-item>' +
        '       <div>' +
        '   </div>' +
        '</div>'
      }
    }])
    .directive("imageCarouselItem",[function() {
      return {
        scope: {
          getContent: "="
        },
        link: function(scope,element) {
          scope.getContent && scope.getContent(scope.$parent,function(content) {
            element.html(content);
          });
        }
      }
    }]);
})();
