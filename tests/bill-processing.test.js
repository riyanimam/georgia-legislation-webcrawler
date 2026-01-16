import { describe, it, expect, beforeEach } from 'vitest';

// Mock data for testing
const mockBill = {
  doc_number: 'HB 1',
  caption: 'Test Bill',
  sponsors: ['John Doe'],
  committees: ['Judiciary'],
  detail_url: 'https://example.com',
  status_history: [
    { date: '2024-01-01', status: 'Introduced' }
  ]
};

// Tests for bill data validation
describe('Bill Data Validation', () => {
  it('should accept valid bill data', () => {
    const isValid = validateBill(mockBill);
    expect(isValid).toBe(true);
  });

  it('should reject bill without doc_number', () => {
    const invalidBill = { ...mockBill };
    delete invalidBill.doc_number;
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should reject bill without caption', () => {
    const invalidBill = { ...mockBill };
    delete invalidBill.caption;
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should reject bill without sponsors array', () => {
    const invalidBill = { ...mockBill };
    delete invalidBill.sponsors;
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should reject bill with empty sponsors', () => {
    const invalidBill = { ...mockBill, sponsors: [] };
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should reject bill with invalid detail_url', () => {
    const invalidBill = { ...mockBill, detail_url: 'not-a-url' };
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should reject bill with empty status_history', () => {
    const invalidBill = { ...mockBill, status_history: [] };
    const isValid = validateBill(invalidBill);
    expect(isValid).toBe(false);
  });

  it('should accept bill with committees (required)', () => {
    const isValid = validateBill(mockBill);
    expect(isValid).toBe(true);
  });

  it('should accept bill with empty committees (optional)', () => {
    const billNoCommittees = { ...mockBill, committees: [] };
    const isValid = validateBill(billNoCommittees);
    expect(isValid).toBe(true);
  });
});

// Tests for bill filtering
describe('Bill Filtering', () => {
  let bills;

  beforeEach(() => {
    bills = [
      { ...mockBill, doc_number: 'HB 1' },
      { ...mockBill, doc_number: 'SB 1' },
      { ...mockBill, doc_number: 'HB 2' },
      { ...mockBill, doc_number: 'SB 2' }
    ];
  });

  it('should filter bills by HB prefix', () => {
    const filtered = filterBills(bills, { hbOnly: true });
    expect(filtered.length).toBe(2);
    expect(filtered.every(b => b.doc_number.startsWith('HB'))).toBe(true);
  });

  it('should filter bills by SB prefix', () => {
    const filtered = filterBills(bills, { sbOnly: true });
    expect(filtered.length).toBe(2);
    expect(filtered.every(b => b.doc_number.startsWith('SB'))).toBe(true);
  });

  it('should search by caption text', () => {
    bills[0].caption = 'Education Reform Act';
    bills[1].caption = 'Healthcare Bill';
    const filtered = filterBills(bills, { searchTerm: 'Education' });
    expect(filtered.length).toBe(1);
    expect(filtered[0].caption).toContain('Education');
  });

  it('should filter by status', () => {
    bills[0].status_history = [{ date: '2024-01-01', status: 'Passed' }];
    bills[1].status_history = [{ date: '2024-01-01', status: 'Introduced' }];
    const filtered = filterBills(bills, { statuses: ['Passed'] });
    expect(filtered.length).toBe(1);
    expect(filtered[0].status_history[0].status).toBe('Passed');
  });

  it('should return all bills when no filters applied', () => {
    const filtered = filterBills(bills, {});
    expect(filtered.length).toBe(4);
  });

  it('should handle case-insensitive search', () => {
    bills[0].caption = 'Test Bill About EDUCATION';
    const filtered = filterBills(bills, { searchTerm: 'education' });
    expect(filtered.length).toBe(1);
  });
});

// Tests for latest status extraction
describe('Latest Status Extraction', () => {
  it('should return latest status from history', () => {
    const bill = {
      ...mockBill,
      status_history: [
        { date: '2024-01-01', status: 'Introduced' },
        { date: '2024-02-01', status: 'Committee Review' },
        { date: '2024-03-01', status: 'Passed' }
      ]
    };
    const status = getLatestStatus(bill);
    expect(status).toBe('Passed');
  });

  it('should return only status when history has one entry', () => {
    const status = getLatestStatus(mockBill);
    expect(status).toBe('Introduced');
  });

  it('should return "Unknown" when status_history is empty', () => {
    const bill = { ...mockBill, status_history: [] };
    const status = getLatestStatus(bill);
    expect(status).toBe('Unknown');
  });

  it('should return "Unknown" when status_history is missing', () => {
    const bill = { ...mockBill };
    delete bill.status_history;
    const status = getLatestStatus(bill);
    expect(status).toBe('Unknown');
  });
});

// Helper function for validation (mirrors backend validation logic)
function validateBill(bill) {
  if (!bill.doc_number || typeof bill.doc_number !== 'string') return false;
  if (!bill.caption || typeof bill.caption !== 'string') return false;
  if (!Array.isArray(bill.sponsors) || bill.sponsors.length === 0) return false;
  if (!Array.isArray(bill.committees)) return false;
  if (!bill.detail_url || !isValidUrl(bill.detail_url)) return false;
  if (!Array.isArray(bill.status_history) || bill.status_history.length === 0) return false;
  return true;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper function for filtering
function filterBills(bills, filters) {
  return bills.filter(bill => {
    if (filters.hbOnly && !bill.doc_number.startsWith('HB')) return false;
    if (filters.sbOnly && !bill.doc_number.startsWith('SB')) return false;
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      if (!bill.caption.toLowerCase().includes(term)) return false;
    }
    if (filters.statuses && filters.statuses.length > 0) {
      const status = getLatestStatus(bill);
      if (!filters.statuses.includes(status)) return false;
    }
    return true;
  });
}

// Helper function for latest status
function getLatestStatus(bill) {
  if (!bill.status_history || bill.status_history.length === 0) {
    return 'Unknown';
  }
  return bill.status_history[bill.status_history.length - 1].status;
}
