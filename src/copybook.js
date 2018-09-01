const COMMENT_COLUMN_NUMBER = 6;
const COMMENT_CHAR = '*';
const LINE_BREAK = '\r\n';
const BLANK_SPACE = ' ';

class CopyBook {
  _linesToArray(copybook, regex) {
    return copybook.split(regex);
  }
  _arrayToLines(array, regex) {
    return array.join(regex);
  }
  _isBookComment(line) {
    return (line.substr(COMMENT_COLUMN_NUMBER, 1) == COMMENT_CHAR);
  }
  _isBlankLine(line) {
    return (/^( )+$/g).test(line);
  }
  _regexReplace(target, regex, newValue) {
    return target.replace(new RegExp(regex, 'g'), newValue);
  }
  _extractDeclarations(copyBookInput) {
    return this._linesToArray(
      this._arrayToLines(
        this._removeComments(
          this._linesToArray(copyBookInput, LINE_BREAK)
        ),
      LINE_BREAK
    ), '.');
  }
  _removeComments(bookLines) {
    return bookLines.reduce((acum, curr) => {
      if (!this._isBookComment(curr) && !this._isBlankLine(curr)) {
        acum.push(
          curr.substr(
            COMMENT_COLUMN_NUMBER, 
            curr.length - COMMENT_COLUMN_NUMBER));
      }
      return acum;
    },[]);
  }
  _removeCopybookLineBreaks(bookLine) {
    return this._regexReplace(bookLine, '(\r\n)(\-)( )+(\')', '');
  }
  _removeMultipleLineBreaks(bookLine) {
    return this._regexReplace(bookLine, '(\r\n)+', '');
  }
  _normalizeSpaces(bookLine) {
    return this._regexReplace(bookLine, '( )+', ' ');
  }
  _prepareDefaultValues(bookLine) {
    let regex = new RegExp('(\')(.+)(\')', 'g');
    let defaultValue = bookLine.match(regex);
    if (defaultValue) {
      bookLine = bookLine.replace(regex, '***');
    }
    bookLine = this
      ._normalizeSpaces(bookLine)
      .trim();
    bookLine = this._linesToArray(bookLine, BLANK_SPACE);
    if (defaultValue) {
      regex = new RegExp('[\*]{3}', 'g');
      bookLine = bookLine.map((curr, key) => 
        curr.replace(regex, defaultValue)
      );
    }
    return bookLine;
  }
  bookToList(copyBookInput) {
    let result = this._extractDeclarations(copyBookInput)
      .reduce((acum, curr, key) => {
        let result = this._removeCopybookLineBreaks(curr);
        result = this._removeMultipleLineBreaks(result);
        result = this._prepareDefaultValues(result);
        if (result[0].length > 0) {
          acum.push(result);
        }
        return acum;
    }, []);
    return result;
  }
}

module.exports = new CopyBook();