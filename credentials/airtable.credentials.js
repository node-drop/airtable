/**
 * Airtable API Credentials
 * 
 * Supports authentication via:
 * - Personal Access Token (PAT)
 * - API Key (Legacy)
 */

const AirtableCredentials = {
  name: "airtable",
  displayName: "Airtable",
  documentationUrl: "https://airtable.com/api",
  icon: "fa:table",
  color: "#eee",
  testable: true,
  properties: [
    {
      displayName: "Authentication Type",
      name: "authenticationType",
      type: "options",
      default: "pat",
      description: "Choose authentication method",
      options: [
        {
          name: "Personal Access Token",
          value: "pat",
        },
        {
          name: "API Key (Legacy)",
          value: "apiKey",
        },
      ],
    },
    {
      displayName: "Personal Access Token",
      name: "accessToken",
      type: "string",
      typeOptions: {
        password: true,
      },
      required: true,
      default: "",
      placeholder: "pat...",
      description: "Airtable Personal Access Token. Create at https://airtable.com/create/tokens",
      displayOptions: {
        show: {
          authenticationType: ["pat"],
        },
      },
    },
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      required: true,
      default: "",
      placeholder: "key...",
      description: "Airtable API Key (Legacy). Create at https://airtable.com/account",
      displayOptions: {
        show: {
          authenticationType: ["apiKey"],
        },
      },
    },
  ],

  /**
   * Test the Airtable API connection
   */
  async test(data) {
    if (!data.accessToken && !data.apiKey) {
      return {
        success: false,
        message: "Access token or API key is required",
      };
    }

    try {
      const axios = require("axios");
      const token = data.accessToken || data.apiKey;
      const authHeader = data.authenticationType === "pat" 
        ? `Bearer ${token}`
        : token;

      const response = await axios.get("https://api.airtable.com/v0/meta/bases", {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        return {
          success: true,
          message: `Connected successfully to Airtable`,
        };
      }

      return {
        success: false,
        message: "Connection test failed",
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return {
          success: false,
          message: "Invalid token. Please check your Airtable credentials.",
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: "Access forbidden. Check your token permissions.",
        };
      } else if (error.code === "ECONNREFUSED") {
        return {
          success: false,
          message: "Cannot connect to Airtable API. Please check your internet connection.",
        };
      } else if (error.code === "ETIMEDOUT") {
        return {
          success: false,
          message: "Connection timeout. Airtable API is not responding.",
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${error.message || "Unknown error"}`,
        };
      }
    }
  },
};

module.exports = AirtableCredentials;
