/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/string/includes';

import React from 'react';

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils';
import Theme from '../../utils/theme';

export const Box = glamorous.div({
  border: '1px solid ' + Theme.inputBorderGray,
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  flexGrow: 1,
  padding: '1px 5px',
  backgroundColor: Theme.white,
}, ({isOpen}) => isOpen ? {
  borderRadius: '4px 4px 0 0',
} : null, ({disabled}) => disabled ? {
  backgroundColor: Theme.dialogGray,
} : null);

export const Input = glamorous.input({
  flexGrow: 1,
  padding: '1px',
  margin: '5px',
});

export const Item = glamorous.span({
  padding: '1px 5px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: Theme.mediumBlue,
    color: 'white',
  },
}, ({isSelected}) => isSelected ? {
  backgroundColor: Theme.lightGray,
} : null, ({isActive}) => isActive ? {
  backgroundColor: Theme.mediumBlue,
  color: Theme.white,
} : null);

export const ItemContainer = glamorous.div({
  maxHeight: '320px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const Menu = glamorous.div({
  outline: '0',
  borderRadius: '0 0 4px 4px',
  transition: 'opacity .1s ease',
  boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
  borderColor: Theme.inputBorderGray,
  borderWidth: '1px 1px 1px 1px',
  borderStyle: 'solid',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  zIndex: 100,
  marginTop: '-1px', // collapse top border
  boxSizing: 'border-box',
}, ({
  position,
  right,
  width,
  x,
  y,
}) => {
  switch (position) {
    case 'adjust':
      return {
        top: y,
        left: x,
        width,
      };
    case 'right':
      return {
        top: y,
        right,
        whiteSpace: 'nowrap',
      };
    default:
      return {
        top: y,
        left: x,
        whiteSpace: 'nowrap',
      };
  }
});

export const SelectContainer = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}, ({width}) => ({
  width,
}));

export const SelectedValue = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  cursor: 'pointer',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}, ({disabled}) => disabled ? {
  cursor: 'default',
} : null);

export const case_insensitive_filter = search => {
  if (!is_defined(search) || search.length === 0) {
    return () => true;
  }
  search = search.toLowerCase();
  return ({label}) => ('' + label).toLowerCase().includes(search);
};

export const option_items = children => {
  if (!is_defined(children)) {
    return undefined;
  }

  children = React.Children.toArray(children);
  children = children.filter(child => child.type === 'option');
  return children.map(child => {
    const {props} = child;
    return {
      label: props.children,
      value: is_defined(props.value) ? props.value : props.children,
    };
  });
};

// vim: set ts=2 sw=2 tw=80:
