var copybook = require('../src/copybook');
var assert = require('assert');

describe('copybook', function() {

  var mockFile = 'teste\r\nteste\r\nteste';

  context('when converting copybook into an array of lines', function() {
    it('should return 3 as array lenght for a text of 3 line breaks', function() {
      assert.equal(copybook.toArray(mockFile).length, 3)
    });
  });
});