/* eslint-disable jest/prefer-expect-assertions, jest/max-expects */
import fs from 'fs';
import path from 'path';

describe('serviceManagement domain designer smoke', () => {
  const htmlPath = path.resolve(process.cwd(), 'servicemangement/index.html');
  const scriptPath = path.resolve(process.cwd(), 'servicemangement/script.js');

  it('has create/edit/export/import controls required for MVP workflow', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html).toContain('id="add-domain-btn"');
    expect(html).toContain('id="add-entity-btn"');
    expect(html).toContain('id="save-relationship-btn"');
    expect(html).toContain('id="export-oas-btn"');
    expect(html).toContain('id="import-json-btn"');
    expect(html).toContain('id="import-package-btn"');
    expect(html).toContain('id="relationship-bend-x-input"');
    expect(html).toContain('id="entity-template-select"');
    expect(html).toContain('id="mini-map"');
  });

  it('wires export and package features in runtime script', () => {
    const script = fs.readFileSync(scriptPath, 'utf-8');
    expect(script).toContain('exportAsOas');
    expect(script).toContain('exportAsAsyncApi');
    expect(script).toContain('exportBoilerplateBundle');
    expect(script).toContain('exportAsPackage');
    expect(script).toContain('importDomainPackage');
    expect(script).toContain('renderMiniMap');
  });
});
