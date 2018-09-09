var CPYItem = require('./cpy-item');
var CPYGroup = require('./cpy-group');
var CPYItemRedefines = require('./cpy-item-redefines');
var CPYGroupRedefines = require('./cpy-group-redefines');
var CPYList = require('./cpy-list');

class CPYFactory {

  static getInstance() {
    if(!CPYFactory.instance) {
      CPYFactory.instance = new CPYFactory();
    }
    return CPYFactory.instance;
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
  _snakeCase(value) {
    return value.replace(/\-/g, "_").toLowerCase();
  }
  _redefines(objectCopybook, fieldNameMainframe) {
    var pos = -1;
    for (var prop in objectCopybook) {
      if (objectCopybook[prop] != null && objectCopybook[prop] instanceof 'Object') {
        if (objectCopybook[prop]['copybook_name'] === fieldNameMainframe) {
            pos = objectCopybook[prop]['start'];
        } else {
          if (objectCopybook[prop]['data']) {
            if (Array.isArray(objectCopybook[prop]['data'])) {
              var temp;
              objectCopybook[prop]['data'].forEach(o => {
                temp = redefines(o, fieldNameMainframe);
                if (temp > -1) {
                  pos = temp;
                  return false;
                }
              });
            } else {
              var temp = redefines(objectCopybook[prop]['data'], fieldNameMainframe);
              if (temp > -1) {
                pos = temp;
              }
            }
          }
        }
      }
    }
    return pos - 1;
  };
  createItem(book, lastPosition) {
    let item = new CPYItem(this._snakeCase(book[1]));
    item.copybook_name = book[1];
    item.type = this._getType(
      book[3], 
      ['COMP', 'COMP-3'].find(item => item === book[4])
    );
    item.start = (lastPosition === 0) ? 0 : lastPosition + 1;
    item.length = this._picture(
      book[3], 
      ['COMP', 'COMP-3'].find(item => item === book[4])
    );
    return item;
  }

  createGroup(book, newGroup) {
    let group = new CPYGroup(this._snakeCase(book[1]));
    group.copybook_name = book[1];
    group.type = 'group';
    group.data = newGroup.data;
    group.start = newGroup.start;
    group.length = newGroup.length;
    return group;
  }

  createItemRedefines(book) {
    let itemRedefines = new CPYItemRedefines(this._snakeCase(book[1]));
    itemRedefines.copybook_name = book[1];
    itemRedefines.type = this._getType(
      book[index][5], 
      ['COMP', 'COMP-3'].find(item => item === book[index][4])
    );
    itemRedefines.redefines = this._snakeCase(book[index][3]);
    itemRedefines.start = (this._redefines(objNew, book[index][3]) + 1);
    itemRedefines.length = this._picture(
      book[index][5], 
      ['COMP', 'COMP-3'].find(item => item === book[index][4])
    );
    return itemRedefines;
  }

  createGroupRedefines(book, newGroup) {
    let groupRedefines = new CPYGroupRedefines(this._snakeCase(book[1]));
    groupRedefines.copybook_name = book[1];
    groupRedefines.type = 'group';
    groupRedefines.redefines = this._snakeCase(book[index][3]);
    groupRedefines.data = newGroup.data;
    groupRedefines.start = newGroup.start;
    groupRedefines.length = newGroup.length;
    return groupRedefines;
  }

  createList(book, occursLine, newList, lastPosition, endOccurs) {
    let list = new CPYList(this._snakeCase(book[1]));
    list.copybook_name = book[1];
    list.type = 'list';
    list.occurs = parseInt(occursLine[occursLine.indexOf('OCCURS') + 1], 10);
    list.data = newList;
    list.start = (lastPosition === 0) ? 0 : lastPosition + 1;
    list.length = endOccurs;
    return list;
  }
}

module.exports = CPYFactory;
