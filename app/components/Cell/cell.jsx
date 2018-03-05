/* eslint-disable jsx-a11y/click-events-have-key-events */
import React                   from 'react';
import {}                      from 'prop-types';
import {
  equals,
}                              from 'ramda';
import CellValue               from '../CellValue';
import {
  predicateInputId,
  indexInputId,
}                              from '../../redux/modules/focus';
import PredicateInput          from '../../containers/PredicateInputContainer';
import IndexInput              from '../../containers/IndexInputContainer';
import                              './style.scss';


const camel2Kebab = (str) => str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

export const shouldRenderSearchInput = (activeView, enhanceView, cellInput, type) => (
  type === 'searchCollection' &&
  (enhanceView || (activeView && cellInput))
);


const Cell = ({
  type, sheetId, tableId, column, row, value, $type, cellLength, cellInput, focus,
  leftCellTableId, upCellTableId, predicateIdx,
  hotKeys, activeView, enhanceView, dropTableView, illegalDropTableView,
  dragTableView, illegalDragTableView, activeHint, teaserHint,
  onMouseEnter, onKeyPress, onDragStart, onDragEnd, onDragEnter, updateValue,
}) => (
  /* console.log('render', sheetId, row, column) || */
  <td
    className={`cell ${camel2Kebab(type)} ${activeView ? 'active' : ''} ${activeHint ? 'active-hint' : ''} ${teaserHint ? 'teaser-hint' : ''} ${enhanceView ? 'enhance' : ''} ${dropTableView ? 'drop-table' : ''} ${illegalDropTableView ? 'illegal-drop-table' : ''} ${dragTableView ? 'drag-table' : ''} ${illegalDragTableView ? 'illegal-drag-table' : ''}`}
    role="gridcell"
    draggable={type !== 'empty'}
    onMouseEnter={onMouseEnter}
    onKeyPress={onKeyPress}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    onDragEnter={onDragEnter}
    {...hotKeys}
  >
    {
      /* shouldRenderSearchInput(activeView, enhanceView, cellInput, type) ?
          <div>Search Input</div> : */
      equals(focus, predicateInputId(sheetId, column, row)) ?
        <PredicateInput
          value={cellInput}
          sheetId={sheetId}
          type={type}
          tableId={type === 'predicate' ? tableId : leftCellTableId}
          column={column}
          row={row}
          predicateIdx={predicateIdx}
          updateValue={updateValue}
        /> :
      equals(focus, indexInputId(sheetId, column, row)) ?
        <IndexInput
          sheetId={sheetId}
          tableId={type === 'index' ? tableId : upCellTableId}
          column={column}
          row={row}
        /> :
      cellInput ?
        <div className="cell-body">
          {cellInput}
        </div> :
        <div className="cell-body">
          <CellValue
            $type={$type}
            value={value}
            cellLength={cellLength}
          />
        </div>
    }
  </td>
);


Cell.propTypes = {};

export default Cell;
