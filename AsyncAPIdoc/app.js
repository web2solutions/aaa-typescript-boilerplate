/* eslint-disable no-console */

const renderAsyncApi = async () => {
  try {
    const versionsResponse = await fetch('/docs/asyncapi/versions');
    if (!versionsResponse.ok) {
      throw new Error(`Unable to load asyncapi versions: ${versionsResponse.status}`);
    }

    const versionsPayload = await versionsResponse.json();
    const versions = versionsPayload?.versions || {};
    const versionKeys = Object.keys(versions).sort((a, b) => a.localeCompare(b));
    const latestVersion = versionKeys[versionKeys.length - 1];
    if (!latestVersion) {
      throw new Error('No AsyncAPI versions found.');
    }

    const schemaUrl = versions[latestVersion];
    const root = document.getElementById('asyncapi-root');
    if (!root) {
      throw new Error('AsyncAPI root container not found.');
    }

    const component = document.createElement('asyncapi-component');
    component.setAttribute('schema-url', schemaUrl);
    component.setAttribute('cssImportPath', 'https://unpkg.com/@asyncapi/react-component@1.5.0/styles/default.min.css');
    root.appendChild(component);
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<pre>${error.message}</pre>`;
  }
};

renderAsyncApi();
