/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { logging } from '@angular-devkit/core';
import { SchematicContext } from '../../engine/interface';


// tslint:disable-next-line:no-any
export function printRuleDebugInfo(context: SchematicContext, name: string, ...args: any[]) {
  const printInfoOf = (value: any, logger: logging.IndentLogger) => {
    if (Array.isArray(value)) {
      logger.debug(`[ ... ${value.length} ... ]`);
    } else {
      switch (typeof value) {
        case 'object':
          logger.debug('{ ... },');
          break;

        case 'function':
          logger.debug(
            value.name || value.displayName || value.functionName || 'Anonymous Function' + ',',
          );
          break;

        default:
          logger.debug(JSON.stringify(value) + ',');
          break;
      }
    }
  };

  context.logger.debug(`${name}(`);
  const sub = context.logger.createChild('arguments');
  if (args.length > 0) {
    args.forEach(arg => printInfoOf(arg, sub));
  }
  sub.complete();
  context.logger.debug(`)`);
}
