/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Logger } from '@angular-devkit/core';
import { ReadTypeScriptModules } from 'dgeni-packages/typescript/processors/readTypeScriptModules';
import { TsParser } from 'dgeni-packages/typescript/services/TsParser';
import { Dgeni, Package } from 'dgeni';
import * as path from 'path';
import { distRoot, packages, tsConfig } from '../lib/packages';
import { DocsPrivateFilter } from './docs/processors/docs-private-filter';
import { Categorizer } from './docs/processors/categorizer';
// import {ComponentGrouper} from './processors/component-grouper';

const jsdocPackage = require('dgeni-packages/jsdoc');
const nunjucksPackage = require('dgeni-packages/nunjucks');
const typescriptPackage = require('dgeni-packages/typescript');


const dgeniPackageDeps = [
  jsdocPackage,
  nunjucksPackage,
  typescriptPackage,
];


const apiDocsPackage = new Package('devkit-api-docs', dgeniPackageDeps);


// Processor that filters out symbols that should not be shown in the docs.
apiDocsPackage.processor(new DocsPrivateFilter());

// Processor that appends categorization flags to the docs, e.g. `isDirective`, `isNgModule`, etc.
apiDocsPackage.processor(new Categorizer());

// Processor to group components into top-level groups such as "Tabs", "Sidenav", etc.
// apiDocsPackage.processor(new ComponentGrouper());


// Configure the processor for understanding TypeScript.
apiDocsPackage.config(function (readTypeScriptModules: ReadTypeScriptModules, tsParser: TsParser) {
  readTypeScriptModules.basePath = path.join(__dirname, '../packages');
  readTypeScriptModules.ignoreExportsMatching = [/^_/];
  readTypeScriptModules.hidePrivateMembers = true;
  readTypeScriptModules.sourceFiles = [];

  // const typescriptPathMap: any = {};

  Object.keys(packages).forEach(pkgName => {
    // typescriptPathMap[pkgName] = packages[pkgName].main;
    readTypeScriptModules.sourceFiles.push('./' + path.relative(readTypeScriptModules.basePath, packages[pkgName].main));
  });

  // cdkPackages.forEach(packageName => {
  //   typescriptPathMap[`@angular/cdk/${packageName}`] = [`./cdk/${packageName}/index.ts`];
  // });

  // tsParser.options.baseUrl = readTypeScriptModules.basePath;
  // tsParser.options.paths = typescriptPathMap;
  tsParser.options = tsConfig.config.compilerOptions;

  // // Entry points for docs generation. All publically exported symbols found through these
  // // files will have docs generated.
  // readTypeScriptModules.sourceFiles = [
  //   ...cdkPackages.map(packageName => `./cdk/${packageName}/index.ts`),
  //   ...materialPackages.map(packageName => `./lib/${packageName}/index.ts`)
  // ];
});


// Configure the processor for reading files from the file system.
apiDocsPackage.config(function (readFilesProcessor: any, writeFilesProcessor: any) {
  readFilesProcessor.basePath = path.join(__dirname, '../../../packages');
  readFilesProcessor.$enabled = false; // disable for now as we are using readTypeScriptModules

  writeFilesProcessor.outputFolder = distRoot;
});



export default function(_: {}, logger: Logger) {
  const docs = new Dgeni([apiDocsPackage]);

  return docs.generate();
}
