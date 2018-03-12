import {
  equals,
}                            from 'ramda';
import {
  compose,
  withStateHandlers,
  withHandlers,
}                            from 'recompose';
import {
  batchActions,
}                            from 'redux-batched-actions';
import {
  searchInputId,
  cellId,
  setFocus,
}                            from '../../redux/modules/focus';
import {
  addSearchCollectionTable,
  replaceSearchCollection,
}                            from '../../redux/modules/tables';
import {
  formatAddress,
}                            from '../../utils/cell';
import {
  generateTableId,
}                            from '../../utils/table';
import withHotKeys           from '../../hoc/withHotKeys';
import SearchInput           from '../../components/SearchInput';
import store                 from '../../redux/store';

const { dispatch, } = store;


export default compose(
  withStateHandlers(
    ({ search: { repository = '', type = '', } = {}, }) => ({
      repository,
      type,
    }),
    {
      setRepository: () => (repository) => ({ repository, }),
      setType: () => (type) => ({ type, }),
    }
  ),
  withHandlers({
    create: ({
      sheetId, column, row,
    }) => (repository, type) => {
      dispatch(batchActions([
        addSearchCollectionTable(
          sheetId,
          generateTableId(),
          formatAddress(sheetId, column, row),
          { repository, type, },
          ['schema:name', 'schema:birthPlace'],
          [{ from: 0, to: 2, }]
        ),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    update: ({
      tableId, sheetId, column, row,
    }) => (repository, type) => {
      dispatch(batchActions([
        replaceSearchCollection(tableId, repository, type),
        setFocus(cellId(sheetId, column, row)),
      ]));
    },
    exit: ({ sheetId, column, row, }) => () => (
      dispatch(setFocus(cellId(sheetId, column, row)))
    ),
  }),
  withHotKeys(
    ({ sheetId, column, row, }) => searchInputId(sheetId, column, row),
  ),
)(SearchInput);
