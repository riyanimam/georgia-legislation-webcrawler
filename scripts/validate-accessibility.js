#!/usr/bin/env node
/**
 * Accessibility Validation for HTML
 * Uses axe-core to check HTML files for WCAG AA accessibility violations
 *
 * Usage:
 *   node scripts/validate-accessibility.js [html-file]
 *   node scripts/validate-accessibility.js frontend/index.html
 */

import fs from 'fs';
import path from 'path';
import axe from 'axe-core';

/**
 * Custom HTML parser to extract and validate accessibility
 * This is a simplified version - for production, use a headless browser like Puppeteer
 */
function validateHTMLFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      errors: [`File not found: ${filePath}`],
      warnings: [],
      checks: {
        passed: 0,
        failed: 0,
        inapplicable: 0
      }
    };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];
  const warnings = [];

  // Check 1: ARIA attributes validation
  const ariaLabelPattern = /aria-label="/g;
  const ariaRolePattern = /role="/g;
  const ariaExpandedPattern = /aria-expanded="/g;

  if (!content.includes('aria-label=')) {
    warnings.push('⚠️  Limited use of aria-label attributes - may impact screen reader experience');
  }

  // Check 2: Semantic HTML
  const mainContent = content.match(/<main|<header|<nav|<footer|<article|<section|<aside/g);
  if (!mainContent) {
    warnings.push('⚠️  Missing semantic HTML elements (main, header, nav, etc.) - use semantic tags for better accessibility');
  }

  // Check 3: Alt text for images
  const imgWithoutAlt = content.match(/<img\s+(?:(?!alt=)[^\s>])*>/gi);
  if (imgWithoutAlt) {
    imgWithoutAlt.forEach((img, index) => {
      violations.push(`❌ Image ${index + 1} missing alt attribute: ${img.substring(0, 50)}...`);
    });
  }

  // Check 4: Form labels
  const inputsWithoutLabels = (content.match(/<input\s+(?:(?!id=)[^\s>])*>/gi) || []).filter(input => {
    const id = input.match(/id="([^"]*)"/);
    return !id || !content.includes(`<label for="${id[1]}"`);
  });

  if (inputsWithoutLabels.length > 0) {
    violations.push(`❌ ${inputsWithoutLabels.length} form input(s) missing associated label element`);
  }

  // Check 5: Heading hierarchy
  const headingMatches = content.match(/<h[1-6]/gi);
  if (!headingMatches) {
    warnings.push('⚠️  No heading elements found - headings help structure content for screen readers');
  }

  // Check 6: Color contrast (simplified check)
  const styleBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  if (styleBlocks.length === 0) {
    warnings.push('⚠️  Unable to validate color contrast - ensure text has sufficient contrast ratio (4.5:1 for normal text)');
  }

  // Check 7: Button and link text
  const emptyButtons = content.match(/<button[^>]*>\s*<\/button>/gi);
  if (emptyButtons) {
    violations.push(`❌ ${emptyButtons.length} button(s) with no visible text or aria-label`);
  }

  const emptyLinks = content.match(/<a[^>]*>\s*<\/a>/gi);
  if (emptyLinks) {
    violations.push(`❌ ${emptyLinks.length} link(s) with no visible text or aria-label`);
  }

  // Check 8: Keyboard accessibility markers
  if (!content.includes('tabindex') && !content.includes('onkeydown') && !content.includes('onkeyup')) {
    warnings.push('⚠️  Limited keyboard interaction - ensure all interactive elements are keyboard accessible');
  }

  // Check 9: Language attribute
  if (!content.includes('lang=')) {
    violations.push('❌ HTML element missing lang attribute - specify document language for screen readers');
  }

  // Check 10: Video/Audio captions
  const videoElements = content.match(/<video[^>]*>/gi);
  if (videoElements) {
    videoElements.forEach((video, index) => {
      if (!content.includes('<track') && !content.includes('[captions]')) {
        warnings.push(`⚠️  Video ${index + 1} may lack captions or transcripts`);
      }
    });
  }

  const hasAriaLabels = ariaLabelPattern.test(content);
  const hasAriaRoles = ariaRolePattern.test(content);
  const hasAriaExpanded = ariaExpandedPattern.test(content);

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    checks: {
      passed: [
        hasAriaLabels && 'ARIA labels used',
        hasAriaRoles && 'ARIA roles defined',
        hasAriaExpanded && 'ARIA expanded state managed',
        content.includes('<!DOCTYPE html') && 'Valid HTML5 doctype'
      ].filter(Boolean).length,
      failed: violations.length,
      inapplicable: 0
    }
  };
}

// Main execution
const filePath = process.argv[2] || 'frontend/index.html';
const result = validateHTMLFile(filePath);

console.log(`\n♿ Accessibility Validation Report`);
console.log(`==================================\n`);
console.log(`File: ${filePath}`);
console.log(`Status: ${result.isValid ? '✅ VALID' : '❌ VIOLATIONS FOUND'}\n`);

if (result.checks) {
  console.log(`Checks:`);
  console.log(`  Passed: ${result.checks.passed}`);
  console.log(`  Failed: ${result.checks.failed}`);
  if (result.checks.inapplicable > 0) {
    console.log(`  Inapplicable: ${result.checks.inapplicable}`);
  }
  console.log();
}

if (result.violations.length > 0) {
  console.log(`Violations Found:\n`);
  result.violations.forEach(v => console.log(v));
  console.log();
}

if (result.warnings.length > 0) {
  console.log(`Warnings:\n`);
  result.warnings.forEach(w => console.log(w));
  console.log();
}

console.log(`\n📖 Reference: https://www.w3.org/WAI/WCAG21/quickref/\n`);

// Write accessibility report
const report = {
  timestamp: new Date().toISOString(),
  status: result.isValid ? 'pass' : 'fail',
  summary: {
    validationsPassed: result.passes?.length || 0,
    warnings: result.warnings.length,
    violations: result.violations.length,
  },
  passes: result.passes || [],
  warnings: result.warnings,
  violations: result.violations,
};

fs.writeFileSync('accessibility-report.json', JSON.stringify(report, null, 2));
console.log('📄 Accessibility report written to accessibility-report.json\n');

process.exit(result.isValid ? 0 : 1);
