import {
  path,
}                 from 'ramda';


export const formatAddress = (sheetId, column, row) => `${sheetId}-${column}-${row}`;

export const destructureAddress = (address) => {
  const [sheetId, column, row] = address.split('-');
  return { sheetId, column: +column, row: +row, };
};

export const getUpCell = (matrix, column, row) => matrix[row - 1] && matrix[row - 1][column];

export const getLeftCell = (matrix, column, row) => matrix[row] && matrix[row][column - 1];


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} search
 */
export const createSearchCollection = (
  sheetId, tableId, column, row, search
) => ({
  type: 'searchCollection',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  search,
  cellInput: '',
});

/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} collectionAddress
 * @param {String} indexAddress
 * @param {String} predicateAddress
 */
export const createObject = (
  sheetId, tableId, column, row, collectionAddress, indexAddress, predicateAddress
) => ({
  type: 'object',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  collectionAddress,
  indexAddress,
  predicateAddress,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} collectionAddress
 * @param {Number} index
 */
export const createIndex = (
  sheetId, tableId, column, row, collectionAddress, index
) => ({
  type: 'index',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  index,
  collectionAddress,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {String} tableId
 * @param {Number} column
 * @param {Number} row
 * @param {String} uri
 */
export const createPredicate = (
  sheetId, tableId, column, row, collectionAddress, uri
) => ({
  type: 'predicate',
  sheetId,
  tableId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  uri,
  collectionAddress,
  predicateIdx: column - destructureAddress(collectionAddress).column - 1,
  cellInput: '',
});


/**
 * @param {String} sheetId
 * @param {Number} column
 * @param {Number} row
 */
export const createEmpty = (
  sheetId, column, row
) => ({
  type: 'empty',
  sheetId,
  address: formatAddress(sheetId, column, row),
  column,
  row,
  cellInput: '',
});


export const cell2PathFragment = (cell, sheetMatrix) => {
  if (cell.type === 'searchCollection') {
    return ['collection', `schema:${cell.search}`];
  } else if (cell.type === 'objectCollection') {
    // recurse to calculate pathFragment for parentObject
    const { column, row, } = destructureAddress(cell.parentObjectAddress);

    return cell2PathFragment(sheetMatrix[row][column], sheetMatrix);
  } else if (cell.type === 'predicate') {
    return [cell.uri];
  } else if (cell.type === 'index') {
    return [cell.index];
  } else if (cell.type === 'object') {
    // recurse to caculate pathFragment for collection, index, and address
    const {
      column: collectionColumn,
      row: collectionRow,
    } = destructureAddress(cell.collectionAddress);
    const {
      column: indexColumn,
      row: indexRow,
    } = destructureAddress(cell.indexAddress);
    const {
      column: predicateColumn,
      row: predicateRow,
    } = destructureAddress(cell.predicateAddress);

    return [
      ...cell2PathFragment(
        sheetMatrix[collectionRow][collectionColumn],
        sheetMatrix
      ),
      ...cell2PathFragment(
        sheetMatrix[indexRow][indexColumn],
        sheetMatrix
      ),
      ...cell2PathFragment(
        sheetMatrix[predicateRow][predicateColumn],
        sheetMatrix
      ),
    ];
  }

  throw new Error('Tried to get path for unknown cell type', cell.type);
};


// TODO - mapping search to URIs should move to falcor router
export const getSearchCollectionPath = (search) => ['resource', `schema:${search}`, 'skos:prefLabel'];


export const getPredicatePath = (uri) => ['resource', uri, 'skos:prefLabel'];


export const getObjectPath = (collectionAddress, indexAddress, predicateAddress, sheetMatrix) => {
  const {
    column: collectionColumn,
    row: collectionRow,
  } = destructureAddress(collectionAddress);
  const {
    column: indexColumn,
    row: indexRow,
  } = destructureAddress(indexAddress);
  const {
    column: predicateColumn,
    row: predicateRow,
  } = destructureAddress(predicateAddress);

  return [
    ...cell2PathFragment(
      sheetMatrix[collectionRow][collectionColumn],
      sheetMatrix
    ),
    ...cell2PathFragment(
      sheetMatrix[indexRow][indexColumn],
      sheetMatrix
    ),
    ...cell2PathFragment(
      sheetMatrix[predicateRow][predicateColumn],
      sheetMatrix
    ),
  ];
};


export const materializeSearchCollection = (cell, graphJSON) => {
  const relativePath = getSearchCollectionPath(cell.search);

  // TODO - mapping search to URIs should move to falcor router
  return {
    ...cell,
    cellLength: path(['collection', `schema:${cell.search}`, 'length', 'value'], graphJSON),
    ...path(relativePath, graphJSON),
  };
};


export const materializeIndex = (cell) => ({
  ...cell,
  value: cell.index,
});


export const materializePredicate = (cell, graphJSON) => {
  const relativePath = getPredicatePath(cell.uri);

  return {
    ...cell,
    ...path(relativePath, graphJSON),
  };
};


export const materializeObject = (cell, graphJSON, sheetMatrix) => {
  const relativePath = getObjectPath(
    cell.collectionAddress, cell.indexAddress, cell.predicateAddress, sheetMatrix
  );
  const cellLength = path([...relativePath, 'length', 'value'], graphJSON);

  let absolutePath;

  if (cellLength === 1 && path([...relativePath, 0, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, 0, '$__path'], graphJSON);
  } else if (path([...relativePath, '$__path'], graphJSON)) {
    absolutePath = path([...relativePath, '$__path'], graphJSON);
  } else {
    absolutePath = null;
  }

  let boxValue = path(relativePath, graphJSON);

  // if boxValue is multivalue (not singleton), get first value
  if (boxValue && boxValue['0']) {
    boxValue = boxValue['0'];
  }

  // if boxValue points to an object, get its skos:prefLabel
  if (boxValue && boxValue['skos:prefLabel']) {
    boxValue = boxValue['skos:prefLabel'];
  }

  return {
    ...cell,
    cellLength: cellLength === undefined ? 1 : cellLength,
    absolutePath,
    ...(boxValue || {}),
  };
};
