const COMMENT_COLUMN_NUMBER = 6;
const COMMENT_CHAR = '*';

class CopyBook {
  _linesToArray(copybook) {
    return copybook.split('\r\n');
  }
  _arrayToLines(array) {
    return array.join('\r\n');
  }
  _isBookComment(line) {
    return (line.substr(COMMENT_COLUMN_NUMBER, 1) == COMMENT_CHAR);
  }
  _isBlankLine(line) {
    return (/^( )+$/g).test(line);
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
  replaceRegex(target, regex, newValue) {
    return target.replace(new RegExp(regex, 'g'), newValue);
  }
  extractDeclarations(copyBookInput) {
    return this._arrayToLines(
      this._removeComments(
        this._linesToArray(copyBookInput)
      )
    ).split('.');
  }
  bookToList(copyBookInput) {
    let result = this.extractDeclarations(copyBookInput)
      .reduce((acum, curr, key) => {
        let result = this.replaceRegex(curr, '(\r\n)(\-)( )+(\')', '');
        result = this.replaceRegex(result, '(\r\n)+', '');
        let regex = new RegExp('(\')(.+)(\')', 'g');
        let defaultValue = result.match(regex);
        if (defaultValue) {
          result = result.replace(regex, '***');
        }
        result = this.replaceRegex(result, '( )+', ' ');
        result = result.trim();
        result = result.split(' ');
        if (defaultValue) {
          regex = new RegExp('[\*]{3}', 'g');
          result = result.map((curr, key) => 
            curr.replace(regex, defaultValue)
          );
        }
        if (result[0].length > 0) {
          acum.push(result);
        }
        return acum;
    }, []);
    return result;
  }
}

module.exports = new CopyBook();