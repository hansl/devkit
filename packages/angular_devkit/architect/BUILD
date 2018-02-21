# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

licenses(["notice"])  # MIT

load("//tools:defaults.bzl", "ts_library", "jasmine_node_test")

package(default_visibility = ["//visibility:public"])

ts_library(
    name = "architect",
    srcs = glob(
        ["**/*.ts"],
        exclude = [
            "**/*_spec.ts",
        ],
    ),
    deps = [
        "//packages/angular_devkit/core",
        "//packages/angular_devkit/core:node",
    ],
    data = glob(["src/**/*.json"])
)

ts_library(
    name = "spec-lib",
    srcs = glob(
        include = ["**/*_spec.ts"],
    ),
    deps = [
        ":architect",
        "//packages/angular_devkit/core",
        "//packages/angular_devkit/core:node",
    ],
)

jasmine_node_test(
    name = "spec",
    deps = [
        ":spec-lib",
    ],
)
