/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import React from 'react';

import {connect} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';

import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';

import PropTypes from 'web/utils/proptypes';

import {generateFilename} from 'web/utils/render';

import withGmp from 'web/utils/withGmp';

export const goto_details = (type, props) => ({data}) => {
  const {history} = props;
  return history.push('/' + type + '/' + data.id);
};

export const goto_list = (type, props) => () => {
  const {history} = props;
  return history.push('/' + type);
};

class EntityComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleEntityClone = this.handleEntityClone.bind(this);
    this.handleEntityDelete = this.handleEntityDelete.bind(this);
    this.handleEntityDownload = this.handleEntityDownload.bind(this);
    this.handleEntitySave = this.handleEntitySave.bind(this);
  }

  componentDidMount() {
    this.props.loadSettings();
  }

  handleEntityDelete(entity) {
    const {onDeleted, onDeleteError, gmp, name} = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    return cmd.delete(entity).then(onDeleted, onDeleteError);
  }

  handleEntityClone(entity) {
    const {onCloned, onCloneError, gmp, name} = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    return cmd.clone(entity).then(onCloned, onCloneError);
  }

  handleEntitySave(data) {
    const {gmp, name} = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    if (isDefined(data.id)) {
      const {onSaved, onSaveError} = this.props;
      return cmd.save(data).then(onSaved, onSaveError);
    }

    const {onCreated, onCreateError} = this.props;
    return cmd.create(data).then(onCreated, onCreateError);
  }

  handleEntityDownload(entity) {
    const {
      detailsExportFileName,
      username,
      gmp,
      name,
      onDownloaded,
      onDownloadError,
    } = this.props;
    const cmd = gmp[name];

    this.handleInteraction();

    const promise = cmd.export(entity).then(response => {
      const filename = generateFilename({
        creationTime: entity.creationTime,
        fileNameFormat: detailsExportFileName.value,
        id: entity.id,
        modificationTime: entity.modificationTime,
        resourceName: entity.name,
        resourceType: name,
        username,
      });

      return {filename, data: response.data};
    });

    return promise.then(onDownloaded, onDownloadError);
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {children} = this.props;

    return children({
      create: this.handleEntitySave,
      clone: this.handleEntityClone,
      delete: this.handleEntityDelete,
      save: this.handleEntitySave,
      download: this.handleEntityDownload,
    });
  }
}

EntityComponent.propTypes = {
  children: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.object,
  gmp: PropTypes.gmp.isRequired,
  loadSettings: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  username: PropTypes.string,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);
  const detailsExportFileName = userDefaultsSelector.getByName(
    'detailsexportfilename',
  );
  return {
    detailsExportFileName,
    username,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(
  withGmp,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(EntityComponent);

// vim: set ts=2 sw=2 tw=80:
