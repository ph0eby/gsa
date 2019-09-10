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

import _ from 'gmp/locale';

import {ospScannersFilter} from 'gmp/models/scanner';

import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {selectSaveId} from 'gmp/utils/id';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import EntityComponent from 'web/entity/component';

import EditConfigFamilyDialog from './editconfigfamilydialog';
import EditScanConfigDialog from './editdialog';
import EditNvtDetailsDialog from './editnvtdetailsdialog';
import ImportDialog from './importdialog';
import ScanConfigDialog from './dialog';

const createSelectedNvts = (configFamily, nvts) => {
  const selected = {};
  const nvtsCount = isDefined(configFamily) ? configFamily.nvts.count : 0;

  if (nvtsCount === nvts.length) {
    forEach(nvts, nvt => {
      selected[nvt.oid] = YES_VALUE;
    });
  } else {
    forEach(nvts, nvt => {
      selected[nvt.oid] = nvt.selected;
    });
  }

  return selected;
};

class ScanConfigComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      createConfigDialogVisible: false,
      editConfigDialogVisible: false,
      editConfigFamilyDialogVisible: false,
      editNvtDetailsDialogVisible: false,
      importDialogVisible: false,
    };

    this.handleImportConfig = this.handleImportConfig.bind(this);
    this.handleSaveConfigFamily = this.handleSaveConfigFamily.bind(this);
    this.handleSaveConfigNvt = this.handleSaveConfigNvt.bind(this);
    this.openCreateConfigDialog = this.openCreateConfigDialog.bind(this);
    this.handleCloseCreateConfigDialog = this.handleCloseCreateConfigDialog.bind(
      this,
    );
    this.openEditConfigDialog = this.openEditConfigDialog.bind(this);
    this.handleCloseEditConfigDialog = this.handleCloseEditConfigDialog.bind(
      this,
    );
    this.openEditConfigFamilyDialog = this.openEditConfigFamilyDialog.bind(
      this,
    );
    this.handleCloseEditConfigFamilyDialog = this.handleCloseEditConfigFamilyDialog.bind(
      this,
    );
    this.openEditNvtDetailsDialog = this.openEditNvtDetailsDialog.bind(this);
    this.handleCloseEditNvtDetailsDialog = this.handleCloseEditNvtDetailsDialog.bind(
      this,
    );
    this.openImportDialog = this.openImportDialog.bind(this);
    this.handleCloseImportDialog = this.handleCloseImportDialog.bind(this);
  }

  openEditConfigDialog(config) {
    this.loadEditScanConfigSettings(config.id).then(() => {
      this.setState({
        editConfigDialogVisible: true,
        title: _('Edit Scan Config {{name}}', {name: shorten(config.name)}),
      });
    });

    this.loadScanners().then(({scanners, scannerId}) => {
      this.setState({
        scanners,
        scannerId,
      });
    });

    this.handleInteraction();
  }

  closeEditConfigDialog() {
    this.setState({editConfigDialogVisible: false});
  }

  handleCloseEditConfigDialog() {
    this.closeEditConfigDialog();
    this.handleInteraction();
  }

  openCreateConfigDialog() {
    this.loadScanners().then(({scanners, scannerId}) =>
      this.setState({
        scanners,
        scannerId,
        createConfigDialogVisible: true,
      }),
    );

    this.handleInteraction();
  }

  closeCreateConfigDialog() {
    this.setState({createConfigDialogVisible: false});
  }

  handleCloseCreateConfigDialog() {
    this.closeCreateConfigDialog();
    this.handleInteraction();
  }

  openImportDialog() {
    this.setState({importDialogVisible: true});
    this.handleInteraction();
  }

  closeImportDialog() {
    this.setState({importDialogVisible: false});
  }

  handleCloseImportDialog() {
    this.closeImportDialog();
    this.handleInteraction();
  }

  openEditConfigFamilyDialog(familyName) {
    const {gmp} = this.props;
    const {config} = this.state;

    this.handleInteraction();

    return gmp.scanconfig
      .editScanConfigFamilySettings({
        id: config.id,
        familyName,
      })
      .then(response => {
        const {data} = response;
        const {nvts} = data;

        const configFamily = config.families[familyName];
        const selected = createSelectedNvts(configFamily, nvts);

        this.setState({
          familyName,
          familyNvts: data.nvts,
          familySelectedNvts: selected,
          editConfigFamilyDialogVisible: true,
          editConfigFamilyDialogTitle: _('Edit Scan Config Family {{name}}', {
            name: shorten(familyName),
          }),
        });
      });
  }

  closeEditConfigFamilyDialog() {
    this.setState({editConfigFamilyDialogVisible: false});
  }

  handleCloseEditConfigFamilyDialog() {
    this.closeEditConfigFamilyDialog();
    this.handleInteraction();
  }

  openEditNvtDetailsDialog(nvtOid) {
    const {gmp} = this.props;
    const {config} = this.state;

    this.handleInteraction();

    return gmp.nvt
      .getConfigNvt({
        configId: config.id,
        oid: nvtOid,
      })
      .then(response => response.data)
      .then(loadedNvt => {
        this.setState({
          nvt: loadedNvt,
          editNvtDetailsDialogVisible: true,
          editNvtDetailsDialogTitle: _('Edit Scan Config NVT {{name}}', {
            name: shorten(loadedNvt.name),
          }),
        });
      });
  }

  closeEditNvtDetailsDialog() {
    this.setState({editNvtDetailsDialogVisible: false});
  }

  handleCloseEditNvtDetailsDialog() {
    this.closeEditNvtDetailsDialog();
    this.handleInteraction();
  }

  handleImportConfig(data) {
    const {gmp, onImported, onImportError} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .import(data)
      .then(onImported, onImportError)
      .then(() => this.closeImportDialog());
  }

  handleSaveConfigFamily({familyName, configId, selected}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigFamily({
        id: configId,
        familyName,
        selected,
      })
      .then(() => this.loadEditScanConfigSettings(configId))
      .then(() => {
        this.closeEditConfigFamilyDialog();
      });
  }

  handleSaveConfigNvt({
    configId,
    timeout,
    useDefaultTimeout,
    nvtOid,
    preferenceValues,
  }) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.scanconfig
      .saveScanConfigNvt({
        id: configId,
        timeout: useDefaultTimeout === '1' ? undefined : timeout,
        oid: nvtOid,
        preferenceValues,
      })
      .then(() => {
        this.closeEditNvtDetailsDialog();
        return gmp.scanconfig.get({id: configId});
      })
      .then(response => this.setState({config: response.data}));
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  loadScanners(dialog) {
    const {gmp} = this.props;

    return gmp.scanners.getAll().then(response => {
      let {data: scanners} = response;
      scanners = scanners.filter(ospScannersFilter);
      return {
        scanners,
        scannerId: selectSaveId(scanners),
      };
    });
  }

  loadEditScanConfigSettings(configId) {
    const {gmp} = this.props;

    return Promise.all([
      gmp.scanconfig.get({id: configId}),
      gmp.nvtfamilies.get(),
    ]).then(([configResponse, familiesResponse]) => {
      const {data: scanconfig} = configResponse;
      const {data: families} = familiesResponse;

      this.setState({
        config: scanconfig,
        families,
      });
    });
  }

  render() {
    const {
      children,
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      config,
      createConfigDialogVisible,
      editConfigDialogVisible,
      editConfigFamilyDialogVisible,
      editConfigFamilyDialogTitle,
      editNvtDetailsDialogVisible,
      editNvtDetailsDialogTitle,
      families,
      familyName,
      familyNvts,
      familySelectedNvts,
      importDialogVisible,
      nvt,
      scannerId,
      scanners,
      title,
    } = this.state;

    return (
      <React.Fragment>
        <EntityComponent
          name="scanconfig"
          onCreated={onCreated}
          onCreateError={onCreateError}
          onCloned={onCloned}
          onCloneError={onCloneError}
          onDeleted={onDeleted}
          onDeleteError={onDeleteError}
          onDownloaded={onDownloaded}
          onDownloadError={onDownloadError}
          onInteraction={onInteraction}
          onSaved={onSaved}
          onSaveError={onSaveError}
        >
          {({save, ...other}) => (
            <React.Fragment>
              {children({
                ...other,
                create: this.openCreateConfigDialog,
                edit: this.openEditConfigDialog,
                import: this.openImportDialog,
              })}
              {createConfigDialogVisible && (
                <ScanConfigDialog
                  scannerId={scannerId}
                  scanners={scanners}
                  onClose={this.handleCloseCreateConfigDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeCreateConfigDialog());
                  }}
                />
              )}
              {editConfigDialogVisible && (
                <EditScanConfigDialog
                  comment={config.comment}
                  config={config}
                  configFamilies={config.families}
                  configId={config.id}
                  configIsInUse={config.isInUse()}
                  configType={config.scan_config_type}
                  editNvtDetailsTitle={_('Edit Scan Config NVT Details')}
                  editNvtFamiliesTitle={_('Edit Scan Config Family')}
                  families={families}
                  name={config.name}
                  nvtPreferences={config.preferences.nvt}
                  scannerId={scannerId}
                  scannerPreferences={config.preferences.scanner}
                  scanners={scanners}
                  title={title}
                  onClose={this.handleCloseEditConfigDialog}
                  onEditConfigFamilyClick={this.openEditConfigFamilyDialog}
                  onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
                  onSave={d => {
                    this.handleInteraction();
                    return save(d).then(() => this.closeEditConfigDialog());
                  }}
                />
              )}
            </React.Fragment>
          )}
        </EntityComponent>
        {importDialogVisible && (
          <ImportDialog
            title={_('Import Scan Config')}
            text={_('Import XML config')}
            onClose={this.handleCloseImportDialog}
            onSave={this.handleImportConfig}
          />
        )}
        {editConfigFamilyDialogVisible && (
          <EditConfigFamilyDialog
            configId={config.id}
            configNameLabel={_('Config')}
            configName={config.name}
            familyName={familyName}
            nvts={familyNvts}
            selected={familySelectedNvts}
            title={editConfigFamilyDialogTitle}
            onClose={this.handleCloseEditConfigFamilyDialog}
            onEditNvtDetailsClick={this.openEditNvtDetailsDialog}
            onSave={this.handleSaveConfigFamily}
          />
        )}
        {editNvtDetailsDialogVisible && (
          <EditNvtDetailsDialog
            configId={config.id}
            configName={config.name}
            configNameLabel={_('Config')}
            defaultTimeout={nvt.defaultTimeout}
            nvtAffectedSoftware={nvt.tags.affected}
            nvtCvssVector={nvt.tags.cvss_base_vector}
            nvtFamily={nvt.family}
            nvtName={nvt.name}
            nvtLastModified={nvt.modificationTime}
            nvtOid={nvt.oid}
            nvtSeverity={nvt.severity}
            nvtSummary={nvt.tags.summary}
            nvtTags={nvt.tags}
            preferences={nvt.preferences}
            timeout={nvt.timeout}
            title={editNvtDetailsDialogTitle}
            onClose={this.handleCloseEditNvtDetailsDialog}
            onSave={this.handleSaveConfigNvt}
          />
        )}
      </React.Fragment>
    );
  }
}

ScanConfigComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onImportError: PropTypes.func,
  onImported: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(ScanConfigComponent);

// vim: set ts=2 sw=2 tw=80:
