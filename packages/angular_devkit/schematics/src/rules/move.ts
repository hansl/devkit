/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalize } from '@angular-devkit/core';
import { FileOperator, Rule, SchematicContext, Tree } from '../engine/interface';
import { FileEntry } from '../tree/interface';
import { forEach } from './base';
import { printRuleDebugInfo } from './utils/debug';


export function moveOp(from: string, to: string): FileOperator {
  const fromPath = normalize('/' + from);
  const toPath = normalize('/' + to);

  return (entry: FileEntry) => {
    if (entry.path.startsWith(fromPath)) {
      return {
        content: entry.content,
        path: normalize(toPath + '/' + entry.path.substr(fromPath.length)),
      };
    }

    return entry;
  };
}


export function move(from: string, to?: string): Rule {
  if (to === undefined) {
    to = from;
    from = '/';
  }

  return (tree: Tree, context: SchematicContext) => {
    if (context.debug) {
      printRuleDebugInfo(context, 'move', from, to);
    }
    return forEach(moveOp(from, to))(tree, context);
  };
}
