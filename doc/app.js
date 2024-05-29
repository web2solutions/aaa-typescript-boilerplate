function renderDoc(url) {
  window.ui = SwaggerUIBundle({
    url,
    dom_id: '#swagger-ui',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    layout: "StandaloneLayout",
  });
};

window.onload = async () => {
  const resp = await fetch(`${window.location.origin}/versions`);
  const { versions } = await resp.json();
  console.log(versions)
  Object.keys(versions).forEach(version => {
    const a = document.createElement('a');
    a.innerHTML = `Version - ${version}`;
    // a.href = `${window.location.origin}/docs/${version}`;
    a.onclick = function () {
      renderDoc(`${window.location.origin}/docs/${version}`);
    };
    document.body.appendChild(a)
  });
};