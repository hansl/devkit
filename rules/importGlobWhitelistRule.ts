/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as Lint from 'tslint';
import * as ts from 'typescript';


export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'import-glob-whitelist',
    type: 'style',
    description: `Specify a glob of valid imports.`,
    rationale: `Symbols can be imported only from the glob list. If you want to allow . and ..
                imports you need to specify it too. Understand * and **.`,
    options: {
      type: 'array',
      items: {
        oneOf: [
          { type: 'string '},
          {
            type: 'object',
            properties: {
              source: { type: 'string' },
              glob: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        ],
      },
      minLength: 0,
    },
    optionsDescription: `Not configurable.`,
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new Walker(sourceFile, this.getOptions()));
  }
}


function globAsRegex(x: string) {
  return x
    .replace(/[\-\[\]{}()+?./\\^$|]/g, '\\$&')
    .replace(/(\\\\|\\\/)\*\*/g, '((\/|\\\\).+?)?')
    .replace(/\*/g, '[^/\\\\]*');
}

type SourceGlob = { source: string, glob: string[] };

class Walker extends Lint.RuleWalker {
  walk(sourceFile: ts.SourceFile) {
    super.walk(sourceFile);

    const whitelist = this.getOptions() as (string | SourceGlob)[];
    const statements = sourceFile.statements;
    const pattern = new RegExp('^('
                  + whitelist
                    .filter(x => typeof x == 'string')
                    .map((ex: string) => {
                      return '(' + globAsRegex(ex) + ')';
                    })
                    .join('|')
                  + ')($|/|\\\\)');
    const sources = whitelist
      .filter(x => typeof x != 'string')
      .reduce((acc, x: SourceGlob) => {
        acc[globAsRegex(x.source)] = new RegExp(
          '^('
          + x.glob
            .filter(x => typeof x == 'string')
            .map((ex: string) => {
              return '(' + globAsRegex(ex) + ')';
            })
            .join('|')
          + ')($|/|\\\\)',
        );

        return acc;
      }, {} as { [glob: string]: RegExp });

    const imports = statements
      .filter(s => s.kind == ts.SyntaxKind.ImportDeclaration) as ts.ImportDeclaration[];

    for (const i of imports) {
      const moduleName = (i.moduleSpecifier as ts.StringLiteral).text;

      if (moduleName.match(pattern)) {
        continue;
      }

      let isFailure = true;
      for (const sourceName of Object.keys(sources)) {
        if (this.getSourceFile().fileName.match(sourceName)) {
          if (moduleName.match(sources[sourceName])) {
            isFailure = false;
            break;
          }
        }
      }

      if (isFailure) {
        this.addFailureAt(
          i.getStart(),
          i.getWidth(),
          `The import ${JSON.stringify(moduleName)} is not allowed to be imported.`,
        );
      }
    }
  }
}
