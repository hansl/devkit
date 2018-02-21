export default {
  "$schema": "http://json-schema.org/schema",
  "id": "BuildFacaceWorkspaceSchema",
  "title": "Workspace schema for validating a Architect workspace configuration file.",
  "type": "object",
  "properties": {
    "$schema": {
      "type": "string",
      "description": "Link to schema."
    },
    "name": {
      "type": "string",
      "description": "Workspace name."
    },
    "version": {
      "type": "number",
      "description": "Workspace Schema version."
    },
    "root": {
      "type": "string",
      "description": "Workspace root.",
      "default": "./"
    },
    "defaultProject": {
      "type": "string",
      "description": "Default target to run."
    },
    "projects": {
      "type": "object",
      "description": "A map of project names to project options.",
      "additionalProperties": {
        "$ref": "#/definitions/project"
      }
    }
  },
  "additionalProperties": false,
  "required": [
    "name",
    "version",
    "projects"
  ],
  "definitions": {
    "project": {
      "type": "object",
      "description": "Project options.",
      "properties": {
        "defaultTarget": {
          "type": "string",
          "description": "Default target to run."
        },
        "projectType": {
          "type": "string",
          "description": "Project type.",
          "enum": [
            "application",
            "library"
          ]
        },
        "root": {
          "type": "string",
          "description": "Root of the project sourcefiles."
        },
        "targets": {
          "type": "object",
          "description": "A map of available project targets.",
          "additionalProperties": {
            "$ref": "#/definitions/target"
          }
        }
      },
      "additionalProperties": false,
      "required": [
        "projectType",
        "root"
      ]
    },
    "target": {
      "type": "object",
      "description": "Target options.",
      "properties": {
        "builder": {
          "type": "string",
          "description": "The builder used for this package."
        },
        "options": {
          "$ref": "#/definitions/options"
        },
        "configurations": {
          "type": "object",
          "description": "A map of alternative target options.",
          "additionalProperties": {
            "$ref": "#/definitions/options"
          }
        }
      },
      "required": [
        "builder",
        "options"
      ]
    },
    "options": {
      "type": "object",
      "description": "Target options."
    }
  }
};
