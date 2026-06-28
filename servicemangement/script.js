const STORAGE_KEY = 'service-management.v1';
const DOMAIN_COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#22d3ee', '#a78bfa', '#fb7185', '#84cc16'];
const FIELD_TYPES = ['string', 'integer', 'number', 'boolean', 'array', 'object', 'date', 'datetime', 'uuid'];

const state = {
  domains: [],
  relationships: [],
  selectedDomainId: null,
  selectedEntityId: null,
  selectedRelationshipId: null,
  idCounter: 1,
  activeTab: 'domain-designer',
  interfaces: [],
  serviceConfiguration: {
    serviceKind: 'rest-api',
    runMode: 'dedicated-server',
    cloudProvider: 'aws',
    staticAssetsPath: '',
    ports: {
      rest: 3000,
      websocket: 3001,
      grpc: 3002
    }
  },
  runtimeEnvironment: {
    environment: 'dev',
    fileName: '.env.dev',
    values: {
      AAA_HTTP_FRAMEWORK: 'express',
      AAA_REALTIME_API: 'no',
      AAA_REALTIME_API_PROTOCOL: 'websocket',
      AAA_REALTIME_API_DATABASE_DRIVER: 'Mongo'
    }
  },
  deployments: [],
  view: {
    zoom: 1,
    compactEntities: false,
    snapToGrid: true,
    edgeStyle: 'curved'
  }
};

const history = {
  past: [],
  future: []
};

const interaction = {
  spacePressed: false,
  panning: false,
  relationshipPickActive: false,
  relationshipPickFromEntityId: null,
  panStartX: 0,
  panStartY: 0,
  scrollStartLeft: 0,
  scrollStartTop: 0
};

