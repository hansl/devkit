/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable } from 'rxjs/Observable';
import { Path, PathFragment } from '../path';


export declare type FileBuffer = ArrayBuffer & {
  __PRIVATE_DEVKIT_FILE_BUFFER: void;
};

export interface HostWatchOptions {
  readonly persistent?: boolean;
  readonly recursive?: boolean;
}


export const enum HostWatchEventType {
  Changed = 0,
  Created = 1,
  Deleted = 2,
  Renamed = 3,  // Applied to the original file path.
}

export type Stats<T extends object> = T & {
  isFile(): boolean;
  isDirectory(): boolean;

  readonly size: number;

  readonly atime: Date;
  readonly mtime: Date;
  readonly ctime: Date;
  readonly birthtime: Date;
};

export interface HostWatchEvent {
  readonly time: Date;
  readonly type: HostWatchEventType;
  readonly path: Path;
}

export interface HostCapabilities {
  synchronous: boolean;
}

export interface Visitor {
  (path: Path, )
}

export interface ReadonlyHost<StatsT extends object = {}> {
  readonly capabilities: HostCapabilities;

  read(path: Path): Observable<FileBuffer>;
  list(path: Path): Observable<PathFragment[]>;

  exists(path: Path): Observable<boolean>;
  isDirectory(path: Path): Observable<boolean>;
  isFile(path: Path): Observable<boolean>;

  // Some hosts may not support stats.
  stats(path: Path): Observable<Stats<StatsT>> | null;

  // Some hosts may not support watching.
  watch(path: Path, options?: HostWatchOptions): Observable<HostWatchEvent> | null;
}

export interface Host<StatsT extends object = {}> extends ReadonlyHost<StatsT> {
  write(path: Path, content: FileBuffer): Observable<void>;
  delete(path: Path): Observable<void>;
  rename(from: Path, to: Path): Observable<void>;
}
