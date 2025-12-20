/**
 * Airtable Node
 * 
 * Interact with Airtable bases, tables, and records.
 * Supports creating, reading, updating, and deleting records.
 * 
 * Features:
 * - Create, read, update, and delete records
 * - List records with filtering and sorting
 * - Batch operations
 * - Template expressions for dynamic content
 * - Automatic retry logic for rate limits
 * - Rich error handling
 */

const axios = require("axios");

const AirtableNode = {
  identifier: "airtable",
  nodeCategory: "action",
  displayName: "Airtable",
  name: "airtable",
  group: ["communication", "airtable", "database"],
  version: 1,
  description: "Interact with Airtable bases, tables, and records",
  icon: "file:icon.svg",
  color: "#eee",
  defaults: {
    name: "Airtable",
    operation: "createRecord",
    resource: "record",
  },
  inputs: ["main"],
  outputs: ["main"],
  
  credentials: [
    {
      name: "airtable",
      displayName: "Airtable",
      required: true,
    },
  ],
  
  properties: [
    {
      displayName: "Authentication",
      name: "authentication",
      type: "credential",
      required: true,
      default: "",
      description: "Select Airtable credentials",
      placeholder: "Select credentials...",
      allowedTypes: ["airtable"],
    },
    {
      displayName: "Resource",
      name: "resource",
      type: "options",
      required: true,
      default: "record",
      description: "Resource to work with",
      options: [
        {
          name: "Record",
          value: "record",
          description: "Work with individual records",
        },
        {
          name: "Base",
          value: "base",
          description: "Work with bases",
        },
      ],
    },
    
    // Record Operations
    {
      displayName: "Operation",
      name: "operation",
      type: "options",
      required: true,
      default: "createRecord",
      description: "Operation to perform",
      displayOptions: {
        show: {
          resource: ["record"],
        },
      },
      options: [
        {
          name: "Create Record",
          value: "createRecord",
          description: "Create a new record",
        },
        {
          name: "Read Record",
          value: "readRecord",
          description: "Read a specific record",
        },
        {
          name: "Update Record",
          value: "updateRecord",
          description: "Update an existing record",
        },
        {
          name: "Delete Record",
          value: "deleteRecord",
          description: "Delete a record",
        },
        {
          name: "List Records",
          value: "listRecords",
          description: "List records from a table",
        },
      ],
    },
    
    // Base Operations
    {
      displayName: "Operation",
      name: "operation",
      type: "options",
      required: true,
      default: "listBases",
      description: "Operation to perform",
      displayOptions: {
        show: {
          resource: ["base"],
        },
      },
      options: [
        {
          name: "List Bases",
          value: "listBases",
          description: "List all bases",
        },
        {
          name: "Get Base",
          value: "getBase",
          description: "Get base information",
        },
        {
          name: "List Tables",
          value: "listTables",
          description: "List tables in a base",
        },
      ],
    },
    
    // Common fields
    {
      displayName: "Base ID",
      name: "baseId",
      type: "expression",
      required: true,
      default: "",
      placeholder: "appXXXXXXXXXXXXXX or {{json.baseId}}",
      description: "Airtable Base ID",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["createRecord", "readRecord", "updateRecord", "deleteRecord", "listRecords"],
        },
      },
    },
    {
      displayName: "Base ID",
      name: "baseId",
      type: "expression",
      required: true,
      default: "",
      placeholder: "appXXXXXXXXXXXXXX or {{json.baseId}}",
      description: "Airtable Base ID",
      displayOptions: {
        show: {
          resource: ["base"],
          operation: ["getBase", "listTables"],
        },
      },
    },
    {
      displayName: "Table Name",
      name: "tableName",
      type: "expression",
      required: true,
      default: "",
      placeholder: "Table Name or {{json.table}}",
      description: "Name of the table",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["createRecord", "readRecord", "updateRecord", "deleteRecord", "listRecords"],
        },
      },
    },
    
    // Create Record fields
    {
      displayName: "Fields",
      name: "fields",
      type: "json",
      required: true,
      default: "{}",
      placeholder: '{"Name": "John", "Email": "john@example.com"}',
      description: "Record fields as JSON object",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["createRecord"],
        },
      },
    },
    
    // Read/Update/Delete Record fields
    {
      displayName: "Record ID",
      name: "recordId",
      type: "expression",
      required: true,
      default: "",
      placeholder: "recXXXXXXXXXXXXXX or {{json.recordId}}",
      description: "Airtable Record ID",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["readRecord", "updateRecord", "deleteRecord"],
        },
      },
    },
    {
      displayName: "Update Fields",
      name: "updateFields",
      type: "json",
      required: true,
      default: "{}",
      placeholder: '{"Name": "Jane"}',
      description: "Fields to update",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["updateRecord"],
        },
      },
    },
    
    // List Records fields
    {
      displayName: "Filter Formula",
      name: "filterFormula",
      type: "expression",
      default: "",
      placeholder: '{Name} = "John" or {{json.filter}}',
      description: "Airtable filter formula (optional)",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["listRecords"],
        },
      },
    },
    {
      displayName: "Sort Field",
      name: "sortField",
      type: "expression",
      default: "",
      placeholder: "Name or {{json.sortField}}",
      description: "Field to sort by (optional)",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["listRecords"],
        },
      },
    },
    {
      displayName: "Sort Direction",
      name: "sortDirection",
      type: "options",
      default: "asc",
      description: "Sort direction",
      options: [
        {
          name: "Ascending",
          value: "asc",
        },
        {
          name: "Descending",
          value: "desc",
        },
      ],
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["listRecords"],
        },
      },
    },
    {
      displayName: "Limit",
      name: "limit",
      type: "number",
      default: 100,
      description: "Maximum number of records to return",
      displayOptions: {
        show: {
          resource: ["record"],
          operation: ["listRecords"],
        },
      },
    },
    
    // Options
    {
      displayName: "Options",
      name: "options",
      type: "collection",
      default: {},
      placeholder: "Add Option",
      description: "Additional configuration options",
      options: [
        {
          displayName: "Timeout (ms)",
          name: "timeout",
          type: "number",
          default: 30000,
          description: "Request timeout in milliseconds",
        },
        {
          displayName: "Max Retries",
          name: "maxRetries",
          type: "number",
          default: 3,
          description: "Number of retry attempts for rate limits",
        },
        {
          displayName: "Retry Delay (ms)",
          name: "retryDelay",
          type: "number",
          default: 1000,
          description: "Initial delay between retries (exponential backoff)",
        },
      ],
    },
  ],

  async execute(inputData) {
    const items = inputData.main?.[0] || [];
    const results = [];
    const resource = this.getNodeParameter("resource");
    const operation = this.getNodeParameter("operation");
    const options = this.getNodeParameter("options", {});

    try {
      const credentials = await this.getCredentials("airtable");
      if (!credentials || (!credentials.accessToken && !credentials.apiKey)) {
        throw new Error("Airtable credentials are required. Please configure Airtable credentials.");
      }

      const maxRetries = options.maxRetries !== undefined ? options.maxRetries : 3;
      const retryDelay = options.retryDelay || 1000;
      const timeout = options.timeout || 30000;

      const itemsToProcess = items.length > 0 ? items : [{ json: {} }];

      for (const item of itemsToProcess) {
        try {
          let result;

          if (resource === "record") {
            switch (operation) {
              case "createRecord":
                result = await this.createRecord(item, credentials, timeout, maxRetries, retryDelay);
                break;
              case "readRecord":
                result = await this.readRecord(item, credentials, timeout, maxRetries, retryDelay);
                break;
              case "updateRecord":
                result = await this.updateRecord(item, credentials, timeout, maxRetries, retryDelay);
                break;
              case "deleteRecord":
                result = await this.deleteRecord(item, credentials, timeout, maxRetries, retryDelay);
                break;
              case "listRecords":
                result = await this.listRecords(item, credentials, timeout, maxRetries, retryDelay);
                break;
              default:
                throw new Error(`Unknown operation: ${operation}`);
            }
          } else if (resource === "base") {
            switch (operation) {
              case "listBases":
                result = await this.listBases(credentials, timeout, maxRetries, retryDelay);
                break;
              case "getBase":
                result = await this.getBase(item, credentials, timeout, maxRetries, retryDelay);
                break;
              case "listTables":
                result = await this.listTables(item, credentials, timeout, maxRetries, retryDelay);
                break;
              default:
                throw new Error(`Unknown operation: ${operation}`);
            }
          }

          results.push({ json: result });
        } catch (error) {
          if (this.settings?.continueOnFail) {
            results.push({
              json: {
                success: false,
                error: error.message,
                operation,
                resource,
              },
            });
          } else {
            throw error;
          }
        }
      }

      return [{ main: results }];
    } catch (error) {
      this.logger.error("Airtable Node Error:", {
        operation,
        resource,
        error: error.message,
      });
      throw error;
    }
  },

  async createRecord(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);
    const tableName = this.resolveValue(this.getNodeParameter("tableName"), item.json);
    const fields = this.getNodeParameter("fields");

    if (!baseId || !tableName || !fields) {
      throw new Error("Base ID, table name, and fields are required");
    }

    const payload = {
      records: [
        {
          fields: typeof fields === "string" ? JSON.parse(fields) : fields,
        },
      ],
    };

    this.logger.info("Creating Airtable record", { baseId, tableName });

    const response = await this.makeAirtableRequest(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      payload,
      credentials,
      "POST",
      timeout,
      maxRetries,
      retryDelay
    );

    const record = response.records[0];
    return {
      success: true,
      recordId: record.id,
      fields: record.fields,
      createdTime: record.createdTime,
    };
  },

  async readRecord(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);
    const tableName = this.resolveValue(this.getNodeParameter("tableName"), item.json);
    const recordId = this.resolveValue(this.getNodeParameter("recordId"), item.json);

    if (!baseId || !tableName || !recordId) {
      throw new Error("Base ID, table name, and record ID are required");
    }

    this.logger.info("Reading Airtable record", { baseId, tableName, recordId });

    const response = await this.makeAirtableRequest(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
      null,
      credentials,
      "GET",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      recordId: response.id,
      fields: response.fields,
      createdTime: response.createdTime,
    };
  },

  async updateRecord(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);
    const tableName = this.resolveValue(this.getNodeParameter("tableName"), item.json);
    const recordId = this.resolveValue(this.getNodeParameter("recordId"), item.json);
    const updateFields = this.getNodeParameter("updateFields");

    if (!baseId || !tableName || !recordId || !updateFields) {
      throw new Error("Base ID, table name, record ID, and update fields are required");
    }

    const payload = {
      records: [
        {
          id: recordId,
          fields: typeof updateFields === "string" ? JSON.parse(updateFields) : updateFields,
        },
      ],
    };

    this.logger.info("Updating Airtable record", { baseId, tableName, recordId });

    const response = await this.makeAirtableRequest(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      payload,
      credentials,
      "PATCH",
      timeout,
      maxRetries,
      retryDelay
    );

    const record = response.records[0];
    return {
      success: true,
      recordId: record.id,
      fields: record.fields,
    };
  },

  async deleteRecord(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);
    const tableName = this.resolveValue(this.getNodeParameter("tableName"), item.json);
    const recordId = this.resolveValue(this.getNodeParameter("recordId"), item.json);

    if (!baseId || !tableName || !recordId) {
      throw new Error("Base ID, table name, and record ID are required");
    }

    this.logger.info("Deleting Airtable record", { baseId, tableName, recordId });

    await this.makeAirtableRequest(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`,
      null,
      credentials,
      "DELETE",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      recordId,
      deleted: true,
    };
  },

  async listRecords(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);
    const tableName = this.resolveValue(this.getNodeParameter("tableName"), item.json);
    const filterFormula = this.resolveValue(this.getNodeParameter("filterFormula", ""), item.json);
    const sortField = this.resolveValue(this.getNodeParameter("sortField", ""), item.json);
    const sortDirection = this.getNodeParameter("sortDirection", "asc");
    const limit = this.getNodeParameter("limit", 100);

    if (!baseId || !tableName) {
      throw new Error("Base ID and table name are required");
    }

    let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=${limit}`;
    
    if (filterFormula) {
      url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
    }
    
    if (sortField) {
      url += `&sort[0][field]=${encodeURIComponent(sortField)}&sort[0][direction]=${sortDirection}`;
    }

    this.logger.info("Listing Airtable records", { baseId, tableName, limit });

    const response = await this.makeAirtableRequest(
      url,
      null,
      credentials,
      "GET",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      count: response.records.length,
      records: response.records.map(record => ({
        recordId: record.id,
        fields: record.fields,
        createdTime: record.createdTime,
      })),
    };
  },

  async listBases(credentials, timeout, maxRetries, retryDelay) {
    this.logger.info("Listing Airtable bases");

    const response = await this.makeAirtableRequest(
      "https://api.airtable.com/v0/meta/bases",
      null,
      credentials,
      "GET",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      count: response.bases.length,
      bases: response.bases.map(base => ({
        id: base.id,
        name: base.name,
      })),
    };
  },

  async getBase(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);

    if (!baseId) {
      throw new Error("Base ID is required");
    }

    this.logger.info("Getting Airtable base", { baseId });

    const response = await this.makeAirtableRequest(
      `https://api.airtable.com/v0/meta/bases/${baseId}`,
      null,
      credentials,
      "GET",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      id: response.id,
      name: response.name,
      tables: response.tables.map(table => ({
        id: table.id,
        name: table.name,
      })),
    };
  },

  async listTables(item, credentials, timeout, maxRetries, retryDelay) {
    const baseId = this.resolveValue(this.getNodeParameter("baseId"), item.json);

    if (!baseId) {
      throw new Error("Base ID is required");
    }

    this.logger.info("Listing Airtable tables", { baseId });

    const response = await this.makeAirtableRequest(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      null,
      credentials,
      "GET",
      timeout,
      maxRetries,
      retryDelay
    );

    return {
      success: true,
      count: response.tables.length,
      tables: response.tables.map(table => ({
        id: table.id,
        name: table.name,
        fields: table.fields.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type,
        })),
      })),
    };
  },

  async makeAirtableRequest(url, data, credentials, method = "GET", timeout, maxRetries, retryDelay) {
    const token = credentials.accessToken || credentials.apiKey;
    const authHeader = credentials.authenticationType === "pat" 
      ? `Bearer ${token}`
      : token;

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const config = {
          method,
          url,
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          timeout,
        };

        if (data) {
          config.data = data;
        }

        const response = await axios(config);
        return response.data;
      } catch (error) {
        lastError = error;

        // Check if it's a rate limit error
        if (error.response?.status === 429 && attempt < maxRetries) {
          const waitTime = retryDelay * Math.pow(2, attempt);
          this.logger.warn(`Rate limited. Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Don't retry on other errors
        if (error.response?.status !== 429) {
          break;
        }
      }
    }

    if (lastError.response?.status === 401) {
      throw new Error("Invalid Airtable credentials. Please check your token.");
    } else if (lastError.response?.status === 403) {
      throw new Error("Access forbidden. Check your token permissions.");
    } else if (lastError.response?.status === 404) {
      throw new Error("Resource not found. Check your base ID, table name, or record ID.");
    } else if (lastError.response?.status === 422) {
      throw new Error(`Invalid request: ${lastError.response.data?.error?.message || "Unknown error"}`);
    } else {
      throw new Error(`Airtable API error: ${lastError.message}`);
    }
  },

  resolveValue(value, context = {}) {
    if (typeof value === "string" && value.includes("{{")) {
      // Simple template expression resolution
      return value.replace(/\{\{json\.(\w+)\}\}/g, (match, key) => context[key] || "");
    }
    return value;
  },
};

module.exports = AirtableNode;