const dom = {
  tabDomainDesignerBtn: document.getElementById('tab-domain-designer-btn'),
  tabInterfaceDesignerBtn: document.getElementById('tab-interface-designer-btn'),
  tabServiceConfigBtn: document.getElementById('tab-service-config-btn'),
  tabDeployManagementBtn: document.getElementById('tab-deploy-management-btn'),
  tabDomainDesigner: document.getElementById('tab-domain-designer'),
  tabInterfaceDesigner: document.getElementById('tab-interface-designer'),
  tabServiceConfig: document.getElementById('tab-service-config'),
  tabDeployManagement: document.getElementById('tab-deploy-management'),
  canvas: document.getElementById('canvas'),
  canvasInner: document.getElementById('canvas-inner'),
  edges: document.getElementById('edges'),
  domainList: document.getElementById('domain-list'),
  status: document.getElementById('selection-status'),
  zoomOutBtn: document.getElementById('zoom-out-btn'),
  zoomInBtn: document.getElementById('zoom-in-btn'),
  edgeStyleSelect: document.getElementById('edge-style-select'),
  autoLayoutBtn: document.getElementById('auto-layout-btn'),
  fitViewBtn: document.getElementById('fit-view-btn'),
  resetViewBtn: document.getElementById('reset-view-btn'),
  zoomIndicator: document.getElementById('zoom-indicator'),
  toggleCompactViewBtn: document.getElementById('toggle-compact-view-btn'),
  toggleSnapBtn: document.getElementById('toggle-snap-btn'),
  domainNameInput: document.getElementById('domain-name-input'),
  addDomainBtn: document.getElementById('add-domain-btn'),
  renameDomainBtn: document.getElementById('rename-domain-btn'),
  deleteDomainBtn: document.getElementById('delete-domain-btn'),
  domainColorInput: document.getElementById('domain-color-input'),
  setDomainColorBtn: document.getElementById('set-domain-color-btn'),
  entityNameInput: document.getElementById('entity-name-input'),
  addEntityBtn: document.getElementById('add-entity-btn'),
  renameEntityBtn: document.getElementById('rename-entity-btn'),
  deleteEntityBtn: document.getElementById('delete-entity-btn'),
  duplicateEntityBtn: document.getElementById('duplicate-entity-btn'),
  entitySearchInput: document.getElementById('entity-search-input'),
  entitySearchBtn: document.getElementById('entity-search-btn'),
  fromEntitySelect: document.getElementById('from-entity-select'),
  toEntitySelect: document.getElementById('to-entity-select'),
  fromCardSelect: document.getElementById('from-card-select'),
  toCardSelect: document.getElementById('to-card-select'),
  relationshipAutoFkCheck: document.getElementById('relationship-auto-fk-check'),
  addRelationshipBtn: document.getElementById('add-relationship-btn'),
  pickRelationshipBtn: document.getElementById('pick-relationship-btn'),
  relationshipPickStatus: document.getElementById('relationship-pick-status'),
  relationshipList: document.getElementById('relationship-list'),
  relationshipNameInput: document.getElementById('relationship-name-input'),
  relationshipFromEntitySelect: document.getElementById('relationship-from-entity-select'),
  relationshipToEntitySelect: document.getElementById('relationship-to-entity-select'),
  relationshipFromCardSelect: document.getElementById('relationship-from-card-select'),
  relationshipToCardSelect: document.getElementById('relationship-to-card-select'),
  saveRelationshipBtn: document.getElementById('save-relationship-btn'),
  reverseRelationshipBtn: document.getElementById('reverse-relationship-btn'),
  entityInspectorTitle: document.getElementById('entity-inspector-title'),
  entityRenameInput: document.getElementById('entity-rename-input'),
  saveEntityRenameBtn: document.getElementById('save-entity-rename-btn'),
  entityMoveDomainSelect: document.getElementById('entity-move-domain-select'),
  moveEntityBtn: document.getElementById('move-entity-btn'),
  fieldNameInput: document.getElementById('field-name-input'),
  fieldTemplateSelect: document.getElementById('field-template-select'),
  applyFieldTemplateBtn: document.getElementById('apply-field-template-btn'),
  fieldTypeSelect: document.getElementById('field-type-select'),
  fieldFormatSelect: document.getElementById('field-format-select'),
  fieldEnumInput: document.getElementById('field-enum-input'),
  fieldRequiredCheck: document.getElementById('field-required-check'),
  fieldPkCheck: document.getElementById('field-pk-check'),
  fieldFkCheck: document.getElementById('field-fk-check'),
  fieldUniqueCheck: document.getElementById('field-unique-check'),
  fieldNullableCheck: document.getElementById('field-nullable-check'),
  addFieldBtn: document.getElementById('add-field-btn'),
  entityFieldList: document.getElementById('entity-field-list'),
  entityApiPreviewList: document.getElementById('entity-api-preview-list'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  exportOasBtn: document.getElementById('export-oas-btn'),
  importJsonBtn: document.getElementById('import-json-btn'),
  importJsonInput: document.getElementById('import-json-input'),
  importOasBtn: document.getElementById('import-oas-btn'),
  importOasInput: document.getElementById('import-oas-input'),
  resetCanvasBtn: document.getElementById('reset-canvas-btn'),
  clearStorageBtn: document.getElementById('clear-storage-btn'),
  undoBtn: document.getElementById('undo-btn'),
  redoBtn: document.getElementById('redo-btn'),
  runModelCheckBtn: document.getElementById('run-model-check-btn'),
  modelCheckList: document.getElementById('model-check-list'),
  interfaceTypeSelect: document.getElementById('interface-type-select'),
  interfaceFrameworkInput: document.getElementById('interface-framework-input'),
  interfaceEntrypointInput: document.getElementById('interface-entrypoint-input'),
  interfaceControllerInput: document.getElementById('interface-controller-input'),
  addInterfaceAdapterBtn: document.getElementById('add-interface-adapter-btn'),
  interfaceAdapterList: document.getElementById('interface-adapter-list'),
  serviceKindSelect: document.getElementById('service-kind-select'),
  runModeSelect: document.getElementById('run-mode-select'),
  cloudProviderSelect: document.getElementById('cloud-provider-select'),
  serviceStaticAssetsInput: document.getElementById('service-static-assets-input'),
  serviceHttpPortInput: document.getElementById('service-http-port-input'),
  serviceWebsocketPortInput: document.getElementById('service-websocket-port-input'),
  serviceGrpcPortInput: document.getElementById('service-grpc-port-input'),
  saveServiceConfigBtn: document.getElementById('save-service-config-btn'),
  serviceRuntimeProfilePreview: document.getElementById('service-runtime-profile-preview'),
  serviceConfigPreview: document.getElementById('service-config-preview'),
  runtimeEnvSelect: document.getElementById('runtime-env-select'),
  runtimeHttpFrameworkSelect: document.getElementById('runtime-http-framework-select'),
  runtimeRealtimeApiSelect: document.getElementById('runtime-realtime-api-select'),
  runtimeRealtimeProtocolSelect: document.getElementById('runtime-realtime-protocol-select'),
  runtimeRealtimeDbDriverSelect: document.getElementById('runtime-realtime-db-driver-select'),
  runtimeEnvRefreshBtn: document.getElementById('runtime-env-refresh-btn'),
  runtimeEnvSaveBtn: document.getElementById('runtime-env-save-btn'),
  runtimeEnvPreview: document.getElementById('runtime-env-preview'),
  deployNameInput: document.getElementById('deploy-name-input'),
  deployTypeSelect: document.getElementById('deploy-type-select'),
  deployRegionInput: document.getElementById('deploy-region-input'),
  deployRuntimeInput: document.getElementById('deploy-runtime-input'),
  addDeployTargetBtn: document.getElementById('add-deploy-target-btn'),
  deployTargetList: document.getElementById('deploy-target-list')
};

function normalizedName(value) {
  return String(value || '').trim().toLowerCase();
}

function isDomainNameTaken(name, ignoredDomainId = null) {
  const value = normalizedName(name);
  return state.domains.some((domain) => domain.id !== ignoredDomainId && normalizedName(domain.name) === value);
}

function isEntityNameTaken(domain, name, ignoredEntityId = null) {
  const value = normalizedName(name);
  return domain.entities.some((entity) => entity.id !== ignoredEntityId && normalizedName(entity.name) === value);
}

function isFieldNameTaken(entity, name, ignoredFieldName = null) {
  const value = normalizedName(name);
  return entity.fields.some(
    (field) => normalizedName(field.name) !== normalizedName(ignoredFieldName) && normalizedName(field.name) === value
  );
}

function parseEnumValues(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  return String(raw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeField(field, fieldIndex) {
  const name = String(field?.name || '').trim() || `field_${fieldIndex + 1}`;
  const type = FIELD_TYPES.includes(field?.type) ? field.type : 'string';
  const enumValues = parseEnumValues(field?.enumValues ?? field?.enum);
  const format = String(field?.format || '').trim();
  const description = String(field?.description || '').trim();
  const pattern = String(field?.pattern || '').trim();
  const itemsTypeRaw = String(field?.itemsType || '').trim();
  const itemsType = FIELD_TYPES.includes(itemsTypeRaw) ? itemsTypeRaw : '';
  const minLength = normalizeOptionalNumber(field?.minLength);
  const maxLength = normalizeOptionalNumber(field?.maxLength);
  const minimum = normalizeOptionalNumber(field?.minimum);
  const maximum = normalizeOptionalNumber(field?.maximum);
  return {
    name,
    type,
    required: Boolean(field?.required),
    pk: Boolean(field?.pk),
    fk: Boolean(field?.fk),
    unique: Boolean(field?.unique),
    nullable: Boolean(field?.nullable),
    format,
    description,
    enumValues,
    pattern,
    minLength,
    maxLength,
    minimum,
    maximum,
    itemsType: type === 'array' ? (itemsType || 'string') : ''
  };
}

function saveState() {
  const payload = {
    domains: state.domains,
    relationships: state.relationships,
    selectedDomainId: state.selectedDomainId,
    selectedEntityId: state.selectedEntityId,
    selectedRelationshipId: state.selectedRelationshipId,
    idCounter: state.idCounter,
    activeTab: state.activeTab,
    interfaces: state.interfaces,
    serviceConfiguration: state.serviceConfiguration,
    runtimeEnvironment: state.runtimeEnvironment,
    deployments: state.deployments,
    view: state.view
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function snapshotState() {
  return JSON.parse(JSON.stringify({
    domains: state.domains,
    relationships: state.relationships,
    selectedDomainId: state.selectedDomainId,
    selectedEntityId: state.selectedEntityId,
    selectedRelationshipId: state.selectedRelationshipId,
    idCounter: state.idCounter,
    activeTab: state.activeTab,
    interfaces: state.interfaces,
    serviceConfiguration: state.serviceConfiguration,
    runtimeEnvironment: state.runtimeEnvironment,
    deployments: state.deployments,
    view: state.view
  }));
}

function applySnapshot(snapshot) {
  state.domains = snapshot.domains || [];
  state.relationships = (snapshot.relationships || []).map(normalizeRelationship);
  state.selectedDomainId = snapshot.selectedDomainId || state.domains[0]?.id || null;
  state.selectedEntityId = snapshot.selectedEntityId || null;
  state.selectedRelationshipId = snapshot.selectedRelationshipId || null;
  state.idCounter = snapshot.idCounter || 1;
  state.activeTab = snapshot.activeTab || 'domain-designer';
  state.interfaces = Array.isArray(snapshot.interfaces) ? snapshot.interfaces : [];
  state.serviceConfiguration = {
    ...state.serviceConfiguration,
    ...(snapshot.serviceConfiguration || {})
  };
  state.runtimeEnvironment = {
    ...state.runtimeEnvironment,
    ...(snapshot.runtimeEnvironment || {})
  };
  state.deployments = Array.isArray(snapshot.deployments) ? snapshot.deployments : [];
  state.view = snapshot.view || { zoom: 1 };
  recomputeIdCounter();
}

function recordHistory() {
  history.past.push(snapshotState());
  if (history.past.length > 100) history.past.shift();
  history.future = [];
}

function withPersist(action, options = {}) {
  if (options.recordHistory !== false) recordHistory();
  action();
  saveState();
}

function undo() {
  if (!history.past.length) return;
  history.future.push(snapshotState());
  const previous = history.past.pop();
  applySnapshot(previous);
  saveState();
  render();
}

function redo() {
  if (!history.future.length) return;
  history.past.push(snapshotState());
  const next = history.future.pop();
  applySnapshot(next);
  saveState();
  render();
}

function clampZoom(value) {
  return Math.max(0.5, Math.min(2, value));
}

function renderView() {
  const zoom = clampZoom(state.view.zoom || 1);
  state.view.zoom = zoom;
  if (typeof state.view.snapToGrid !== 'boolean') state.view.snapToGrid = true;
  if (!['curved', 'orthogonal'].includes(state.view.edgeStyle)) state.view.edgeStyle = 'curved';
  dom.canvasInner.style.transform = `scale(${zoom})`;
  dom.zoomIndicator.textContent = `${Math.round(zoom * 100)}%`;
  dom.toggleCompactViewBtn.textContent = state.view.compactEntities ? 'Full View' : 'Compact View';
  dom.toggleSnapBtn.textContent = state.view.snapToGrid ? 'Snap: On' : 'Snap: Off';
  dom.edgeStyleSelect.value = state.view.edgeStyle;
}

function renderTabs() {
  const activeTab = state.activeTab || 'domain-designer';
  const tabMap = [
    {
      key: 'domain-designer',
      button: dom.tabDomainDesignerBtn,
      section: dom.tabDomainDesigner
    },
    {
      key: 'interface-designer',
      button: dom.tabInterfaceDesignerBtn,
      section: dom.tabInterfaceDesigner
    },
    {
      key: 'service-config',
      button: dom.tabServiceConfigBtn,
      section: dom.tabServiceConfig
    },
    {
      key: 'deploy-management',
      button: dom.tabDeployManagementBtn,
      section: dom.tabDeployManagement
    }
  ];

  tabMap.forEach((tab) => {
    if (tab.button) tab.button.classList.toggle('active', tab.key === activeTab);
    if (tab.section) tab.section.classList.toggle('active', tab.key === activeTab);
  });
}

function setActiveTab(tab) {
  state.activeTab = tab;
  renderTabs();
  saveState();
}

function renderInterfaceAdapters() {
  if (!dom.interfaceAdapterList) return;
  dom.interfaceAdapterList.innerHTML = '';
  state.interfaces.forEach((adapter, index) => {
    const item = document.createElement('li');
    item.className = 'relationship-item';
    const summary = document.createElement('div');
    summary.className = 'relationship-name';
    summary.textContent = `${adapter.type} | ${adapter.framework} | ${adapter.entrypoint} -> ${adapter.controller}`;
    item.appendChild(summary);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Delete';
    removeBtn.onclick = () => {
      withPersist(() => {
        state.interfaces.splice(index, 1);
        renderInterfaceAdapters();
      });
    };
    item.appendChild(removeBtn);
    dom.interfaceAdapterList.appendChild(item);
  });
}

function renderServiceConfiguration() {
  if (!dom.serviceKindSelect) return;
  dom.serviceKindSelect.value = state.serviceConfiguration.serviceKind || 'rest-api';
  dom.runModeSelect.value = state.serviceConfiguration.runMode || 'dedicated-server';
  dom.cloudProviderSelect.value = state.serviceConfiguration.cloudProvider || 'aws';
  dom.serviceStaticAssetsInput.value = state.serviceConfiguration.staticAssetsPath || '';
  const currentPorts = state.serviceConfiguration.ports || { rest: 3000, websocket: 3001, grpc: 3002 };
  if (dom.serviceHttpPortInput) dom.serviceHttpPortInput.value = String(currentPorts.rest || 3000);
  if (dom.serviceWebsocketPortInput) dom.serviceWebsocketPortInput.value = String(currentPorts.websocket || 3001);
  if (dom.serviceGrpcPortInput) dom.serviceGrpcPortInput.value = String(currentPorts.grpc || 3002);

  const runtimeProfiles = {
    'rest-api': {
      kind: 'REST API',
      processCount: 1,
      pm2Command: 'npm run pm2:start:dev:restapi',
      processes: ['REST API']
    },
    'websocket-rest-api': {
      kind: 'WebSocket API + REST API',
      processCount: 2,
      pm2Command: 'npm run pm2:start:dev:websocket-rest',
      processes: ['REST API', 'WebSocket API']
    },
    'grpc-rest-api': {
      kind: 'gRPC API + REST API',
      processCount: 2,
      pm2Command: 'npm run pm2:start:dev:grpc-rest',
      processes: ['REST API', 'gRPC API']
    }
  };
  const selectedProfile = runtimeProfiles[state.serviceConfiguration.serviceKind] || runtimeProfiles['rest-api'];
  if (dom.serviceRuntimeProfilePreview) {
    dom.serviceRuntimeProfilePreview.textContent = JSON.stringify({
      selectedRuntimeProfile: selectedProfile.kind,
      vmRequirement: 'Use PM2 with separated processes and ports',
      processCount: selectedProfile.processCount,
      processes: selectedProfile.processes,
      ports: currentPorts,
      suggestedPm2Command: selectedProfile.pm2Command
    }, null, 2);
  }
  if (!dom.serviceConfigPreview) return;
  dom.serviceConfigPreview.textContent = JSON.stringify(state.serviceConfiguration, null, 2);
  renderRuntimeEnvironment();
}

function renderRuntimeEnvironment() {
  if (!dom.runtimeEnvSelect) return;
  const runtimeEnvironment = state.runtimeEnvironment || {};
  const runtimeValues = runtimeEnvironment.values || {};
  const environment = String(runtimeEnvironment.environment || 'dev');
  const fileName = String(runtimeEnvironment.fileName || '.env.dev');
  dom.runtimeEnvSelect.value = environment;
  if (dom.runtimeHttpFrameworkSelect) {
    dom.runtimeHttpFrameworkSelect.value = String(runtimeValues.AAA_HTTP_FRAMEWORK || 'express');
  }
  if (dom.runtimeRealtimeApiSelect) {
    dom.runtimeRealtimeApiSelect.value = String(runtimeValues.AAA_REALTIME_API || 'no');
  }
  if (dom.runtimeRealtimeProtocolSelect) {
    dom.runtimeRealtimeProtocolSelect.value = String(runtimeValues.AAA_REALTIME_API_PROTOCOL || 'websocket');
  }
  if (dom.runtimeRealtimeDbDriverSelect) {
    dom.runtimeRealtimeDbDriverSelect.value = String(runtimeValues.AAA_REALTIME_API_DATABASE_DRIVER || 'Mongo');
  }
  if (dom.runtimeEnvPreview) {
    dom.runtimeEnvPreview.textContent = JSON.stringify({
      environment,
      fileName,
      values: runtimeValues
    }, null, 2);
  }
}

async function loadRuntimeEnvironment(environment) {
  const selectedEnvironment = String(environment || state.runtimeEnvironment?.environment || 'dev');
  const query = `?environment=${encodeURIComponent(selectedEnvironment)}`;
  const response = await fetch(`/api/runtime/env${query}`);
  if (!response.ok) {
    throw new Error(`Could not load environment ${selectedEnvironment}.`);
  }
  const payload = await response.json();
  state.runtimeEnvironment = {
    environment: String(payload.environment || selectedEnvironment),
    fileName: String(payload.fileName || ''),
    values: {
      AAA_HTTP_FRAMEWORK: String(payload?.values?.AAA_HTTP_FRAMEWORK || 'express'),
      AAA_REALTIME_API: String(payload?.values?.AAA_REALTIME_API || 'no'),
      AAA_REALTIME_API_PROTOCOL: String(payload?.values?.AAA_REALTIME_API_PROTOCOL || 'websocket'),
      AAA_REALTIME_API_DATABASE_DRIVER: String(payload?.values?.AAA_REALTIME_API_DATABASE_DRIVER || 'Mongo')
    }
  };
  renderRuntimeEnvironment();
}

async function saveRuntimeEnvironment() {
  const payload = {
    environment: dom.runtimeEnvSelect?.value || 'dev',
    values: {
      AAA_HTTP_FRAMEWORK: dom.runtimeHttpFrameworkSelect?.value || 'express',
      AAA_REALTIME_API: dom.runtimeRealtimeApiSelect?.value || 'no',
      AAA_REALTIME_API_PROTOCOL: dom.runtimeRealtimeProtocolSelect?.value || 'websocket',
      AAA_REALTIME_API_DATABASE_DRIVER: dom.runtimeRealtimeDbDriverSelect?.value || 'Mongo'
    }
  };
  const response = await fetch('/api/runtime/env', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Could not save runtime environment.');
  }
  const saved = await response.json();
  state.runtimeEnvironment = {
    environment: String(saved.environment || payload.environment),
    fileName: String(saved.fileName || ''),
    values: {
      AAA_HTTP_FRAMEWORK: String(saved?.values?.AAA_HTTP_FRAMEWORK || payload.values.AAA_HTTP_FRAMEWORK),
      AAA_REALTIME_API: String(saved?.values?.AAA_REALTIME_API || payload.values.AAA_REALTIME_API),
      AAA_REALTIME_API_PROTOCOL: String(saved?.values?.AAA_REALTIME_API_PROTOCOL || payload.values.AAA_REALTIME_API_PROTOCOL),
      AAA_REALTIME_API_DATABASE_DRIVER:
        String(saved?.values?.AAA_REALTIME_API_DATABASE_DRIVER || payload.values.AAA_REALTIME_API_DATABASE_DRIVER)
    }
  };
  saveState();
  renderRuntimeEnvironment();
}

function renderDeployments() {
  if (!dom.deployTargetList) return;
  dom.deployTargetList.innerHTML = '';
  state.deployments.forEach((deployment, index) => {
    const item = document.createElement('li');
    item.className = 'relationship-item';
    const summary = document.createElement('div');
    summary.className = 'relationship-name';
    summary.textContent = `${deployment.name} | ${deployment.type} | ${deployment.region} | ${deployment.runtime}`;
    item.appendChild(summary);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Delete';
    removeBtn.onclick = () => {
      withPersist(() => {
        state.deployments.splice(index, 1);
        renderDeployments();
      });
    };
    item.appendChild(removeBtn);
    dom.deployTargetList.appendChild(item);
  });
}

function setZoom(zoomValue) {
  state.view.zoom = clampZoom(zoomValue);
  renderView();
  saveState();
}

function zoomBy(delta) {
  setZoom((state.view.zoom || 1) + delta);
}

function fitView() {
  if (!state.domains.length) {
    setZoom(1);
    dom.canvas.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
    return;
  }

  const bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: 0,
    maxY: 0
  };

  state.domains.forEach((domain) => {
    bounds.minX = Math.min(bounds.minX, domain.x);
    bounds.minY = Math.min(bounds.minY, domain.y);
    bounds.maxX = Math.max(bounds.maxX, domain.x + 520);
    bounds.maxY = Math.max(bounds.maxY, domain.y + 280);
  });

  const padding = 80;
  const contentWidth = Math.max(300, bounds.maxX - bounds.minX + padding * 2);
  const contentHeight = Math.max(220, bounds.maxY - bounds.minY + padding * 2);
  const zoomX = dom.canvas.clientWidth / contentWidth;
  const zoomY = dom.canvas.clientHeight / contentHeight;
  const nextZoom = clampZoom(Math.min(zoomX, zoomY));
  state.view.zoom = nextZoom;
  renderView();

  const left = Math.max(0, (bounds.minX - padding) * nextZoom);
  const top = Math.max(0, (bounds.minY - padding) * nextZoom);
  dom.canvas.scrollTo({ left, top, behavior: 'smooth' });
  saveState();
}

function resetView() {
  state.view.zoom = 1;
  renderView();
  dom.canvas.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
  saveState();
}

function toggleCompactView() {
  state.view.compactEntities = !state.view.compactEntities;
  render();
  saveState();
}

function autoLayout() {
  withPersist(() => {
    const domainWidth = 520;
    const domainHeight = 300;
    const gapX = 70;
    const gapY = 70;
    const columns = Math.max(1, Math.floor((3200 - 120) / (domainWidth + gapX)));

    state.domains.forEach((domain, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      domain.x = 40 + column * (domainWidth + gapX);
      domain.y = 40 + row * (domainHeight + gapY);

      domain.entities.forEach((entity, entityIndex) => {
        const entityColumn = entityIndex % 2;
        const entityRow = Math.floor(entityIndex / 2);
        entity.x = 14 + entityColumn * 206;
        entity.y = 14 + entityRow * 118;
      });
    });

    render();
  });

  fitView();
}

function nextId(prefix) {
  const value = `${prefix}-${state.idCounter}`;
  state.idCounter += 1;
  return value;
}

function getSelectedDomain() {
  return state.domains.find((domain) => domain.id === state.selectedDomainId) || null;
}

function findEntity(entityId) {
  for (const domain of state.domains) {
    const entity = domain.entities.find((candidate) => candidate.id === entityId);
    if (entity) return { domain, entity };
  }
  return null;
}

function findEntityByName(name) {
  const normalized = normalizedName(name);
  if (!normalized) return null;
  for (const domain of state.domains) {
    const entity = domain.entities.find((candidate) => normalizedName(candidate.name).includes(normalized));
    if (entity) return { domain, entity };
  }
  return null;
}

function focusEntity(entityId) {
  const found = findEntity(entityId);
  if (!found) return;
  state.selectedDomainId = found.domain.id;
  state.selectedEntityId = found.entity.id;
  render();
  const zoom = state.view.zoom || 1;
  const targetLeft = (found.domain.x + found.entity.x - 120) * zoom;
  const targetTop = (found.domain.y + found.entity.y - 80) * zoom;
  dom.canvas.scrollTo({
    left: Math.max(0, targetLeft),
    top: Math.max(0, targetTop),
    behavior: 'smooth'
  });
}

function defaultFields() {
  return [
    normalizeField({ name: 'id', type: 'uuid', required: true, pk: true, fk: false, unique: true }, 0),
    normalizeField({ name: 'createdAt', type: 'date', required: true, pk: false, fk: false, unique: false }, 1),
    normalizeField({ name: 'updatedAt', type: 'date', required: true, pk: false, fk: false, unique: false }, 2)
  ];
}

function snapCoordinate(value) {
  if (!state.view.snapToGrid) return value;
  const GRID = 8;
  return Math.round(value / GRID) * GRID;
}

function addDomain(name, options = {}) {
  if (isDomainNameTaken(name)) {
    window.alert(`Domain "${name}" already exists.`);
    return null;
  }
  const domain = {
    id: nextId('domain'),
    name,
    color: options.color || DOMAIN_COLORS[state.domains.length % DOMAIN_COLORS.length],
    x: options.x ?? 120 + state.domains.length * 40,
    y: options.y ?? 90 + state.domains.length * 30,
    entities: []
  };
  state.domains.push(domain);
  state.selectedDomainId = domain.id;
  return domain;
}

function addEntity(domainId, name, options = {}) {
  const domain = state.domains.find((candidate) => candidate.id === domainId);
  if (!domain) return null;
  if (isEntityNameTaken(domain, name)) {
    window.alert(`Entity "${name}" already exists in ${domain.name}.`);
    return null;
  }
  const index = domain.entities.length;
  const entity = {
    id: nextId('entity'),
    name,
    x: options.x ?? 14 + (index % 2) * 206,
    y: options.y ?? 14 + Math.floor(index / 2) * 120,
    fields: (options.fields || defaultFields()).map((field, fieldIndex) => normalizeField(field, fieldIndex))
  };
  domain.entities.push(entity);
  state.selectedEntityId = entity.id;
  return entity;
}

function deleteEntity(entityId) {
  state.domains.forEach((domain) => {
    domain.entities = domain.entities.filter((entity) => entity.id !== entityId);
  });
  state.relationships = state.relationships.filter(
    (relationship) => relationship.fromEntityId !== entityId && relationship.toEntityId !== entityId
  );
  if (state.selectedEntityId === entityId) state.selectedEntityId = null;
  if (state.selectedRelationshipId) {
    const stillExists = state.relationships.some((relationship) => relationship.id === state.selectedRelationshipId);
    if (!stillExists) state.selectedRelationshipId = null;
  }
}

function deleteDomain(domainId) {
  const domain = state.domains.find((candidate) => candidate.id === domainId);
  if (!domain) return;
  const ids = new Set(domain.entities.map((entity) => entity.id));
  state.relationships = state.relationships.filter(
    (relationship) => !ids.has(relationship.fromEntityId) && !ids.has(relationship.toEntityId)
  );
  state.domains = state.domains.filter((candidate) => candidate.id !== domainId);
  if (state.selectedDomainId === domainId) state.selectedDomainId = state.domains[0]?.id || null;
  if (state.selectedEntityId && ids.has(state.selectedEntityId)) state.selectedEntityId = null;
  if (state.selectedRelationshipId) {
    const stillExists = state.relationships.some((relationship) => relationship.id === state.selectedRelationshipId);
    if (!stillExists) state.selectedRelationshipId = null;
  }
}

function setSelectedDomain(domainId) {
  state.selectedDomainId = domainId;
  render();
}

function setSelectedEntity(entityId) {
  state.selectedEntityId = entityId;
  render();
}

function addFieldToSelectedEntity() {
  const found = findEntity(state.selectedEntityId);
  if (!found) {
    window.alert('Select an entity first.');
    return;
  }
  const name = dom.fieldNameInput.value.trim();
  if (!name) return;
  if (isFieldNameTaken(found.entity, name)) {
    window.alert(`Field "${name}" already exists in ${found.entity.name}.`);
    return;
  }
  withPersist(() => {
    found.entity.fields.push(normalizeField({
      name,
      type: dom.fieldTypeSelect.value,
      format: dom.fieldFormatSelect.value,
      enumValues: parseEnumValues(dom.fieldEnumInput.value),
      required: dom.fieldRequiredCheck.checked,
      pk: dom.fieldPkCheck.checked,
      fk: dom.fieldFkCheck.checked,
      unique: dom.fieldUniqueCheck.checked,
      nullable: dom.fieldNullableCheck.checked
    }, found.entity.fields.length));
    dom.fieldNameInput.value = '';
    dom.fieldFormatSelect.value = '';
    dom.fieldEnumInput.value = '';
    dom.fieldNullableCheck.checked = false;
    render();
  });
}

function applyFieldTemplateToSelectedEntity() {
  const found = findEntity(state.selectedEntityId);
  if (!found) {
    window.alert('Select an entity first.');
    return;
  }
  const template = dom.fieldTemplateSelect.value;
  if (!template) return;
  const templates = {
    tenant: [
      { name: 'organizationId', type: 'uuid', required: true, fk: true }
    ],
    audit: [
      { name: 'createdBy', type: 'uuid', required: true, fk: true },
      { name: 'updatedBy', type: 'uuid', required: true, fk: true }
    ],
    softDelete: [
      { name: 'isDeleted', type: 'boolean', required: true },
      { name: 'deletedAt', type: 'datetime', required: false, nullable: true }
    ],
    contact: [
      { name: 'emails', type: 'array', required: false, itemsType: 'string', description: 'Collection of e-mails' },
      { name: 'phones', type: 'array', required: false, itemsType: 'string', description: 'Collection of phones' }
    ]
  };
  const items = templates[template];
  if (!items?.length) return;
  withPersist(() => {
    items.forEach((candidate) => {
      if (isFieldNameTaken(found.entity, candidate.name)) return;
      found.entity.fields.push(normalizeField({
        name: candidate.name,
        type: candidate.type || 'string',
        required: Boolean(candidate.required),
        pk: false,
        fk: Boolean(candidate.fk),
        unique: false,
        nullable: Boolean(candidate.nullable),
        itemsType: candidate.itemsType || '',
        description: candidate.description || ''
      }, found.entity.fields.length));
    });
    render();
  });
}

function updateField(entityId, fieldName, nextPartial) {
  const found = findEntity(entityId);
  if (!found) return;
  const target = found.entity.fields.find((field) => field.name === fieldName);
  if (!target) return;
  const nextName = (nextPartial.name ?? target.name).trim();
  if (!nextName) {
    window.alert('Field name cannot be empty.');
    return;
  }
  if (isFieldNameTaken(found.entity, nextName, target.name)) {
    window.alert(`Field "${nextName}" already exists in ${found.entity.name}.`);
    return;
  }
  withPersist(() => {
    target.name = nextName;
    if ('type' in nextPartial && FIELD_TYPES.includes(nextPartial.type)) target.type = nextPartial.type;
    if ('required' in nextPartial) target.required = Boolean(nextPartial.required);
    if ('pk' in nextPartial) target.pk = Boolean(nextPartial.pk);
    if ('fk' in nextPartial) target.fk = Boolean(nextPartial.fk);
    if ('unique' in nextPartial) target.unique = Boolean(nextPartial.unique);
    if ('nullable' in nextPartial) target.nullable = Boolean(nextPartial.nullable);
    if ('format' in nextPartial) target.format = String(nextPartial.format || '').trim();
    if ('description' in nextPartial) target.description = String(nextPartial.description || '').trim();
    if ('enumValues' in nextPartial) target.enumValues = parseEnumValues(nextPartial.enumValues);
    if ('pattern' in nextPartial) target.pattern = String(nextPartial.pattern || '').trim();
    if ('minLength' in nextPartial) target.minLength = normalizeOptionalNumber(nextPartial.minLength);
    if ('maxLength' in nextPartial) target.maxLength = normalizeOptionalNumber(nextPartial.maxLength);
    if ('minimum' in nextPartial) target.minimum = normalizeOptionalNumber(nextPartial.minimum);
    if ('maximum' in nextPartial) target.maximum = normalizeOptionalNumber(nextPartial.maximum);
    if ('itemsType' in nextPartial) {
      target.itemsType = FIELD_TYPES.includes(nextPartial.itemsType) ? nextPartial.itemsType : '';
    }
    if (target.type !== 'array') target.itemsType = '';
    render();
  });
}

function removeField(entityId, fieldName) {
  const found = findEntity(entityId);
  if (!found) return;
  withPersist(() => {
    found.entity.fields = found.entity.fields.filter((field) => field.name !== fieldName);
    render();
  });
}

function addRelationship(fromEntityId, toEntityId, fromCardinality, toCardinality) {
  if (!fromEntityId || !toEntityId || fromEntityId === toEntityId) {
    window.alert('Select two different entities to create a relationship.');
    return;
  }
  withPersist(() => {
    if (fromCardinality === 'N' && toCardinality === 'N') {
      const from = findEntity(fromEntityId);
      const to = findEntity(toEntityId);
      if (!from || !to) return;
      const junctionName = `${from.entity.name}${to.entity.name}`;
      const junction = addEntity(
        from.domain.id,
        junctionName,
        {
          x: Math.max(10, Math.min(300, (from.entity.x + to.entity.x) / 2)),
          y: Math.max(10, Math.min(190, (from.entity.y + to.entity.y) / 2)),
          fields: [
            ...defaultFields(),
            { name: `${from.entity.name.toLowerCase()}Id`, type: 'uuid', required: true, pk: false, fk: true, unique: false },
            { name: `${to.entity.name.toLowerCase()}Id`, type: 'uuid', required: true, pk: false, fk: true, unique: false }
          ]
        }
      );
      const relA = {
        id: nextId('rel'),
        fromEntityId: junction.id,
        toEntityId: fromEntityId,
        name: `${junctionName} -> ${from.entity.name}`,
        fromCardinality: 'N',
        toCardinality: '1'
      };
      const relB = {
        id: nextId('rel'),
        fromEntityId: junction.id,
        toEntityId: toEntityId,
        name: `${junctionName} -> ${to.entity.name}`,
        fromCardinality: 'N',
        toCardinality: '1'
      };
      state.relationships.push(relA);
      state.relationships.push(relB);
      state.selectedRelationshipId = relA.id;
      render();
      return;
    }

    const exists = state.relationships.some((relationship) => (
      relationship.fromEntityId === fromEntityId && relationship.toEntityId === toEntityId
    ) || (
      relationship.fromEntityId === toEntityId && relationship.toEntityId === fromEntityId
    ));
    if (exists) {
      window.alert('A relationship between these entities already exists.');
      return;
    }
    const relationship = {
      id: nextId('rel'),
      fromEntityId,
      toEntityId,
      name: buildRelationshipName(fromEntityId, toEntityId, fromCardinality, toCardinality),
      fromCardinality,
      toCardinality
    };
    state.relationships.push(relationship);
    if (dom.relationshipAutoFkCheck.checked) {
      const fromFound = findEntity(fromEntityId);
      const toFound = findEntity(toEntityId);
      if (fromFound && toFound) {
        if (fromCardinality === 'N' && toCardinality === '1') {
          ensureForeignKeyField(fromFound.entity, toFound.entity.name);
        }
        if (fromCardinality === '1' && toCardinality === 'N') {
          ensureForeignKeyField(toFound.entity, fromFound.entity.name);
        }
      }
    }
    state.selectedRelationshipId = relationship.id;
    render();
  });
}

function ensureForeignKeyField(entity, referencedEntityName) {
  const fkName = `${String(referencedEntityName || '').trim().toLowerCase()}Id`;
  if (!fkName || fkName === 'id') return;
  const exists = entity.fields.some((field) => normalizedName(field.name) === normalizedName(fkName));
  if (exists) return;
  entity.fields.push(normalizeField({
    name: fkName,
    type: 'uuid',
    required: true,
    pk: false,
    fk: true,
    unique: false
  }, entity.fields.length));
}

function deleteRelationship(relationshipId) {
  withPersist(() => {
    state.relationships = state.relationships.filter((relationship) => relationship.id !== relationshipId);
    if (state.selectedRelationshipId === relationshipId) state.selectedRelationshipId = null;
    render();
  });
}

function syncRelationshipInspector() {
  const relationship = state.relationships.find((candidate) => candidate.id === state.selectedRelationshipId);
  const disabled = !relationship;
  dom.relationshipNameInput.disabled = disabled;
  dom.relationshipFromEntitySelect.disabled = disabled;
  dom.relationshipToEntitySelect.disabled = disabled;
  dom.relationshipFromCardSelect.disabled = disabled;
  dom.relationshipToCardSelect.disabled = disabled;
  dom.saveRelationshipBtn.disabled = disabled;
  dom.reverseRelationshipBtn.disabled = disabled;
  if (!relationship) {
    dom.relationshipNameInput.value = '';
    dom.relationshipFromEntitySelect.value = '';
    dom.relationshipToEntitySelect.value = '';
    dom.relationshipFromCardSelect.value = '1';
    dom.relationshipToCardSelect.value = '1';
    dom.relationshipNameInput.placeholder = 'Select a relationship';
    return;
  }
  dom.relationshipNameInput.placeholder = 'Relationship name';
  dom.relationshipNameInput.value = relationship.name || '';
  dom.relationshipFromEntitySelect.value = relationship.fromEntityId;
  dom.relationshipToEntitySelect.value = relationship.toEntityId;
  dom.relationshipFromCardSelect.value = relationship.fromCardinality || '1';
  dom.relationshipToCardSelect.value = relationship.toCardinality || '1';
}

function saveSelectedRelationship() {
  const relationship = state.relationships.find((candidate) => candidate.id === state.selectedRelationshipId);
  if (!relationship) {
    window.alert('Select a relationship first.');
    return;
  }
  const fromEntityId = dom.relationshipFromEntitySelect.value;
  const toEntityId = dom.relationshipToEntitySelect.value;
  const fromCardinality = dom.relationshipFromCardSelect.value;
  const toCardinality = dom.relationshipToCardSelect.value;
  if (!fromEntityId || !toEntityId || fromEntityId === toEntityId) {
    window.alert('Relationship must link two different entities.');
    return;
  }
  if (!['1', 'N'].includes(fromCardinality) || !['1', 'N'].includes(toCardinality)) {
    window.alert('Cardinality must be "1" or "N".');
    return;
  }
  const duplicate = state.relationships.some((candidate) => {
    if (candidate.id === relationship.id) return false;
    return (
      (candidate.fromEntityId === fromEntityId && candidate.toEntityId === toEntityId) ||
      (candidate.fromEntityId === toEntityId && candidate.toEntityId === fromEntityId)
    );
  });
  if (duplicate) {
    window.alert('A relationship between these entities already exists.');
    return;
  }
  withPersist(() => {
    relationship.fromEntityId = fromEntityId;
    relationship.toEntityId = toEntityId;
    relationship.name = dom.relationshipNameInput.value.trim()
      || buildRelationshipName(fromEntityId, toEntityId, fromCardinality, toCardinality);
    relationship.fromCardinality = fromCardinality;
    relationship.toCardinality = toCardinality;
    render();
  });
}

function reverseSelectedRelationship() {
  const relationship = state.relationships.find((candidate) => candidate.id === state.selectedRelationshipId);
  if (!relationship) {
    window.alert('Select a relationship first.');
    return;
  }
  withPersist(() => {
    const nextFromEntityId = relationship.toEntityId;
    const nextToEntityId = relationship.fromEntityId;
    const nextFromCardinality = relationship.toCardinality;
    const nextToCardinality = relationship.fromCardinality;
    relationship.fromEntityId = nextFromEntityId;
    relationship.toEntityId = nextToEntityId;
    relationship.fromCardinality = nextFromCardinality;
    relationship.toCardinality = nextToCardinality;
    relationship.name = buildRelationshipName(
      relationship.fromEntityId,
      relationship.toEntityId,
      relationship.fromCardinality,
      relationship.toCardinality
    );
    render();
  });
}

function renderPickStatus() {
  if (!interaction.relationshipPickActive) {
    dom.relationshipPickStatus.textContent = 'Pick mode off';
    dom.pickRelationshipBtn.textContent = 'Pick On Canvas';
    return;
  }
  if (!interaction.relationshipPickFromEntityId) {
    dom.relationshipPickStatus.textContent = 'Pick mode: select first entity';
    dom.pickRelationshipBtn.textContent = 'Cancel Pick';
    return;
  }
  dom.relationshipPickStatus.textContent = `Pick mode: select target for ${entityLabel(interaction.relationshipPickFromEntityId)}`;
  dom.pickRelationshipBtn.textContent = 'Cancel Pick';
}

function setRelationshipPickMode(active) {
  interaction.relationshipPickActive = active;
  if (!active) interaction.relationshipPickFromEntityId = null;
  renderPickStatus();
}

function startRelationshipPickFromSelectedEntity() {
  if (!state.selectedEntityId) {
    window.alert('Select an entity first.');
    return;
  }
  interaction.relationshipPickActive = true;
  interaction.relationshipPickFromEntityId = state.selectedEntityId;
  renderPickStatus();
}

function handleEntityRelationshipPick(entityId) {
  if (!interaction.relationshipPickActive) return;
  if (!interaction.relationshipPickFromEntityId) {
    interaction.relationshipPickFromEntityId = entityId;
    renderPickStatus();
    return;
  }
  const fromId = interaction.relationshipPickFromEntityId;
  const toId = entityId;
  addRelationship(
    fromId,
    toId,
    dom.fromCardSelect.value,
    dom.toCardSelect.value
  );
  setRelationshipPickMode(false);
}

function attachDrag(el, onMove) {
  let pointerId = null;
  let startX = 0;
  let startY = 0;

  el.addEventListener('pointerdown', (event) => {
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    el.setPointerCapture(pointerId);
  });

  el.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId) return;
    const zoom = state.view.zoom || 1;
    const dx = (event.clientX - startX) / zoom;
    const dy = (event.clientY - startY) / zoom;
    startX = event.clientX;
    startY = event.clientY;
    onMove(dx, dy);
  });

  const end = (event) => {
    if (pointerId !== event.pointerId) return;
    el.releasePointerCapture(pointerId);
    pointerId = null;
  };

  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

function renderDomainList() {
  dom.domainList.innerHTML = '';
  state.domains.forEach((domain) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = state.selectedDomainId === domain.id ? 'active' : '';
    btn.textContent = domain.name;
    btn.onclick = () => setSelectedDomain(domain.id);
    li.appendChild(btn);
    dom.domainList.appendChild(li);
  });
}

function renderStatus() {
  const selected = getSelectedDomain();
  dom.status.textContent = selected ? `Selected domain: ${selected.name}` : 'No domain selected';
  dom.domainColorInput.value = selected?.color || '#60a5fa';
}

function setSelectedDomainColor(color) {
  const selected = getSelectedDomain();
  if (!selected) {
    window.alert('Select a domain first.');
    return;
  }
  const isHexColor = /^#[0-9a-f]{6}$/i.test(color);
  if (!isHexColor) {
    window.alert('Invalid color.');
    return;
  }
  withPersist(() => {
    selected.color = color;
    render();
  });
}

function saveSelectedEntityName(name) {
  const found = findEntity(state.selectedEntityId);
  if (!found) {
    window.alert('Select an entity first.');
    return;
  }
  const value = String(name || '').trim();
  if (!value) {
    window.alert('Entity name cannot be empty.');
    return;
  }
  if (isEntityNameTaken(found.domain, value, found.entity.id)) {
    window.alert(`Entity "${value}" already exists in ${found.domain.name}.`);
    return;
  }
  withPersist(() => {
    found.entity.name = value;
    render();
  });
}

function duplicateSelectedEntity() {
  const found = findEntity(state.selectedEntityId);
  if (!found) {
    window.alert('Select an entity first.');
    return;
  }
  const baseName = `${found.entity.name}_copy`;
  let candidateName = baseName;
  let suffix = 2;
  while (isEntityNameTaken(found.domain, candidateName)) {
    candidateName = `${baseName}_${suffix}`;
    suffix += 1;
  }
  withPersist(() => {
    const clonedFields = JSON.parse(JSON.stringify(found.entity.fields || []));
    addEntity(found.domain.id, candidateName, {
      x: Math.min(320, found.entity.x + 22),
      y: Math.min(180, found.entity.y + 22),
      fields: clonedFields
    });
    render();
  });
}

function moveSelectedEntityToDomain(targetDomainId) {
  const found = findEntity(state.selectedEntityId);
  if (!found) {
    window.alert('Select an entity first.');
    return;
  }
  if (!targetDomainId || found.domain.id === targetDomainId) return;
  const targetDomain = state.domains.find((domain) => domain.id === targetDomainId);
  if (!targetDomain) return;
  if (isEntityNameTaken(targetDomain, found.entity.name)) {
    window.alert(`Target domain already has entity "${found.entity.name}".`);
    return;
  }
  withPersist(() => {
    found.domain.entities = found.domain.entities.filter((entity) => entity.id !== found.entity.id);
    found.entity.x = 14 + (targetDomain.entities.length % 2) * 206;
    found.entity.y = 14 + Math.floor(targetDomain.entities.length / 2) * 118;
    targetDomain.entities.push(found.entity);
    state.selectedDomainId = targetDomain.id;
    render();
  });
}

function renderEntityOptions() {
  const entries = [];
  state.domains.forEach((domain) => {
    domain.entities.forEach((entity) => entries.push({ id: entity.id, label: `${domain.name} / ${entity.name}` }));
  });
  const selectedMoveDomain = dom.entityMoveDomainSelect.value;
  dom.entityMoveDomainSelect.innerHTML = '';
  state.domains.forEach((domain) => {
    const option = document.createElement('option');
    option.value = domain.id;
    option.textContent = domain.name;
    dom.entityMoveDomainSelect.appendChild(option);
  });
  if (state.domains.some((domain) => domain.id === selectedMoveDomain)) {
    dom.entityMoveDomainSelect.value = selectedMoveDomain;
  }

  const fill = (selectEl) => {
    const selected = selectEl.value;
    selectEl.innerHTML = '';
    entries.forEach((entry) => {
      const option = document.createElement('option');
      option.value = entry.id;
      option.textContent = entry.label;
      selectEl.appendChild(option);
    });
    if (entries.some((entry) => entry.id === selected)) selectEl.value = selected;
  };
  fill(dom.fromEntitySelect);
  fill(dom.toEntitySelect);
  fill(dom.relationshipFromEntitySelect);
  fill(dom.relationshipToEntitySelect);
}

function entityLabel(entityId) {
  const found = findEntity(entityId);
  return found ? `${found.domain.name}/${found.entity.name}` : entityId;
}

function renderRelationshipList() {
  dom.relationshipList.innerHTML = '';
  state.relationships.forEach((relationship) => {
    const li = document.createElement('li');
    li.className = 'relationship-item';
    const name = document.createElement('div');
    name.className = 'relationship-name';
    name.textContent = `${relationship.name || 'relation'} | ${entityLabel(relationship.fromEntityId)} (${relationship.fromCardinality}) -> (${relationship.toCardinality}) ${entityLabel(relationship.toEntityId)}`;
    if (state.selectedRelationshipId === relationship.id) {
      name.style.borderColor = '#2563eb';
      name.style.background = '#eff6ff';
    }
    name.onclick = () => {
      state.selectedRelationshipId = relationship.id;
      render();
    };
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'x';
    del.onclick = () => deleteRelationship(relationship.id);
    li.appendChild(name);
    li.appendChild(del);
    dom.relationshipList.appendChild(li);
  });
}

function fieldLabel(field) {
  const flags = [];
  if (field.pk) flags.push('PK');
  if (field.fk) flags.push('FK');
  if (field.unique) flags.push('UQ');
  if (field.required) flags.push('REQ');
  if (field.nullable) flags.push('NULL');
  return `${field.name}: ${field.type}${field.format ? `(${field.format})` : ''}${flags.length ? ` [${flags.join(', ')}]` : ''}`;
}

function editFieldMetadata(entityId, fieldName) {
  const found = findEntity(entityId);
  if (!found) return;
  const field = found.entity.fields.find((candidate) => candidate.name === fieldName);
  if (!field) return;
  const draft = {
    description: field.description || '',
    format: field.format || '',
    nullable: Boolean(field.nullable),
    enum: field.enumValues || [],
    pattern: field.pattern || '',
    minLength: field.minLength,
    maxLength: field.maxLength,
    minimum: field.minimum,
    maximum: field.maximum,
    itemsType: field.itemsType || ''
  };
  const raw = window.prompt(
    `Edit OpenAPI field metadata for "${field.name}" as JSON.`,
    JSON.stringify(draft, null, 2)
  );
  if (raw === null) return;
  try {
    const parsed = raw.trim() ? JSON.parse(raw) : {};
    updateField(entityId, fieldName, {
      description: String(parsed.description || '').trim(),
      format: String(parsed.format || '').trim(),
      nullable: Boolean(parsed.nullable),
      enumValues: parseEnumValues(parsed.enum),
      pattern: String(parsed.pattern || '').trim(),
      minLength: normalizeOptionalNumber(parsed.minLength),
      maxLength: normalizeOptionalNumber(parsed.maxLength),
      minimum: normalizeOptionalNumber(parsed.minimum),
      maximum: normalizeOptionalNumber(parsed.maximum),
      itemsType: FIELD_TYPES.includes(parsed.itemsType) ? parsed.itemsType : ''
    });
  } catch (error) {
    window.alert('Invalid JSON metadata payload.');
  }
}

function buildRelationshipName(fromEntityId, toEntityId, fromCardinality, toCardinality) {
  const from = entityLabel(fromEntityId);
  const to = entityLabel(toEntityId);
  if (fromCardinality === 'N' && toCardinality === '1') return `${from} belongs to ${to}`;
  if (fromCardinality === '1' && toCardinality === 'N') return `${from} has many ${to}`;
  if (fromCardinality === '1' && toCardinality === '1') return `${from} is linked to ${to}`;
  return `${from} relates to ${to}`;
}

function runModelChecks() {
  const issues = [];
  const pushIssue = (message, entityId = null) => issues.push({ message, entityId });
  const seenDomainNames = new Set();

  state.domains.forEach((domain) => {
    const domainNameKey = normalizedName(domain.name);
    if (!domain.name || !domainNameKey) {
      pushIssue('Domain with empty name found.');
    }
    if (seenDomainNames.has(domainNameKey)) {
      pushIssue(`Duplicate domain name: ${domain.name}`);
    }
    seenDomainNames.add(domainNameKey);

    const seenEntityNames = new Set();
    domain.entities.forEach((entity) => {
      const entityKey = normalizedName(entity.name);
      if (!entity.name || !entityKey) {
        pushIssue(`Entity with empty name in domain ${domain.name}`, entity.id);
      }
      if (seenEntityNames.has(entityKey)) {
        pushIssue(`Duplicate entity name in domain ${domain.name}: ${entity.name}`, entity.id);
      }
      seenEntityNames.add(entityKey);

      const seenFields = new Set();
      let hasPrimaryKey = false;
      entity.fields.forEach((field) => {
        const fieldKey = normalizedName(field.name);
        if (!field.name || !fieldKey) {
          pushIssue(`Entity ${domain.name}/${entity.name} has an empty field name.`, entity.id);
        }
        if (seenFields.has(fieldKey)) {
          pushIssue(`Entity ${domain.name}/${entity.name} has duplicated field: ${field.name}`, entity.id);
        }
        seenFields.add(fieldKey);
        if (field.type === 'array' && !field.itemsType) {
          pushIssue(`Field ${domain.name}/${entity.name}.${field.name} is array but has no itemsType.`, entity.id);
        }
        if (field.minLength !== null && field.maxLength !== null && field.minLength > field.maxLength) {
          pushIssue(`Field ${domain.name}/${entity.name}.${field.name} has minLength > maxLength.`, entity.id);
        }
        if (field.minimum !== null && field.maximum !== null && field.minimum > field.maximum) {
          pushIssue(`Field ${domain.name}/${entity.name}.${field.name} has minimum > maximum.`, entity.id);
        }
        if (field.pk) hasPrimaryKey = true;
      });
      if (!hasPrimaryKey) {
        pushIssue(`Entity ${domain.name}/${entity.name} has no primary key field.`, entity.id);
      }
    });
  });

  state.relationships.forEach((relationship) => {
    const from = findEntity(relationship.fromEntityId);
    const to = findEntity(relationship.toEntityId);
    if (!from || !to) {
      pushIssue(`Relationship "${relationship.name || relationship.id}" references missing entities.`);
    }
    if (!['1', 'N'].includes(relationship.fromCardinality) || !['1', 'N'].includes(relationship.toCardinality)) {
      pushIssue(`Relationship "${relationship.name || relationship.id}" has invalid cardinality.`);
    }
  });

  renderModelCheckResults(issues);
}

function renderModelCheckResults(issues) {
  dom.modelCheckList.innerHTML = '';
  if (!issues.length) {
    const li = document.createElement('li');
    li.textContent = 'No issues found.';
    dom.modelCheckList.appendChild(li);
    return;
  }
  issues.forEach((issue) => {
    const li = document.createElement('li');
    if (issue.entityId) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = issue.message;
      btn.onclick = () => focusEntity(issue.entityId);
      li.appendChild(btn);
    } else {
      li.textContent = issue.message;
    }
    dom.modelCheckList.appendChild(li);
  });
}

