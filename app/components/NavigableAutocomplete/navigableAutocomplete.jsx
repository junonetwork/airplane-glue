import React                   from 'react';
import {}                      from 'prop-types';
import Autocomplete            from '../../containers/AutocompleteContainer';
import                              './style.scss';


const NavigableAutocomplete = ({
  value, list, placeholder, lineHeight, hotKeys, autocompleteFocusId,
  setInput, enterInput, exitInput,
}) => (
  <span
    className="navigable-autocomplete"
    {...hotKeys}
  >
    <Autocomplete
      id={autocompleteFocusId}
      value={value}
      list={list}
      placeholder={placeholder}
      lineHeight={lineHeight}
      onChange={setInput}
      enter={enterInput}
      exit={exitInput}
    />
  </span>
);


NavigableAutocomplete.propTypes = {};

export default NavigableAutocomplete;
