#!/usr/bin/env node
/**
 * JSON Schema Validator for Georgia Legislation Data
 * Validates output.json against the schema defined in docs/DATA_SCHEMA.md
 *
 * Usage:
 *   node scripts/validate-schema.js [input-file]
 *   node scripts/validate-schema.js ga_legislation.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schema definition
const BILL_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    required: ['doc_number', 'caption', 'sponsors', 'detail_url', 'status_history'],
    properties: {
      doc_number: {
        type: 'string',
        pattern: '^(HB|SB)\\d+$',
        description: 'Bill identifier (e.g., "HB 123", "SB 456")'
      },
      caption: {
        type: 'string',
        minLength: 1,
        description: 'Short title or description of the bill'
      },
      sponsors: {
        type: 'array',
        minItems: 1,
        items: { type: 'string' },
        description: 'Array of sponsor names'
      },
      committees: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of committee names (optional)'
      },
      detail_url: {
        type: 'string',
        format: 'uri',
        description: 'URL to bill details page'
      },
      status_history: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['date', 'status'],
          properties: {
            date: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'ISO 8601 date (YYYY-MM-DD)'
            },
            status: {
              type: 'string',
              minLength: 1,
              description: 'Status update (e.g., "Introduced", "Passed")'
            }
          }
        },
        description: 'Array of status changes in chronological order'
      }
    }
  }
};

/**
 * Validate a bill object against the schema
 * @param {object} bill - Bill object to validate
 * @param {number} index - Bill index for error reporting
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateBill(bill, index) {
  const errors = [];

  // Check required fields
  const requiredFields = ['doc_number', 'caption', 'sponsors', 'detail_url', 'status_history'];
  requiredFields.forEach(field => {
    if (!(field in bill)) {
      errors.push(`  [Bill ${index}] Missing required field: "${field}"`);
    }
  });

  // Validate doc_number format
  if (bill.doc_number && !/^(HB|SB)\d+$/.test(bill.doc_number)) {
    errors.push(
      `  [Bill ${index}] Invalid doc_number format: "${bill.doc_number}" (expected "HB123" or "SB456")`
    );
  }

  // Validate caption
  if (bill.caption && typeof bill.caption !== 'string') {
    errors.push(`  [Bill ${index}] caption must be a string`);
  }
  if (bill.caption && bill.caption.trim().length === 0) {
    errors.push(`  [Bill ${index}] caption cannot be empty`);
  }

  // Validate sponsors
  if (bill.sponsors && !Array.isArray(bill.sponsors)) {
    errors.push(`  [Bill ${index}] sponsors must be an array`);
  }
  if (Array.isArray(bill.sponsors) && bill.sponsors.length === 0) {
    errors.push(`  [Bill ${index}] sponsors array cannot be empty`);
  }
  if (Array.isArray(bill.sponsors)) {
    bill.sponsors.forEach((sponsor, i) => {
      if (typeof sponsor !== 'string') {
        errors.push(`  [Bill ${index}] sponsors[${i}] must be a string`);
      }
    });
  }

  // Validate committees (optional)
  if (bill.committees && !Array.isArray(bill.committees)) {
    errors.push(`  [Bill ${index}] committees must be an array`);
  }

  // Validate detail_url
  if (bill.detail_url) {
    try {
      new URL(bill.detail_url);
    } catch {
      errors.push(
        `  [Bill ${index}] detail_url is not a valid URL: "${bill.detail_url}"`
      );
    }
  }

  // Validate status_history
  if (bill.status_history && !Array.isArray(bill.status_history)) {
    errors.push(`  [Bill ${index}] status_history must be an array`);
  }
  if (Array.isArray(bill.status_history) && bill.status_history.length === 0) {
    errors.push(`  [Bill ${index}] status_history array cannot be empty`);
  }
  if (Array.isArray(bill.status_history)) {
    bill.status_history.forEach((entry, i) => {
      if (!entry.date || !entry.status) {
        errors.push(
          `  [Bill ${index}] status_history[${i}] must have "date" and "status" fields`
        );
      }
      if (entry.date && !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        errors.push(
          `  [Bill ${index}] status_history[${i}].date must be ISO 8601 format (YYYY-MM-DD), got: "${entry.date}"`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate JSON file against schema
 * @param {string} filePath - Path to JSON file
 * @returns {object} { isValid: boolean, errors: string[], stats: object }
 */
function validateFile(filePath) {
  const errors = [];

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      errors: [`File not found: ${filePath}`],
      stats: {}
    };
  }

  let data;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(content);
  } catch (error) {
    return {
      isValid: false,
      errors: [`Invalid JSON: ${error.message}`],
      stats: {}
    };
  }

  // Validate root is an array
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Root element must be an array of bill objects'],
      stats: { totalBills: 0 }
    };
  }

  // Validate each bill
  let validCount = 0;
  data.forEach((bill, index) => {
    const validation = validateBill(bill, index);
    if (validation.isValid) {
      validCount++;
    } else {
      errors.push(...validation.errors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      totalBills: data.length,
      validBills: validCount,
      invalidBills: data.length - validCount
    }
  };
}

// Main execution
const filePath = process.argv[2] || 'ga_legislation.json';
const result = validateFile(filePath);

console.log(`\n📋 JSON Schema Validation Report`);
console.log(`================================\n`);
console.log(`File: ${filePath}`);
console.log(`Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n`);

if (result.stats.totalBills !== undefined) {
  console.log(`Statistics:`);
  console.log(`  Total Bills: ${result.stats.totalBills}`);
  console.log(`  Valid Bills: ${result.stats.validBills}`);
  console.log(`  Invalid Bills: ${result.stats.invalidBills}\n`);
}

if (result.errors.length > 0) {
  console.log(`Errors Found:\n`);
  result.errors.forEach(error => console.log(error));
  console.log();
}

process.exit(result.isValid ? 0 : 1);