function renderDomains() {
  dom.canvasInner.querySelectorAll('.domain').forEach((node) => node.remove());

  state.domains.forEach((domain) => {
    const domainEl = document.createElement('section');
    domainEl.className = `domain${state.selectedDomainId === domain.id ? ' selected' : ''}`;
    domainEl.style.left = `${domain.x}px`;
    domainEl.style.top = `${domain.y}px`;
    domainEl.style.setProperty('--domain-color', domain.color);
    domainEl.onmousedown = () => setSelectedDomain(domain.id);

    const headerEl = document.createElement('header');
    headerEl.className = 'domain-header';
    headerEl.innerHTML = `<div class="domain-title">${domain.name}</div><div class="entity-count">${domain.entities.length} entities</div>`;
    domainEl.appendChild(headerEl);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'domain-body';

    attachDrag(headerEl, (dx, dy) => {
      withPersist(() => {
        domain.x = Math.max(0, snapCoordinate(domain.x + dx));
        domain.y = Math.max(0, snapCoordinate(domain.y + dy));
        domainEl.style.left = `${domain.x}px`;
        domainEl.style.top = `${domain.y}px`;
        renderEdges();
      });
    });

    domain.entities.forEach((entity) => {
      const entityEl = document.createElement('article');
      const selectedClass = state.selectedEntityId === entity.id ? ' selected' : '';
      entityEl.className = `entity${selectedClass}`;
      entityEl.style.left = `${entity.x}px`;
      entityEl.style.top = `${entity.y}px`;
      entityEl.onclick = (event) => {
        event.stopPropagation();
        setSelectedEntity(entity.id);
        handleEntityRelationshipPick(entity.id);
      };

      const entityHeader = document.createElement('header');
      entityHeader.className = 'entity-header';
      entityHeader.textContent = entity.name;
      attachDrag(entityHeader, (dx, dy) => {
        moveEntityInsideDomain(entity, entityEl, dx, dy);
      });

      const fieldsEl = document.createElement('ul');
      fieldsEl.className = 'entity-fields';
      if (!state.view.compactEntities) {
        entity.fields.forEach((field) => {
          const li = document.createElement('li');
          li.textContent = fieldLabel(field);
          fieldsEl.appendChild(li);
        });
      }

      entityEl.appendChild(entityHeader);
      entityEl.appendChild(fieldsEl);
      bodyEl.appendChild(entityEl);
    });

    domainEl.appendChild(bodyEl);
    dom.canvasInner.appendChild(domainEl);
  });
}

