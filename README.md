const form = document.querySelector('.dav-form-layout');
const fields = [
  { selector: 'dav-textfield[label="Nombre"]', name: "nombre" },
  { selector: 'dav-dropdown[label="Tipo de identificación"]', name: "tipoIdentificacion" },
  { selector: 'dav-textfield[label="Número de documento"]', name: "numeroDocumento" },
  { selector: 'dav-textfield[label="Teléfono/Celular"]', name: "telefono" },
  { selector: 'dav-textfield[label="Correo electrónico"]', name: "correo" },
  { selector: 'dav-dropdown[label="Asunto"]', name: "asunto" },
  { selector: "dav-textarea[label]", name: "detalle" },
  { selector: "dav-checkbox", name: "autorizacion" }
];

console.log("=== ANÁLISIS COMPLETO DE CAMPOS ===");
fields.forEach(f => {
  const el = form.querySelector(f.selector);
  console.log(`\n--- ${f.name} ---`);
  if (!el) {
    console.log("  ❌ ELEMENTO NO ENCONTRADO");
    return;
  }
  console.log("  tagName:", el.tagName);
  
  // Valor según la lógica del JSP
  const value = el.tagName === "DAV-CHECKBOX" ? el.checked : el.value;
  console.log("  typeof value:", typeof value);
  console.log("  value:", value);
  console.log("  String(value):", String(value));
  
  // Lo que se enviaría como hidden input
  const hiddenValue = String(value);
  console.log("  → Se enviaría:", `"${hiddenValue}"`);
  
  // Validación que hace el backend
  const isBlank = hiddenValue === "" || hiddenValue === "undefined" || hiddenValue === "null";
  console.log("  → ¿Está vacío?:", isBlank ? "❌ SÍ" : "✅ NO");
});

// Validación específica de autorización
const checkbox = form.querySelector("dav-checkbox");
const authValue = String(checkbox?.checked);
console.log("\n=== VALIDACIÓN AUTORIZACIÓN ===");
console.log("Valor enviado:", `"${authValue}"`);
console.log("¿Pasa 'true'.equalsIgnoreCase?:", authValue.toLowerCase() === "true" ? "✅ SÍ" : "❌ NO");
console.log("¿Pasa 'on'.equalsIgnoreCase?:", authValue.toLowerCase() === "on" ? "✅ SÍ" : "❌ NO");
