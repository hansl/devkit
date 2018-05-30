# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
package(default_visibility = ["//visibility:public"])

load("//tools:defaults.bzl", "ts_library")

licenses(["notice"])  # MIT License

ts_library(
    name = "node",
    srcs = glob(
        include = ["**/*.ts"],
        exclude = [
            "**/*_spec.ts",
            "**/*_spec_large.ts",
        ],
    ),
    module_name = "@angular-devkit/core/node",
    deps = [
        "//packages/angular_devkit/core",
        "@rxjs",
        "@rxjs//operators",
    ],
)

ts_library(
    name = "spec",
    srcs = glob(
        include = [
            "**/*_spec.ts",
            "**/*_spec_large.ts",
        ],
    ),
    deps = [
        "//packages/angular_devkit/core",
        ":node",
        "@rxjs",
        "@rxjs//operators",
        # @typings: jasmine
    ],
)