function moveEntityInsideDomain(entity, entityEl, dx, dy) {
  withPersist(() => {
    const maxX = 520 - 200;
    const maxY = 180;
    entity.x = Math.min(maxX, Math.max(8, snapCoordinate(entity.x + dx)));
    entity.y = Math.min(maxY, Math.max(8, snapCoordinate(entity.y + dy)));
    entityEl.style.left = `${entity.x}px`;
    entityEl.style.top = `${entity.y}px`;
    renderEdges();
  });
}

function entityCenterOnCanvas(entityId) {
  const found = findEntity(entityId);
  if (!found) return null;
  return {
    x: found.domain.x + found.entity.x + 95,
    y: found.domain.y + found.entity.y + 32
  };
}

function renderEdges() {
  dom.edges.innerHTML = '';
  state.relationships.forEach((relationship) => {
    const from = entityCenterOnCanvas(relationship.fromEntityId);
    const to = entityCenterOnCanvas(relationship.toEntityId);
    if (!from || !to) return;

    const controlX = (from.x + to.x) / 2;
    const isOrthogonal = state.view.edgeStyle === 'orthogonal';
    const edgePathD = isOrthogonal
      ? `M ${from.x} ${from.y} L ${controlX} ${from.y} L ${controlX} ${to.y} L ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} C ${controlX} ${from.y}, ${controlX} ${to.y}, ${to.x} ${to.y}`;
    const labelX = isOrthogonal ? controlX : controlX;
    const labelY = isOrthogonal ? ((from.y + to.y) / 2) : ((from.y + to.y) / 2);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const activeClass = state.selectedRelationshipId === relationship.id ? ' active' : '';
    path.setAttribute('class', `edge-line${activeClass}`);
    path.setAttribute('d', edgePathD);
    dom.edges.appendChild(path);

    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hit.setAttribute('class', 'edge-hit');
    hit.setAttribute('d', edgePathD);
    hit.addEventListener('click', (event) => {
      event.stopPropagation();
      state.selectedRelationshipId = relationship.id;
      render();
    });
    dom.edges.appendChild(hit);

    const fromLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    fromLabel.setAttribute('class', 'edge-label');
    fromLabel.setAttribute('x', String(from.x + 6));
    fromLabel.setAttribute('y', String(from.y - 6));
    fromLabel.textContent = relationship.fromCardinality;
    dom.edges.appendChild(fromLabel);

    const toLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    toLabel.setAttribute('class', 'edge-label');
    toLabel.setAttribute('x', String(to.x + 6));
    toLabel.setAttribute('y', String(to.y - 6));
    toLabel.textContent = relationship.toCardinality;
    dom.edges.appendChild(toLabel);

    const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameLabel.setAttribute('class', 'edge-label');
    nameLabel.setAttribute('x', String(labelX + 6));
    nameLabel.setAttribute('y', String(labelY - 6));
    nameLabel.textContent = relationship.name || '';
    dom.edges.appendChild(nameLabel);
  });
}

