const CPYFactory = require('./cpy-factory');

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

  /**
   * Generates a list of parameters list.
   * @param {string} copyBookInput COPYBOOK COBOL.
   * @return {array} Returns a list of parameters list from COPYBOOK.
   */
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
  }

  /**
   * Converts the COPYBOOK to JSON
   * @param {array} book COPYBOOK converted to array.
   * @param {number} point Pointer for count start.
   * @return {array} Returns a list of fields in JSON format.
   */
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
          objNew = CPYFactory.getInstance().createGroupRedefines(book[index], newGroup);
          lastPosition = (newGroup['length']);
          index = k - 1;
          break;
        // Tratamento de redefinição de variavel comum
        case (book[index].includes('REDEFINES') && book[index].includes('PIC')):
          objNew = CPYFactory.getInstance().createItemRedefines(book[index]);
          break;
        // Tratamento de pictures
        case book[index].includes('PIC'):
          objNew = CPYFactory.getInstance().createItem(book[index], lastPosition);
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
          objNew = CPYFactory.getInstance().createList(book[index], occursLine, newList, lastPosition, endOccurs)
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
          objNew = CPYFactory.getInstance().createGroup(book[index], newGroup);
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
}

module.exports = new CopyBook();