(function() {
  'use strict';

  function loadTwitter(w) {
    w.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = w.twttr || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };

      return t;
    }(document, "script", "twitter-wjs"));
  }

  angular
    .module('ICA')
    .directive('twitterFeed', ['$http','$timeout','$sce','$q','$window', function($http,$timeout,$sce,$q,$window) {
      return {
        scope: {
          tweetIds: '=', //array of tweet ids
          messagingInterface: '&' //optional messaging interface to call instead of window.parent (parent of iframe this component is in)
        },
        link: function(scope,element) {
          scope.tweetHtmls = [];

          scope.state = (function(state) {
            state.options = {loading: 0, rendering: 1, failed: 10, ready: 20};
            state.current = state.options.loading;

            return state;
          }({}));

          //watch current state and post updates
          scope.$watch('state.current', function (newValue) {
            postStateChange(keyByValue(scope.state.options,newValue));
          });

          //post tweetId on click
          scope.tweetClicked = function(tweetId) {
            postClickEvent(tweetId);
          }

          //make sure twitter is loaded
          loadTwitter($window);

          //if twitter is present and we have the ids, try to get embedded tweets and render
          if($window.twttr && scope.tweetIds) {

            //create a promise which is resolved when twitter has readied itself
            var twitterReady = $q.defer();

            $window.twttr.ready(function(twttr) {
              twitterReady.resolve(twttr);
            });

            $q.all(scope.tweetIds.map(function(tweetId) {
              return $http.jsonp(
                'https://publish.twitter.com/oembed?url='
                + encodeURIComponent('https://twitter.com/anyuser/status/' + tweetId)
                + '&omit_script=true'
                + '&callback=JSON_CALLBACK'
              ).catch(function() {
                return null;
              });
            })).then(function(embeddedTweets) {

              embeddedTweets.forEach(function(embeddedTweet) {
                embeddedTweet && scope.tweetHtmls.push($sce.trustAsHtml(embeddedTweet.data.html));
              });

              scope.state.current = scope.state.options.rendering;

              //take into account twttr may not be ready yet, so bind events and render only when ready
              twitterReady.promise.then(function(twttr) {

                //hook into twitter rendering event
                twttr.events.bind('rendered', function(event) {
                  $timeout(function () {
                    scope.state.current = scope.state.options.ready;
                  });
                });

                $timeout(function() {
                  twttr.widgets.load(element[0]);
                });
              });
            }).catch(function(err) {
              scope.state.current = scope.state.options.failed;
            })
          } else {
            scope.state = scope.states.failed;
          }

          //private helpers

          function postEvent(eventType,value) {
            (scope.messagingInterface && scope.messagingInterface() || $window.parent.postMessage)({
              eventType: eventType,
              value: value
            },'*');
          }

          function postStateChange(newState) {
            postEvent('state_changed',newState);
          }

          function postClickEvent(tweetId) {
            postEvent('click',tweetId);
          }

          function keyByValue(obj,value) {
            return Object.keys(obj).reduce(function (result,key) {
              return obj[key] == value && key || result;
            },'');
          }
        },
        template: ' <div class="twitter_feed" ng-if="state.current == state.options.rendering || state.current == state.options.ready" ng-class="{\'twitter_feed--visible\': state.current == state.options.ready}">'
        +'            <div class="twitter_feed__tweet" ng-repeat="tweetHtml in tweetHtmls track by $index" ng-click="tweetClicked(tweetIds[$index]); $event.stopPropagation(); $event.preventDefault();">'
        +'              <ng-bind-html ng-bind-html="tweetHtml"/>'
        +'             </div>'
        +'          </div>'
      }
    }]);
}());