function renderEntityInspector() {
  const found = findEntity(state.selectedEntityId);
  dom.entityFieldList.innerHTML = '';
  dom.entityApiPreviewList.innerHTML = '';
  if (!found) {
    dom.entityInspectorTitle.textContent = 'No entity selected';
    dom.entityRenameInput.value = '';
    dom.entityRenameInput.disabled = true;
    dom.saveEntityRenameBtn.disabled = true;
    dom.duplicateEntityBtn.disabled = true;
    dom.entityMoveDomainSelect.disabled = true;
    dom.moveEntityBtn.disabled = true;
    dom.fieldTemplateSelect.disabled = true;
    dom.applyFieldTemplateBtn.disabled = true;
    return;
  }
  dom.entityInspectorTitle.textContent = `${found.domain.name} / ${found.entity.name}`;
  dom.entityRenameInput.value = found.entity.name;
  dom.entityRenameInput.disabled = false;
  dom.saveEntityRenameBtn.disabled = false;
  dom.duplicateEntityBtn.disabled = false;
  dom.entityMoveDomainSelect.disabled = false;
  dom.moveEntityBtn.disabled = false;
  dom.fieldTemplateSelect.disabled = false;
  dom.applyFieldTemplateBtn.disabled = false;
  dom.entityMoveDomainSelect.value = found.domain.id;
  found.entity.fields.forEach((field) => {
    const li = document.createElement('li');
    const row = document.createElement('div');
    row.className = 'field-row';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = field.name;
    const typeSelect = document.createElement('select');
    FIELD_TYPES.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      typeSelect.appendChild(option);
    });
    typeSelect.value = field.type;
    const requiredCheck = document.createElement('input');
    requiredCheck.type = 'checkbox';
    requiredCheck.checked = field.required;
    requiredCheck.title = 'required';
    const pkCheck = document.createElement('input');
    pkCheck.type = 'checkbox';
    pkCheck.checked = field.pk;
    pkCheck.title = 'PK';
    const fkCheck = document.createElement('input');
    fkCheck.type = 'checkbox';
    fkCheck.checked = field.fk;
    fkCheck.title = 'FK';
    const uniqueCheck = document.createElement('input');
    uniqueCheck.type = 'checkbox';
    uniqueCheck.checked = field.unique;
    uniqueCheck.title = 'unique';
    const nullableCheck = document.createElement('input');
    nullableCheck.type = 'checkbox';
    nullableCheck.checked = field.nullable;
    nullableCheck.title = 'nullable';
    const meta = document.createElement('button');
    meta.type = 'button';
    meta.textContent = 'meta';
    meta.onclick = () => editFieldMetadata(found.entity.id, field.name);
    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = 'save';
    save.onclick = () => updateField(found.entity.id, field.name, {
      name: nameInput.value,
      type: typeSelect.value,
      required: requiredCheck.checked,
      pk: pkCheck.checked,
      fk: fkCheck.checked,
      unique: uniqueCheck.checked,
      nullable: nullableCheck.checked
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'x';
    del.onclick = () => removeField(found.entity.id, field.name);
    row.appendChild(nameInput);
    row.appendChild(typeSelect);
    row.appendChild(requiredCheck);
    row.appendChild(pkCheck);
    row.appendChild(fkCheck);
    row.appendChild(uniqueCheck);
    row.appendChild(nullableCheck);
    row.appendChild(meta);
    row.appendChild(save);
    row.appendChild(del);
    li.appendChild(row);
    dom.entityFieldList.appendChild(li);
  });

  const domainPath = toPathToken(found.domain.name) || 'domain';
  const entityPath = toPathToken(found.entity.name) || 'entity';
  const schemaName = toSchemaName(found.domain.name, found.entity.name);
  const operations = [
    `GET /${domainPath}/${entityPath} -> list${schemaName}`,
    `POST /${domainPath}/${entityPath} -> create${schemaName}`,
    `GET /${domainPath}/${entityPath}/{id} -> get${schemaName}ById`,
    `PATCH /${domainPath}/${entityPath}/{id} -> update${schemaName}`,
    `DELETE /${domainPath}/${entityPath}/{id} -> delete${schemaName}`
  ];
  operations.forEach((operation) => {
    const li = document.createElement('li');
    li.textContent = operation;
    dom.entityApiPreviewList.appendChild(li);
  });
}

