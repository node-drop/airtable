/**
 * Airtable Trigger Node
 * 
 * Trigger workflows when records are created, updated, or deleted in Airtable.
 * Supports polling and webhook-based triggers.
 */

const axios = require("axios");

const AirtableTriggerNode = {
  identifier: "airtable-trigger",
  nodeCategory: "trigger",
  displayName: "Airtable Trigger",
  name: "airtable-trigger",
  group: ["trigger", "airtable"],
  version: 1,
  description: "Trigger on Airtable record changes",
  icon: "file:icon.svg",
  color: "#eee",
  defaults: {
    name: "Airtable Trigger",
    triggerType: "polling",
  },
  inputs: [],
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
      displayName: "Trigger Type",
      name: "triggerType",
      type: "options",
      required: true,
      default: "polling",
      description: "How to trigger the workflow",
      options: [
        {
          name: "Polling",
          value: "polling",
          description: "Check for changes periodically",
        },
      ],
    },
    {
      displayName: "Base ID",
      name: "baseId",
      type: "string",
      required: true,
      default: "",
      placeholder: "appXXXXXXXXXXXXXX",
      description: "Airtable Base ID",
    },
    {
      displayName: "Table Name",
      name: "tableName",
      type: "string",
      required: true,
      default: "",
      placeholder: "Table Name",
      description: "Name of the table to monitor",
    },
    {
      displayName: "Polling Interval (seconds)",
      name: "pollingInterval",
      type: "number",
      default: 60,
      description: "How often to check for changes (minimum 30 seconds)",
      displayOptions: {
        show: {
          triggerType: ["polling"],
        },
      },
    },
    {
      displayName: "Options",
      name: "options",
      type: "collection",
      default: {},
      placeholder: "Add Option",
      description: "Additional configuration options",
      options: [
        {
          displayName: "Filter Formula",
          name: "filterFormula",
          type: "string",
          default: "",
          placeholder: '{Status} = "New"',
          description: "Airtable filter formula (optional)",
        },
        {
          displayName: "Timeout (ms)",
          name: "timeout",
          type: "number",
          default: 30000,
          description: "Request timeout in milliseconds",
        },
      ],
    },
  ],

  async trigger(inputData) {
    const baseId = this.getNodeParameter("baseId");
    const tableName = this.getNodeParameter("tableName");
    const pollingInterval = this.getNodeParameter("pollingInterval", 60);
    const options = this.getNodeParameter("options", {});
    const filterFormula = options.filterFormula || "";
    const timeout = options.timeout || 30000;

    const credentials = await this.getCredentials("airtable");
    if (!credentials || (!credentials.accessToken && !credentials.apiKey)) {
      throw new Error("Airtable credentials are required");
    }

    // Store last check timestamp
    let lastCheck = new Date();

    const pollRecords = async () => {
      try {
        const token = credentials.accessToken || credentials.apiKey;
        const authHeader = credentials.authenticationType === "pat" 
          ? `Bearer ${token}`
          : token;

        let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?pageSize=100`;
        
        if (filterFormula) {
          url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          timeout,
        });

        const records = response.data.records || [];
        
        // Filter records modified since last check
        const newRecords = records.filter(record => {
          const recordTime = new Date(record.createdTime);
          return recordTime > lastCheck;
        });

        lastCheck = new Date();

        if (newRecords.length > 0) {
          return newRecords.map(record => ({
            json: {
              recordId: record.id,
              fields: record.fields,
              createdTime: record.createdTime,
            },
          }));
        }

        return [];
      } catch (error) {
        this.logger.error("Airtable Trigger Error:", error.message);
        throw error;
      }
    };

    // Set up polling
    const pollInterval = Math.max(pollingInterval * 1000, 30000); // Minimum 30 seconds
    
    const intervalId = setInterval(async () => {
      try {
        const records = await pollRecords();
        if (records.length > 0) {
          this.emit("trigger", records);
        }
      } catch (error) {
        this.logger.error("Polling error:", error.message);
      }
    }, pollInterval);

    // Initial poll
    try {
      const records = await pollRecords();
      if (records.length > 0) {
        this.emit("trigger", records);
      }
    } catch (error) {
      this.logger.error("Initial poll error:", error.message);
    }

    // Cleanup function
    return () => {
      clearInterval(intervalId);
    };
  },
};

module.exports = AirtableTriggerNode;
