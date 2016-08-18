(function() {
  'use strict';

  angular
    .module('ICA')

    .service('MetaDataService', [function () {
      var self = {};

      self.data = {};

      self.stored = {};

      self.updateMetaData = function(metadata) {
        self.data = formatData(metadata);
      };

      // Called on premise/property modal close
      self.restoreMetaData = function() {
        self.data = self.stored;
      }

      self.storeInitialTitle = function(title) {
        self.stored.title = title;
      }

      self.storeInitialContent = function(key, content) {
        self.stored[key] = content;
      }

      // Private helpers
      var truncateText = function(text, limit) {
        var truncated = text.substring(0, limit);

        if(text.length > limit) {
          truncated += "...";
        }

        return truncated;
      };

      var formatData = function(data) {
        // Strip possible html tags from meta data values
        var stripped = {};
        angular.forEach(data, function(value, key) {
          this[key] = value ? String(value).replace(/<[^>]+>/gm, '') : '';
        }, stripped);

        // Meta description should be truncated if it's over 150 chars long
        if(stripped.description && stripped.description.length > 150) {
          stripped.description = truncateText(stripped.description, 150);
        }

        return stripped;
      }

      return self;
    }]);
}());