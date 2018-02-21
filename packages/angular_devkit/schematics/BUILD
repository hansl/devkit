# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
package(default_visibility = ["//visibility:public"])

load("//tools:defaults.bzl", "ts_library", "jasmine_node_test")

licenses(["notice"])  # MIT License

ts_library(
    name = "schematics",
    srcs = glob(
        include = ["src/**/*.ts"],
        exclude = [
            "src/**/*_spec.ts",
            "src/**/*_benchmark.ts",
        ],
    ),
    module_name = "@angular-devkit/schematics",
    module_root = "src",
    deps = [
        "//packages/angular_devkit/core",
        "//packages/angular_devkit/core:node",  # TODO: get rid of this for 6.0
        # @deps: rxjs
    ],
)

ts_library(
    name = "tasks",
    srcs = glob(
        include = ["tasks/**/*.ts"],
        exclude = [
            "tasks/**/*_spec.ts",
            "tasks/**/*_benchmark.ts",
        ],
    ),
    module_name = "@angular-devkit/schematics/tasks",
    module_root = "tasks",
    tsconfig = "//:tsconfig.json",
    deps = [
        ":schematics",
        "//packages/angular_devkit/core",
        "//packages/angular_devkit/core:node",
        # @deps: rxjs
    ],
)

ts_library(
    name = "tools",
    srcs = glob(
        include = ["tools/**/*.ts"],
        exclude = [
            "tools/**/*_spec.ts",
            "tools/**/*_benchmark.ts",
        ],
    ),
    module_name = "@angular-devkit/schematics/tools",
    module_root = "tools",
    deps = [
        ":schematics",
        "//packages/angular_devkit/core",
        "//packages/angular_devkit/core:node",
        # @deps: rxjs
    ],
)

ts_library(
    name = "testing",
    srcs = glob(
        include = ["testing/**/*.ts"],
        exclude = [],
    ),
    module_name = "@angular-devkit/schematics/testing",
    module_root = "testing",
    deps = [
        ":schematics",
        ":tasks",
        ":tools",
        "//packages/angular_devkit/core",
        # @deps: rxjs
    ],
)

ts_library(
    name = "spec-lib",
    srcs = glob(
        include = ["**/*_spec.ts"],
    ),
    deps = [
         ":schematics",
         ":tasks",
         ":testing",
         ":tools",
         "//packages/angular_devkit/core",
         "//packages/angular_devkit/core:node",
     ],
)

jasmine_node_test(
    name = "spec",
    deps = [
        ":spec-lib",
    ],
    data = [
        "//tests"
    ],
)
