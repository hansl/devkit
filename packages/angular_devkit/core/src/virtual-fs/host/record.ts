/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from 'rxjs/Observable';
import { NormalizedSep, Path } from '../path';
import { FileBuffer, Host, ReadonlyHost } from './interface';
import { SimpleMemoryHost } from './memory';
import { from } from 'rxjs/observable/from';
import { concat, ignoreElements, mergeMap, switchMap } from 'rxjs/operators';
import { InvalidStateException } from '../../exception/exception';


export class RecordHost extends SimpleMemoryHost {
  protected _toCreate = new Set<Path>();
  protected _toOverwrite = new Set<Path>();
  protected _toRename = new Map<Path, Path>();
  protected _toRenameRevert = new Map<Path, Path>();
  protected _toDelete = new Set<Path>();

  constructor(protected _base: ReadonlyHost) { super(); }

  write(path: Path, content: FileBuffer): Observable<void> {
    if (this._exists(path)) {
      // Simplest case, the file has already been created, renamed or overwritten.
      // If it was renamed we need to add it to the overwritten array.
      if (this._toRenameRevert.has(path)) {
        this._toOverwrite.add(path);
      }

      return super.write(path, content);
    } else if (this._toDelete.has(path)) {
      this._toDelete.delete(path);
      this._toOverwrite.add(path);

      return super.write(path, content);
    }

    this._toOverwrite.add(path);

    return super.write(path, content);
  }
  delete(path: Path): Observable<void> {
    if (this._exists(path)) {
      return super.delete(path);
    }

    for (const [cachePath, _] of this._cache.entries()) {
      if (path.startsWith(cachePath + NormalizedSep)) {
        this._toDelete.add(path);
      }
    }

    return super.delete(path);
  }
  rename(from: Path, to: Path): Observable<void> {

  }

  stats() {
    return null;
  }
  watch() {
    return null;
  }

  commit(host: Host): Observable<void> {
    return from([...this._toDelete.values()]).pipe(
      mergeMap(path => host.delete(path)),
      ignoreElements(),
    ).pipe(
      concat(from([...this._toCreate.values()])),
      mergeMap<Path, void>(path => {
        const maybeFileBuffer = this._cache.get(path);
        if (!maybeFileBuffer) {
          throw new InvalidStateException('This should not happen.');
        }

        return host.write(path, maybeFileBuffer);
      }),
      ignoreElements(),
    ).pipe(
      concat(from([...this._toRename.entries()])),
      mergeMap<[Path, Path], void>(([from, to]) => {
        return host.rename(from, to);
      }),
    ).pipe(
      concat(from([...this._toOverwrite.values()])),
      mergeMap<Path, void>(path => {
        const maybeFileBuffer = this._cache.get(path);
        if (!maybeFileBuffer) {
          throw new InvalidStateException('This should not happen.');
        }

        return host.write(path, maybeFileBuffer);
      }),
    );
  }
}
