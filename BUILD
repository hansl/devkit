# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
package(default_visibility = ["//visibility:public"])

licenses(["notice"])  # MIT License

exports_files([
    "LICENSE",
    "tsconfig.json",  # @external
])

# NOTE: this will move to node_modules/BUILD in a later release
# @external_begin
filegroup(
    name = "node_modules",
    srcs = glob(
        include = ["node_modules/**/*"],
        # Exclude directories that commonly contain filenames which are
        # illegal bazel labels
        exclude = [
            # e.g. node_modules/adm-zip/test/assets/attributes_test/New folder/hidden.txt
            "node_modules/**/test/**",
            # e.g. node_modules/xpath/docs/function resolvers.md
            "node_modules/**/docs/**",
            # e.g. node_modules/puppeteer/.local-chromium/mac-536395/chrome-mac/Chromium.app/Contents/Versions/66.0.3347.0/Chromium Framework.framework/Chromium Framework
            "node_modules/**/.*/**"
        ],
    ),
)
# @external_end