function exportAsJson() {
  const payload = { domains: state.domains, relationships: state.relationships, view: state.view };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'domain-designer.json';
  a.click();
  URL.revokeObjectURL(url);
}

function toOasType(fieldType) {
  if (fieldType === 'integer') return { type: 'integer' };
  if (fieldType === 'number') return { type: 'number' };
  if (fieldType === 'boolean') return { type: 'boolean' };
  if (fieldType === 'array') return { type: 'array' };
  if (fieldType === 'object') return { type: 'object' };
  if (fieldType === 'date') return { type: 'string', format: 'date' };
  if (fieldType === 'datetime') return { type: 'string', format: 'date-time' };
  if (fieldType === 'uuid') return { type: 'string', format: 'uuid' };
  return { type: 'string' };
}

function toOasFieldSchema(field) {
  const schema = {
    ...toOasType(field.type)
  };
  if (field.type === 'array') {
    schema.items = toOasType(field.itemsType || 'string');
  }
  if (field.format) schema.format = field.format;
  if (field.description) schema.description = field.description;
  if (field.nullable) schema.nullable = true;
  if (field.enumValues?.length) schema.enum = [...field.enumValues];
  if (typeof field.minLength === 'number') schema.minLength = field.minLength;
  if (typeof field.maxLength === 'number') schema.maxLength = field.maxLength;
  if (typeof field.minimum === 'number') schema.minimum = field.minimum;
  if (typeof field.maximum === 'number') schema.maximum = field.maximum;
  if (field.pattern) schema.pattern = field.pattern;
  return schema;
}

function fromOasType(schema = {}) {
  const type = schema.type;
  const format = schema.format;
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'string' && format === 'date') return 'date';
  if (type === 'string' && format === 'date-time') return 'datetime';
  if (type === 'string' && format === 'uuid') return 'uuid';
  return 'string';
}

function toSchemaName(domainName, entityName) {
  const normalize = (value) => String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const domainToken = normalize(domainName) || 'Domain';
  const entityToken = normalize(entityName) || 'Entity';
  return `${domainToken}_${entityToken}`;
}

function toPathToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function exportAsOas() {
  const schemas = {};
  const paths = {};
  const entitySchemaIndex = {};
  state.domains.forEach((domain) => {
    domain.entities.forEach((entity) => {
      const properties = {};
      const required = [];
      entity.fields.forEach((field) => {
        properties[field.name] = toOasFieldSchema(field);
        if (field.required) required.push(field.name);
      });
      const schemaName = toSchemaName(domain.name, entity.name);
      entitySchemaIndex[entity.id] = schemaName;
      schemas[schemaName] = {
        type: 'object',
        properties,
        required,
        'x-domain': domain.name,
        'x-entity': entity.name
      };

      const domainPath = toPathToken(domain.name);
      const entityPath = toPathToken(entity.name);
      const collectionPath = `/${domainPath}/${entityPath}`;
      const itemPath = `${collectionPath}/{id}`;
      const idParam = [{
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' }
      }];

      paths[collectionPath] = {
        get: {
          operationId: `list${schemaName}`,
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: `#/components/schemas/${schemaName}` }
                  }
                }
              }
            }
          }
        },
        post: {
          operationId: `create${schemaName}`,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
              }
            }
          },
          responses: {
            201: {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${schemaName}` }
                }
              }
            }
          }
        }
      };

      paths[itemPath] = {
        get: {
          operationId: `get${schemaName}ById`,
          parameters: idParam,
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${schemaName}` }
                }
              }
            },
            404: { description: 'Not found' }
          }
        },
        patch: {
          operationId: `update${schemaName}`,
          parameters: idParam,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: `#/components/schemas/${schemaName}` }
              }
            }
          },
          responses: {
            200: {
              description: 'Updated',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${schemaName}` }
                }
              }
            },
            404: { description: 'Not found' }
          }
        },
        delete: {
          operationId: `delete${schemaName}`,
          parameters: idParam,
          responses: {
            204: { description: 'Deleted' },
            404: { description: 'Not found' }
          }
        }
      };
    });
  });

  const oas = {
    openapi: '3.1.0',
    info: { title: 'Domain Designer Export', version: '1.0.0' },
    paths,
    components: { schemas },
    'x-relations': state.relationships.map((relationship) => ({
      name: relationship.name,
      fromEntityId: relationship.fromEntityId,
      toEntityId: relationship.toEntityId,
      fromSchema: entitySchemaIndex[relationship.fromEntityId] || null,
      toSchema: entitySchemaIndex[relationship.toEntityId] || null,
      fromCardinality: relationship.fromCardinality,
      toCardinality: relationship.toCardinality
    }))
  };

  const blob = new Blob([JSON.stringify(oas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'domain-designer-oas-3.1.json';
  a.click();
  URL.revokeObjectURL(url);
}

function seed() {
  state.domains = [];
  state.relationships = [];
  state.selectedDomainId = null;
  state.selectedEntityId = null;
  state.selectedRelationshipId = null;
  state.idCounter = 1;
  state.view = { zoom: 1, compactEntities: false, snapToGrid: true, edgeStyle: 'curved' };

  const users = addDomain('Users', { x: 80, y: 80, color: '#93c5fd' });
  const billing = addDomain('Billing', { x: 700, y: 200, color: '#86efac' });
  const user = addEntity(users.id, 'User', {
    fields: [
      { name: 'id', type: 'uuid', required: true, pk: true, fk: false, unique: true },
      { name: 'organizationId', type: 'uuid', required: true, pk: false, fk: true, unique: false },
      { name: 'username', type: 'string', required: true, pk: false, fk: false, unique: true }
    ]
  });
  const organization = addEntity(users.id, 'Organization', {
    fields: [
      { name: 'id', type: 'uuid', required: true, pk: true, fk: false, unique: true },
      { name: 'name', type: 'string', required: true, pk: false, fk: false, unique: false }
    ]
  });
  const invoice = addEntity(billing.id, 'Invoice', {
    fields: [
      { name: 'id', type: 'uuid', required: true, pk: true, fk: false, unique: true },
      { name: 'organizationId', type: 'uuid', required: true, pk: false, fk: true, unique: false },
      { name: 'total', type: 'number', required: true, pk: false, fk: false, unique: false }
    ]
  });
  state.relationships.push({
    id: nextId('rel'),
    fromEntityId: user.id,
    toEntityId: organization.id,
    name: 'User belongs to Organization',
    fromCardinality: 'N',
    toCardinality: '1'
  });
  state.relationships.push({
    id: nextId('rel'),
    fromEntityId: invoice.id,
    toEntityId: organization.id,
    name: 'Invoice belongs to Organization',
    fromCardinality: 'N',
    toCardinality: '1'
  });
}

function normalizeRelationship(relationship) {
  return {
    ...relationship,
    name: relationship.name || `${relationship.fromEntityId} -> ${relationship.toEntityId}`,
    fromCardinality: relationship.fromCardinality || 'N',
    toCardinality: relationship.toCardinality || '1'
  };
}

function fallbackId(prefix, seed) {
  return `${prefix}-import-${seed}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEntityInput(entity, entityIndex) {
  const fieldsInput = Array.isArray(entity?.fields) ? entity.fields : defaultFields();
  const fields = fieldsInput.map((field, fieldIndex) => normalizeField(field, fieldIndex));
  const entityName = String(entity?.name || '').trim() || `Entity_${entityIndex + 1}`;
  return {
    id: entity?.id || fallbackId('entity', entityIndex),
    name: entityName,
    x: Number.isFinite(entity?.x) ? entity.x : 14 + (entityIndex % 2) * 206,
    y: Number.isFinite(entity?.y) ? entity.y : 14 + Math.floor(entityIndex / 2) * 120,
    fields
  };
}

function normalizeDomainInput(domain, domainIndex) {
  const entitiesInput = Array.isArray(domain?.entities) ? domain.entities : [];
  const entities = entitiesInput.map((entity, entityIndex) => normalizeEntityInput(entity, entityIndex));
  return {
    id: domain?.id || fallbackId('domain', domainIndex),
    name: String(domain?.name || '').trim() || `Domain_${domainIndex + 1}`,
    color: /^#[0-9a-f]{6}$/i.test(domain?.color || '') ? domain.color : DOMAIN_COLORS[domainIndex % DOMAIN_COLORS.length],
    x: Number.isFinite(domain?.x) ? domain.x : 120 + domainIndex * 40,
    y: Number.isFinite(domain?.y) ? domain.y : 90 + domainIndex * 30,
    entities
  };
}

function normalizeStatePayload(parsed) {
  const domainsInput = Array.isArray(parsed?.domains) ? parsed.domains : [];
  const domains = domainsInput.map((domain, domainIndex) => normalizeDomainInput(domain, domainIndex));
  const entityIds = new Set(domains.flatMap((domain) => domain.entities.map((entity) => entity.id)));
  const relationshipsInput = Array.isArray(parsed?.relationships) ? parsed.relationships : [];
  const relationships = relationshipsInput
    .map(normalizeRelationship)
    .filter((relationship) => entityIds.has(relationship.fromEntityId) && entityIds.has(relationship.toEntityId));
  const view = {
    zoom: clampZoom(parsed?.view?.zoom || 1),
    compactEntities: Boolean(parsed?.view?.compactEntities),
    snapToGrid: parsed?.view?.snapToGrid !== false,
    edgeStyle: ['curved', 'orthogonal'].includes(parsed?.view?.edgeStyle) ? parsed.view.edgeStyle : 'curved'
  };
  return {
    domains,
    relationships,
    selectedDomainId: parsed?.selectedDomainId || domains[0]?.id || null,
    selectedEntityId: parsed?.selectedEntityId || null,
    selectedRelationshipId: parsed?.selectedRelationshipId || null,
    idCounter: parsed?.idCounter || 1,
    view
  };
}

function recomputeIdCounter() {
  const allIds = [];
  state.domains.forEach((domain) => {
    allIds.push(domain.id);
    domain.entities.forEach((entity) => allIds.push(entity.id));
  });
  state.relationships.forEach((relationship) => allIds.push(relationship.id));
  let max = 0;
  allIds.forEach((id) => {
    const parts = String(id).split('-');
    const numeric = Number(parts[parts.length - 1]);
    if (!Number.isNaN(numeric)) max = Math.max(max, numeric);
  });
  state.idCounter = Math.max(max + 1, 1);
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    seed();
    saveState();
    history.past = [];
    history.future = [];
    return;
  }
  try {
    const parsed = normalizeStatePayload(JSON.parse(raw));
    state.domains = parsed.domains;
    state.relationships = parsed.relationships;
    state.selectedDomainId = parsed.selectedDomainId;
    state.selectedEntityId = parsed.selectedEntityId;
    state.selectedRelationshipId = parsed.selectedRelationshipId;
    state.idCounter = parsed.idCounter;
    state.view = parsed.view;
    recomputeIdCounter();
    history.past = [];
    history.future = [];
  } catch (error) {
    seed();
    saveState();
    state.view = { zoom: 1, compactEntities: false, snapToGrid: true, edgeStyle: 'curved' };
    history.past = [];
    history.future = [];
  }
}

function importStateFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const normalized = normalizeStatePayload(parsed);
      withPersist(() => {
        state.domains = normalized.domains;
        state.relationships = normalized.relationships;
        state.selectedDomainId = normalized.selectedDomainId;
        state.selectedEntityId = normalized.selectedEntityId;
        state.selectedRelationshipId = normalized.selectedRelationshipId;
        state.view = normalized.view;
        state.idCounter = normalized.idCounter;
        recomputeIdCounter();
        render();
      }, { recordHistory: false });
      history.past = [];
      history.future = [];
      saveState();
    } catch (error) {
      window.alert('Could not parse JSON file.');
    }
  };
  reader.readAsText(file);
}

function importStateFromOasFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const schemas = parsed?.components?.schemas;
      if (!schemas || typeof schemas !== 'object') {
        window.alert('Invalid OAS file: components.schemas not found.');
        return;
      }

      const nextDomains = [];
      const byDomain = new Map();
      let domainIndex = 0;
      let entityIndex = 0;

      Object.entries(schemas).forEach(([schemaKey, schemaValue]) => {
        if (!schemaValue || typeof schemaValue !== 'object') return;
        const domainName = String(schemaValue['x-domain'] || 'Imported').trim() || 'Imported';
        const entityName = String(schemaValue['x-entity'] || schemaKey).trim() || schemaKey;
        const required = Array.isArray(schemaValue.required) ? schemaValue.required : [];
        const properties = schemaValue.properties && typeof schemaValue.properties === 'object'
          ? schemaValue.properties
          : {};

        let domain = byDomain.get(domainName);
        if (!domain) {
          domain = {
            id: fallbackId('domain', domainIndex),
            name: domainName,
            color: DOMAIN_COLORS[domainIndex % DOMAIN_COLORS.length],
            x: 120 + domainIndex * 40,
            y: 90 + domainIndex * 30,
            entities: []
          };
          domainIndex += 1;
          byDomain.set(domainName, domain);
          nextDomains.push(domain);
        }

        const fields = Object.entries(properties).map(([fieldName, fieldSchema]) => {
          const field = fieldSchema || {};
          return normalizeField({
            name: fieldName,
            type: fromOasType(field),
            format: String(field.format || '').trim(),
            description: String(field.description || '').trim(),
            nullable: Boolean(field.nullable),
            enumValues: parseEnumValues(field.enum),
            pattern: String(field.pattern || '').trim(),
            minLength: normalizeOptionalNumber(field.minLength),
            maxLength: normalizeOptionalNumber(field.maxLength),
            minimum: normalizeOptionalNumber(field.minimum),
            maximum: normalizeOptionalNumber(field.maximum),
            itemsType: fromOasType(field.items || {}),
            required: required.includes(fieldName),
            pk: fieldName === 'id',
            fk: /id$/i.test(fieldName) && fieldName !== 'id',
            unique: fieldName === 'id'
          }, 0);
        });

        domain.entities.push({
          id: fallbackId('entity', entityIndex),
          name: entityName,
          x: 14 + (domain.entities.length % 2) * 206,
          y: 14 + Math.floor(domain.entities.length / 2) * 120,
          fields: fields.length ? fields : defaultFields()
        });
        entityIndex += 1;
      });

      if (!nextDomains.length) {
        window.alert('No schemas found to import.');
        return;
      }

      withPersist(() => {
        state.domains = nextDomains;
        state.relationships = [];
        state.selectedDomainId = nextDomains[0]?.id || null;
        state.selectedEntityId = null;
        state.selectedRelationshipId = null;
        state.view = { zoom: 1, compactEntities: false, snapToGrid: true, edgeStyle: 'curved' };
        recomputeIdCounter();
        render();
      }, { recordHistory: false });
      history.past = [];
      history.future = [];
      saveState();
    } catch (error) {
      window.alert('Could not parse OAS JSON file.');
    }
  };
  reader.readAsText(file);
}

function render() {
  renderTabs();
  renderInterfaceAdapters();
  renderServiceConfiguration();
  renderDeployments();
  renderDomainList();
  renderStatus();
  renderView();
  renderDomains();
  renderEntityOptions();
  renderRelationshipList();
  syncRelationshipInspector();
  renderPickStatus();
  renderEntityInspector();
  renderEdges();
  dom.undoBtn.disabled = history.past.length === 0;
  dom.redoBtn.disabled = history.future.length === 0;
}

