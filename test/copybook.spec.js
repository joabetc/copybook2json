var copybook = require('../src/copybook');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var nomeArquivo = (fs.readdirSync('./src/input_file')[0] || '');
var arqEnt = ((fs.readFileSync(path.join('./src/input_file', nomeArquivo), 'utf8')) || '');

describe('copybook', function() {

  context('when converting copybook into an array of lines', function() {
    it('should return 229 as array lenght for a text of 229 line breaks', function() {
      assert.equal(copybook._toArray(arqEnt, '\r\n').length, 229);
    });
  });

  context('when converting array back to text', function() {
    it('should return "a.b.c" from an array like ["a","b","c"] passing a "." as the joining char', function() {
      assert.equal(copybook._arrayToLines(["a", "b", "c"], '.'), "a.b.c");
    });
  });

  context('when checking for a copybook comment line', function() {
    it('should return "true" if there is an "*" at columns 1 to 6', function() {
      let commentLine = '      *                                                                  ';
      assert.equal(copybook._isBookComment(commentLine), true);
    });
  });

  context('when checking for blank line', function() {
    it('should return true if the line has no other chars but spaces', function() {
      let line = '    ';
      assert.equal(copybook._isBlankLine(line), true);
    });
  });

  context('when replacing chars with regex', function() {
    it('should change "space" by "."', function() {
      assert.equal(copybook._regexReplace('a b c', '( )+', '.'), 'a.b.c');
    });
  });

  context('when extracting declarations', function() {
    it(`should get this:
          123456   01  ENTRADA.\\r\\n
        and covert into this:
          [ '   01  ENTRADA', '\\r\\n' ]`, function() {
      assert.deepEqual(copybook._extractDeclarations('123456   01  ENTRADA.\r\n'), ['   01  ENTRADA', '\r\n']);
    });
  });

  context('when removing comments', function() {
    it(`should get this:
        ['     * ']
        and convert into this: ' '`, function() {
      assert.equal(copybook._removeComments(['     * ']), ' ');
    });
  });

  context('when removing copybook line breaks', function() {
    it(`should get this:
        "VALUE         '<RESP\\r\\n
        -    'OSTA>'"
        and convert into this:
        "VALUE         '<RESPOSTA>'"
    `, function() {
      assert.equal(
        copybook._removeCopybookLineBreaks(
          "VALUE         '<RESP\r\n-    'OSTA>"
        ),
        "VALUE         '<RESPOSTA>"
      )
    });
  });

  context('when removing multiple line breaks', function() {
    it(`shoud get this:
        "PIC X(02)\\r\\nVALUE     '" '\\r\\n"
        and convert into this:
        "PIC X(02)     '" '"
    `, function() {
      assert.equal(
        copybook._removeMultipleLineBreaks(
          "PIC X(02)\r\nVALUE     '\" '\r\n"
        ),
        "PIC X(02)VALUE     '\" '"
      )
    });
  });

  context('when normalizing spaces', function() {
    it(`should get this:
        "05 LL-ENTRADA                            PIC S9(04) COMP"
        and convert into this:
        "05 LL-ENTRADA PIC S9(04) COMP"
    `, function() {
      assert.equal(
        copybook._normalizeSpaces(
          "05 LL-ENTRADA                            PIC S9(04) COMP"
        ),
        "05 LL-ENTRADA PIC S9(04) COMP"
      )
    });
  });

  context('when preparing default values', function() {
    it(`should get this:
        "05 LL-ENTRADA                            PIC S9(04) COMP"
        and convert into this:
        "05,LL-ENTRADA,PIC,S9(04),COMP"
    `, function() {
      assert.equal(
        copybook._prepareDefaultValues(
          "05 LL-ENTRADA                            PIC S9(04) COMP"
        ),
        "05,LL-ENTRADA,PIC,S9(04),COMP"
      )
    });
  });
});