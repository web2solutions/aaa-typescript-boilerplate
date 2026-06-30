/* eslint-disable jest/prefer-expect-assertions, jest/max-expects */
import fs from 'fs';
import path from 'path';

describe('service management mvp roadmap features', () => {
  const indexPath = path.resolve(process.cwd(), 'servicemangement/index.html');
  const scriptPath = path.resolve(process.cwd(), 'servicemangement/script.js');

  it('exposes schema diff controls in UI', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('id="save-baseline-btn"');
    expect(html).toContain('id="run-schema-diff-btn"');
    expect(html).toContain('id="schema-diff-list"');
  });

  it('exposes RBAC and message contract controls in UI', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('id="entity-rbac-action-select"');
    expect(html).toContain('id="entity-contract-name-input"');
    expect(html).toContain('id="entity-contract-list"');
  });

  it('includes OAS composition, package IO and export quality gate logic in script', () => {
    const script = fs.readFileSync(scriptPath, 'utf-8');
    expect(script).toContain('entity-oas-composition-mode-select');
    expect(script).toContain('saveSelectedEntityOasComposition');
    expect(script).toContain('canExportModel');
    expect(script).toContain('exportAsPackage');
    expect(script).toContain('importDomainPackage');
  });

  it('includes request/response example generator and JSON Schema exporter hooks', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    const script = fs.readFileSync(scriptPath, 'utf-8');
    expect(html).toContain('id="generate-examples-btn"');
    expect(html).toContain('id="examples-preview-output"');
    expect(html).toContain('id="export-jsonschema-btn"');
    expect(script).toContain('generateExamplesPreview');
    expect(script).toContain('buildEntityRequestExample');
    expect(script).toContain('exportAsJsonSchema');
  });

  it('includes advanced roadmap controls: relationship path, templates, OpenAPI advanced, mini-map', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    const script = fs.readFileSync(scriptPath, 'utf-8');
    expect(html).toContain('id="relationship-bend-x-input"');
    expect(html).toContain('id="entity-template-select"');
    expect(html).toContain('id="entity-oas-external-refs-input"');
    expect(html).toContain('id="mini-map"');
    expect(script).toContain('renderMiniMap');
    expect(script).toContain('exportAsAsyncApi');
    expect(script).toContain('exportBoilerplateBundle');
  });
});