function wireEvents() {
  if (dom.tabDomainDesignerBtn) dom.tabDomainDesignerBtn.onclick = () => setActiveTab('domain-designer');
  if (dom.tabInterfaceDesignerBtn) dom.tabInterfaceDesignerBtn.onclick = () => setActiveTab('interface-designer');
  if (dom.tabServiceConfigBtn) dom.tabServiceConfigBtn.onclick = () => setActiveTab('service-config');
  if (dom.tabDeployManagementBtn) dom.tabDeployManagementBtn.onclick = () => setActiveTab('deploy-management');

  if (dom.addInterfaceAdapterBtn) {
    dom.addInterfaceAdapterBtn.onclick = () => {
      const type = dom.interfaceTypeSelect.value;
      const framework = String(dom.interfaceFrameworkInput.value || '').trim();
      const entrypoint = String(dom.interfaceEntrypointInput.value || '').trim();
      const controller = String(dom.interfaceControllerInput.value || '').trim();
      if (!framework || !entrypoint || !controller) {
        window.alert('Framework/runtime, entrypoint and controller mapping are required.');
        return;
      }
      withPersist(() => {
        state.interfaces.push({ type, framework, entrypoint, controller });
        dom.interfaceFrameworkInput.value = '';
        dom.interfaceEntrypointInput.value = '';
        dom.interfaceControllerInput.value = '';
        renderInterfaceAdapters();
      });
    };
  }

  if (dom.saveServiceConfigBtn) {
    dom.saveServiceConfigBtn.onclick = () => {
      withPersist(() => {
        const parsePort = (value, fallback) => {
          const port = Number(value);
          if (!Number.isInteger(port) || port < 1 || port > 65535) return fallback;
          return port;
        };
        state.serviceConfiguration = {
          serviceKind: dom.serviceKindSelect.value,
          runMode: dom.runModeSelect.value,
          cloudProvider: dom.cloudProviderSelect.value,
          staticAssetsPath: String(dom.serviceStaticAssetsInput.value || '').trim(),
          ports: {
            rest: parsePort(dom.serviceHttpPortInput?.value, 3000),
            websocket: parsePort(dom.serviceWebsocketPortInput?.value, 3001),
            grpc: parsePort(dom.serviceGrpcPortInput?.value, 3002)
          }
        };
        renderServiceConfiguration();
      }, { recordHistory: false });
    };
  }

  if (dom.runtimeEnvRefreshBtn) {
    dom.runtimeEnvRefreshBtn.onclick = async () => {
      try {
        await loadRuntimeEnvironment(dom.runtimeEnvSelect?.value || 'dev');
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Could not load runtime environment.');
      }
    };
  }

  if (dom.runtimeEnvSaveBtn) {
    dom.runtimeEnvSaveBtn.onclick = async () => {
      try {
        await saveRuntimeEnvironment();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Could not save runtime environment.');
      }
    };
  }

  if (dom.runtimeEnvSelect) {
    dom.runtimeEnvSelect.onchange = () => {
      loadRuntimeEnvironment(dom.runtimeEnvSelect.value)
        .catch((error) => {
          window.alert(error instanceof Error ? error.message : 'Could not load runtime environment.');
        });
    };
  }

  if (dom.addDeployTargetBtn) {
    dom.addDeployTargetBtn.onclick = () => {
      const name = String(dom.deployNameInput.value || '').trim();
      const type = dom.deployTypeSelect.value;
      const region = String(dom.deployRegionInput.value || '').trim();
      const runtime = String(dom.deployRuntimeInput.value || '').trim();
      if (!name || !region || !runtime) {
        window.alert('Deployment name, region and runtime are required.');
        return;
      }
      withPersist(() => {
        state.deployments.push({ name, type, region, runtime });
        dom.deployNameInput.value = '';
        dom.deployRegionInput.value = '';
        dom.deployRuntimeInput.value = '';
        renderDeployments();
      }, { recordHistory: false });
    };
  }

  dom.addDomainBtn.onclick = () => {
    const value = dom.domainNameInput.value.trim();
    if (!value) return;
    if (isDomainNameTaken(value)) {
      window.alert(`Domain "${value}" already exists.`);
      return;
    }
    withPersist(() => {
      addDomain(value);
      dom.domainNameInput.value = '';
      render();
    });
  };
  dom.domainNameInput.onkeydown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    dom.addDomainBtn.click();
  };
  dom.setDomainColorBtn.onclick = () => setSelectedDomainColor(dom.domainColorInput.value);

  dom.renameDomainBtn.onclick = () => {
    const selected = getSelectedDomain();
    if (!selected) return;
    const next = window.prompt('Rename domain', selected.name);
    if (!next || !next.trim()) return;
    if (isDomainNameTaken(next.trim(), selected.id)) {
      window.alert(`Domain "${next.trim()}" already exists.`);
      return;
    }
    withPersist(() => {
      selected.name = next.trim();
      render();
    });
  };

  dom.deleteDomainBtn.onclick = () => {
    const selected = getSelectedDomain();
    if (!selected) return;
    if (!window.confirm(`Delete domain "${selected.name}" and all entities?`)) return;
    withPersist(() => {
      deleteDomain(selected.id);
      render();
    });
  };

  dom.addEntityBtn.onclick = () => {
    const selected = getSelectedDomain();
    if (!selected) return window.alert('Select a domain first.');
    const value = dom.entityNameInput.value.trim();
    if (!value) return;
    if (isEntityNameTaken(selected, value)) {
      window.alert(`Entity "${value}" already exists in ${selected.name}.`);
      return;
    }
    withPersist(() => {
      addEntity(selected.id, value);
      dom.entityNameInput.value = '';
      render();
    });
  };
  dom.entityNameInput.onkeydown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    dom.addEntityBtn.click();
  };

  dom.renameEntityBtn.onclick = () => {
    saveSelectedEntityName(dom.entityRenameInput.value);
  };
  dom.duplicateEntityBtn.onclick = duplicateSelectedEntity;

  dom.deleteEntityBtn.onclick = () => {
    const found = findEntity(state.selectedEntityId);
    if (!found) return;
    if (!window.confirm(`Delete entity "${found.entity.name}" and related links?`)) return;
    withPersist(() => {
      deleteEntity(found.entity.id);
      render();
    });
  };
  dom.entitySearchBtn.onclick = () => {
    const search = dom.entitySearchInput.value.trim();
    if (!search) return;
    const found = findEntityByName(search);
    if (!found) {
      window.alert(`No entity found for "${search}".`);
      return;
    }
    focusEntity(found.entity.id);
  };
  dom.entitySearchInput.onkeydown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    dom.entitySearchBtn.click();
  };
  dom.saveEntityRenameBtn.onclick = () => saveSelectedEntityName(dom.entityRenameInput.value);
  dom.entityRenameInput.onkeydown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    dom.saveEntityRenameBtn.click();
  };
  dom.moveEntityBtn.onclick = () => moveSelectedEntityToDomain(dom.entityMoveDomainSelect.value);

  dom.addRelationshipBtn.onclick = () => {
    addRelationship(
      dom.fromEntitySelect.value,
      dom.toEntitySelect.value,
      dom.fromCardSelect.value,
      dom.toCardSelect.value
    );
  };
  dom.pickRelationshipBtn.onclick = () => {
    setRelationshipPickMode(!interaction.relationshipPickActive);
  };
  dom.saveRelationshipBtn.onclick = saveSelectedRelationship;
  dom.reverseRelationshipBtn.onclick = reverseSelectedRelationship;
  dom.undoBtn.onclick = undo;
  dom.redoBtn.onclick = redo;
  dom.zoomInBtn.onclick = () => zoomBy(0.1);
  dom.zoomOutBtn.onclick = () => zoomBy(-0.1);
  dom.edgeStyleSelect.onchange = () => {
    const value = dom.edgeStyleSelect.value;
    if (!['curved', 'orthogonal'].includes(value)) return;
    withPersist(() => {
      state.view.edgeStyle = value;
      render();
    }, { recordHistory: false });
  };
  dom.toggleCompactViewBtn.onclick = toggleCompactView;
  dom.toggleSnapBtn.onclick = () => {
    withPersist(() => {
      state.view.snapToGrid = !state.view.snapToGrid;
      renderView();
    }, { recordHistory: false });
  };
  dom.runModelCheckBtn.onclick = runModelChecks;
  dom.autoLayoutBtn.onclick = autoLayout;
  dom.fitViewBtn.onclick = fitView;
  dom.resetViewBtn.onclick = resetView;

  dom.addFieldBtn.onclick = addFieldToSelectedEntity;
  dom.applyFieldTemplateBtn.onclick = applyFieldTemplateToSelectedEntity;
  dom.fieldNameInput.onkeydown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    dom.addFieldBtn.click();
  };
  dom.exportJsonBtn.onclick = exportAsJson;
  dom.exportOasBtn.onclick = exportAsOas;
  dom.importJsonBtn.onclick = () => dom.importJsonInput.click();
  dom.importJsonInput.onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importStateFromFile(file);
    dom.importJsonInput.value = '';
  };
  dom.importOasBtn.onclick = () => dom.importOasInput.click();
  dom.importOasInput.onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importStateFromOasFile(file);
    dom.importOasInput.value = '';
  };

  dom.resetCanvasBtn.onclick = () => {
    if (!window.confirm('Reset canvas to default template?')) return;
    withPersist(() => {
      seed();
      render();
    });
  };

  dom.clearStorageBtn.onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.alert('Saved designer state cleared.');
  };

  dom.canvas.addEventListener('click', (event) => {
    if (event.target !== dom.canvas && event.target !== dom.edges && event.target !== dom.canvasInner) return;
    state.selectedRelationshipId = null;
    render();
  });

  dom.canvas.addEventListener('wheel', (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.1 : 0.1;
    zoomBy(direction);
  }, { passive: false });

  dom.canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 1 && !interaction.spacePressed) return;
    interaction.panning = true;
    interaction.panStartX = event.clientX;
    interaction.panStartY = event.clientY;
    interaction.scrollStartLeft = dom.canvas.scrollLeft;
    interaction.scrollStartTop = dom.canvas.scrollTop;
    dom.canvas.classList.add('panning');
    event.preventDefault();
  });

  dom.canvas.addEventListener('pointermove', (event) => {
    if (!interaction.panning) return;
    const dx = event.clientX - interaction.panStartX;
    const dy = event.clientY - interaction.panStartY;
    dom.canvas.scrollLeft = interaction.scrollStartLeft - dx;
    dom.canvas.scrollTop = interaction.scrollStartTop - dy;
  });

  const stopPan = () => {
    interaction.panning = false;
    dom.canvas.classList.remove('panning');
  };
  dom.canvas.addEventListener('pointerup', stopPan);
  dom.canvas.addEventListener('pointercancel', stopPan);
  dom.canvas.addEventListener('pointerleave', stopPan);

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const targetTag = String(event.target?.tagName || '').toLowerCase();
    const editingInput = ['input', 'textarea', 'select'].includes(targetTag);
    if (event.code === 'Space') {
      if (editingInput) return;
      event.preventDefault();
      interaction.spacePressed = true;
      dom.canvas.classList.add('space-mode');
      return;
    }
    if (key === 'escape') {
      setRelationshipPickMode(false);
      state.selectedRelationshipId = null;
      render();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && (key === 'y' || (key === 'z' && event.shiftKey))) {
      event.preventDefault();
      redo();
      return;
    }
    if (event.altKey && key === 'l') {
      event.preventDefault();
      autoLayout();
      return;
    }
    if (event.altKey && key === 'r') {
      event.preventDefault();
      startRelationshipPickFromSelectedEntity();
      return;
    }
    if (event.altKey && key === 'v') {
      event.preventDefault();
      toggleCompactView();
      return;
    }
    if (!editingInput && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) && state.selectedEntityId) {
      const found = findEntity(state.selectedEntityId);
      if (!found) return;
      const step = event.shiftKey ? 16 : 8;
      const maxX = 520 - 200;
      const maxY = 180;
      withPersist(() => {
        if (key === 'arrowleft') found.entity.x = Math.max(8, snapCoordinate(found.entity.x - step));
        if (key === 'arrowright') found.entity.x = Math.min(maxX, snapCoordinate(found.entity.x + step));
        if (key === 'arrowup') found.entity.y = Math.max(8, snapCoordinate(found.entity.y - step));
        if (key === 'arrowdown') found.entity.y = Math.min(maxY, snapCoordinate(found.entity.y + step));
        render();
      });
      event.preventDefault();
      return;
    }
    if ((key === 'delete' || key === 'backspace') && state.selectedRelationshipId) {
      if (editingInput) return;
      event.preventDefault();
      deleteRelationship(state.selectedRelationshipId);
      return;
    }
    if ((key === 'delete' || key === 'backspace') && state.selectedEntityId) {
      if (editingInput) return;
      const found = findEntity(state.selectedEntityId);
      if (!found) return;
      const ok = window.confirm(`Delete entity "${found.entity.name}" and related links?`);
      if (!ok) return;
      event.preventDefault();
      deleteEntity(found.entity.id);
      render();
    }
  });

  window.addEventListener('keyup', (event) => {
    if (event.code !== 'Space') return;
    interaction.spacePressed = false;
    dom.canvas.classList.remove('space-mode');
  });
}

loadState();
wireEvents();
render();
loadRuntimeEnvironment(state.runtimeEnvironment?.environment || 'dev')
  .catch(() => {
    renderRuntimeEnvironment();
  });
