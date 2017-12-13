import {
  compose,
  setDisplayName,
}                          from 'recompose';
import {
  connect,
}                          from 'react-redux';
import mapPropsStream      from '../../falcor/mapPropsStream';
import connectFalcor       from '../../falcor/connect';
import Table               from '../../components/Table';
import {
  getSheetMatrix,
}                          from '../../redux/modules/sheets';
import {
  focusCell,
  navigate,
}                          from '../../redux/modules/focus';


export default compose(
  setDisplayName('TableContainer'),
  // connect(
  //   (state, { sheetId }) => ({
  //     sheetPaths: getSheetPathSets(state, sheetId),
  //   }),
  // ),
  mapPropsStream(connectFalcor(() => [['app', 'value']])),
  connect(
    (state, { sheetId }) => ({
      sheetMatrix: getSheetMatrix(state, sheetId),
    }),
    (dispatch, { sheetId }) => ({
      focusCell: (address) => dispatch(focusCell(sheetId, address)), // TODO - add focus to node view
      navigate: (column, row, direction, steps) =>
        dispatch(navigate(column, row, sheetId, direction, steps)),
    })
  )
)(Table);
