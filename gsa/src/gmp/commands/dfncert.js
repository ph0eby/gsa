/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {isDefined} from '../utils/identity';

import InfoEntitiesCommand from './infoentities.js';
import InfoEntityCommand from './infoentity.js';

import registerCommand from '../command.js';

import DfnCertAdv from '../models/dfncert.js';

const info_filter = info => isDefined(info.dfn_cert_adv);

class DfnCertAdvCommand extends InfoEntityCommand {
  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv);
  }
}

class DfnCertAdvsCommand extends InfoEntitiesCommand {
  constructor(http) {
    super(http, 'dfn_cert_adv', DfnCertAdv, info_filter);
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'created',
      filter,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'dfn_cert_adv',
      group_column: 'severity',
      filter,
    });
  }
}

registerCommand('dfncert', DfnCertAdvCommand);
registerCommand('dfncerts', DfnCertAdvsCommand);

// vim: set ts=2 sw=2 tw=80:
