# Airtable Node

Interact with Airtable bases, tables, and records. Create, read, update, and delete records with support for filtering, sorting, and batch operations.

## Features

- **Record Operations**: Create, read, update, and delete records
- **List Records**: Query records with filtering and sorting
- **Base Operations**: List bases and tables
- **Template Expressions**: Use `{{json.field}}` for dynamic content
- **Automatic Retry Logic**: Built-in retry mechanism for rate limits
- **Error Handling**: Comprehensive error messages and logging

## Authentication

### Personal Access Token (Recommended)
1. Go to https://airtable.com/create/tokens
2. Create a new token with appropriate scopes
3. Copy the token and paste it in the credentials

### API Key (Legacy)
1. Go to https://airtable.com/account
2. Copy your API key
3. Use it in the credentials

## Resources

### Record
Perform CRUD operations on individual records.

**Operations:**
- **Create Record**: Create a new record with specified fields
- **Read Record**: Retrieve a specific record by ID
- **Update Record**: Update fields in an existing record
- **Delete Record**: Delete a record
- **List Records**: Query multiple records with filtering and sorting

### Base
Work with Airtable bases and their metadata.

**Operations:**
- **List Bases**: Get all accessible bases
- **Get Base**: Retrieve base information and tables
- **List Tables**: Get all tables in a base with field definitions

## Usage Examples

### Create a Record
```
Resource: Record
Operation: Create Record
Base ID: appXXXXXXXXXXXXXX
Table Name: Contacts
Fields: {"Name": "John Doe", "Email": "john@example.com"}
```

### List Records with Filter
```
Resource: Record
Operation: List Records
Base ID: appXXXXXXXXXXXXXX
Table Name: Contacts
Filter Formula: {Status} = "Active"
Sort Field: Name
Sort Direction: Ascending
Limit: 50
```

### Update a Record
```
Resource: Record
Operation: Update Record
Base ID: appXXXXXXXXXXXXXX
Table Name: Contacts
Record ID: recXXXXXXXXXXXXXX
Update Fields: {"Status": "Inactive"}
```

## Template Expressions

Use template expressions to reference data from previous nodes:

```
Base ID: {{json.baseId}}
Table Name: {{json.tableName}}
Record ID: {{json.recordId}}
```

## Trigger

The Airtable Trigger monitors a table for new records using polling.

**Configuration:**
- **Base ID**: The Airtable base to monitor
- **Table Name**: The table to watch
- **Polling Interval**: How often to check (minimum 30 seconds)
- **Filter Formula**: Optional filter to limit which records trigger the workflow

## Error Handling

The node includes comprehensive error handling:

- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Base, table, or record not found
- **422 Unprocessable Entity**: Invalid request data
- **429 Too Many Requests**: Rate limited (automatic retry)

## Rate Limiting

Airtable has rate limits. The node automatically retries failed requests with exponential backoff:

- Default max retries: 3
- Default retry delay: 1000ms (exponential backoff)
- Configurable in Options

## Tips

1. **Base ID**: Find in the URL when viewing your base (e.g., `https://airtable.com/appXXXXXXXXXXXXXX`)
2. **Table Name**: Use the exact table name as shown in Airtable
3. **Record ID**: Visible in the record details or API responses
4. **Filter Formula**: Use Airtable's formula syntax (e.g., `{Status} = "Active"`)
5. **Fields**: Use exact field names as defined in your table

## Limitations

- Polling trigger has a minimum interval of 30 seconds
- Airtable API rate limits apply (5 requests per second for most plans)
- Large batch operations may require pagination

## Support

For issues or questions, refer to:
- [Airtable API Documentation](https://airtable.com/api)
- [Airtable Support](https://support.airtable.com)
