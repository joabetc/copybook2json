var copybook = require('../src/copybook');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var nomeArquivo = (fs.readdirSync('./src/input_file')[0] || '');
var arqEnt = ((fs.readFileSync(path.join('./src/input_file', nomeArquivo), 'utf8')) || '');

describe('copybook', function() {

  context('when converting copybook into an array of lines', function() {
    it('should return 229 as array lenght for a text of 229 line breaks', function() {
      assert.equal(copybook.toArray(arqEnt).length, 229);
    });
  });
});