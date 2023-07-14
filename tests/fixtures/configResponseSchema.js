const configResponseSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
    "transform_name": { "type": "string" },
    "fme_workspace_id": { "type": "string" },
    "enabled": { "type": "boolean" },
    "source_datasets": {
        "type": "array",
        "items": {
        "type": "object",
        "properties": {
            "dataset_id": { "type": "string" },
            "dataset_name": { "type": "string" },
            "dataset_path": { "type": ["string", "null"] },
            "version": { "type": ["integer", "null"] }
        },
        "required": ["dataset_id", "dataset_name"]
        }
    },
    "destination_datasets": {
        "type": "array",
        "items": {
        "type": "object",
        "properties": {
            "dataset_id": { "type": "string" },
            "dataset_name": { "type": "string" },
            "dataset_path": { "type": ["string", "null"] },
            "version": { "type": ["integer", "null"] }
        },
        "required": ["dataset_id", "dataset_name"]
        }
    },
    "custodian": { "type": "string" },
    "source_organisation": { "type": "string" },
    "transform_id": { "type": "string" },
    "version": { "type": "integer" },
    "latest_version": { "type": "integer" },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
    },
    "required": [
    "transform_name",
    "fme_workspace_id",
    "enabled",
    "source_datasets",
    "destination_datasets",
    "custodian",
    "source_organisation",
    "transform_id",
    "version",
    "latest_version",
    "created_at",
    "updated_at"
    ]
}

export { configResponseSchema }