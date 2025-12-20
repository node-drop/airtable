const AirtableCredentials = require("./credentials/airtable.credentials");
const AirtableNode = require("./nodes/airtable.node");
const AirtableTriggerNode = require("./nodes/airtable-trigger.node");

module.exports = {
  credentials: [AirtableCredentials],
  nodes: [AirtableNode, AirtableTriggerNode],
};
