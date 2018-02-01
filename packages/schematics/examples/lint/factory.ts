/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  normalize,
} from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import { Linter, Configuration } from 'tslint';
import * as ts from 'typescript';
import { Schema } from './schema';


export default function (options: Schema): Rule {
  const tslintPath = normalize(options.tslint);

  return (tree: Tree, context: SchematicContext) => {
    const program = ts.
    const linter = new Linter({}, )
  };
}
