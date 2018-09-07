const COMMENT_COLUMN_NUMBER = 6;
const COMMENT_CHAR = '*';
const LINE_BREAK = '\r\n';
const BLANK_SPACE = ' ';

class CopyBook {
  _toArray(copybook, regex) {
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
    return this._toArray(
      this._arrayToLines(
        this._removeComments(
          this._toArray(copyBookInput, LINE_BREAK)
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
    bookLine = this._toArray(bookLine, BLANK_SPACE);
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
  _snakeCase(value) {
    return value.replace(/\-/g, "_").toLowerCase();
  }
  _isEmpty(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  toJSON(book, point) {
    let startPoint = (point === undefined || point === 0) ? 0 : point + 1;
    let lastPosition = point >> 0;
    let index = 0, lengthBook = book.length, i = 0, j = 0, k = 0;
    let returnValue = [];
    while (index < lengthBook) {
      let fieldName = this._snakeCase(book[index][1]);
      let fieldNameMainframe = book[index][1];
      let item, itemsGroup = [], occurs = [], newGroup = {}, objNew = {};
      switch (true) {
        // Tratamento de redefinição com item de grupo
        case (book[index].includes('REDEFINES') && !book[index].includes('PIC')):
          k = (index === 0) ? 1 : index + 1;
          itemsGroup = [];
          item = parseInt(book[index][0]);
          while (k < lengthBook && parseInt(book[k][0]) > item) {
              itemsGroup.push(book[k]);
              k++;
          };
          newGroup = this.toJSON(itemsGroup, redefines(objNew, book[index][3]));
          objNew['name'] = fieldName;
          objNew['copybook_name'] = fieldNameMainframe;
          objNew['type'] = 'group';
          objNew['redefines'] = this._snakeCase(book[index][3]);
          objNew['data'] = newGroup['data'];
          objNew['start'] = newGroup['start'];
          objNew['length'] = newGroup['length'];
          lastPosition = (newGroup['length']);
          index = k - 1;
          break;
        // Tratamento de redefinição de variavel comum
        case (book[index].includes('REDEFINES') && book[index].includes('PIC')):
          objNew['name'] = fieldName;
          objNew['copybook_name'] = fieldNameMainframe;
          objNew['type'] = this._getType(book[index][5], ['COMP', 'COMP-3'].find(function (item) { return item === book[index][4] }));
          objNew['redefines'] = this._snakeCase(book[index][3]);
          objNew['start'] = (redefines(objNew, book[index][3]) + 1);
          objNew['length'] = this._picture(book[index][5], ['COMP', 'COMP-3'].find(function (item) { return item === book[index][4] }));
          break;
        // Tratamento de pictures
        case book[index].includes('PIC'):
          objNew['name'] = fieldName;
          objNew['copybook_name'] = fieldNameMainframe;
          objNew['type'] = this._getType(book[index][3], ['COMP', 'COMP-3'].find(function (item) { return item === book[index][4] }));
          objNew['start'] = (lastPosition === 0) ? 0 : lastPosition + 1;
          objNew['length'] = this._picture(book[index][3], ['COMP', 'COMP-3'].find(function (item) { return item === book[index][4] }));
          lastPosition += (lastPosition === 0) ? (objNew['length'] - 1) : objNew['length'];
          break;
        // Tratamento de listas
        case book[index].includes('OCCURS'):
          let occursLine = book[index];
          let repeat = parseInt(book[index][3]);
          j = index + 1;
          occurs = [];
          item = parseInt(book[index][0]);
          while (j < lengthBook && parseInt(book[j][0]) > item) {
              occurs.push(book[j]);
              j++;
          };
          let newList = [], endOccurs = lastPosition;
          for (i = 0; i < repeat; i++) {
              let newGroup = this.toJSON(occurs, endOccurs);
              newList.push(newGroup['data']);
              endOccurs = (newGroup['length']);
          }
          objNew['name'] = fieldName;
          objNew['copybook_name'] = fieldNameMainframe;
          objNew['type'] = 'list';
          objNew['occurs'] = parseInt(occursLine[occursLine.indexOf('OCCURS') + 1], 10);
          objNew['data'] = newList;
          objNew['start'] = (lastPosition === 0) ? 0 : lastPosition + 1;
          objNew['length'] = endOccurs;
          lastPosition = endOccurs;
          index = j - 1;
          break;
        // Tratamento de itens de grupo
        case (book[index][0] !== '88' && book[index][2] === undefined):
          k = (index === 0) ? 1 : index + 1;
          itemsGroup = [];
          item = parseInt(book[index][0]);
          while (k < lengthBook && parseInt(book[k][0]) > item) {
              itemsGroup.push(book[k]);
              k++;
          };
          newGroup = this.toJSON(itemsGroup, lastPosition);
          objNew['name'] = fieldName;
          objNew['copybook_name'] = fieldNameMainframe;
          objNew['type'] = 'group';
          objNew['data'] = newGroup['data'];
          objNew['start'] = newGroup['start'];
          objNew['length'] = newGroup['length'];
          lastPosition = (newGroup['length']);
          index = k - 1;
          break;
        default:
          break;
      };
      if (!this._isEmpty(objNew)) {
        returnValue.push(objNew);
      }
      index++;
    };
    return { data: returnValue, start: startPoint, length: lastPosition };
  }
  _getType(pic, type = []) {
    if (['COMP', 'COMP-3'].includes(type)) {
        return 'binary';
    } else if ((/9/g).test(pic)) {
        return 'number';
    } else {
        return 'string';
    }
  }
  _picture(pic, type) {
    var tam = pic.split('V').map(function (n) {
        if (/\(/g.test(n)) return parseInt(n.replace(/(S?9\(|X\(|\)|\()/g, ''))
        else return n.length;
    });
    var result = 0;
    tam.forEach(function (c) { result += c });
    switch (type) {
        case 'COMP':
            if (result < 5) result = 2;
            else result = 4;
            break;
        case 'COMP-3':
            result = Math.floor(result / 2) + 1;
            break;
        default:
            break;
    }
    return result;
};
}

module.exports = new CopyBook();