```javascript
// Interceptar el submit del formulario
(function() {
    // Buscar el formulario
    const form = document.querySelector('form[action*="contactform"]') || 
                 document.querySelector('form[name*="contact"]') ||
                 document.querySelector('form');
    
    if (!form) {
        console.error('❌ No se encontró el formulario');
        return;
    }
    
    console.log('✅ Formulario encontrado:', form);
    
    // Guardar el handler original si existe
    const originalSubmit = form.onsubmit;
    
    // Interceptar el submit
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // DETENER el envío
        e.stopPropagation();
        
        console.log('🛑 FORMULARIO INTERCEPTADO - Analizando datos...\n');
        
        // Mostrar todos los inputs hidden que se crearían
        console.log('=== INPUTS HIDDEN ACTUALES ===');
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
            console.log(`  ${input.name}: "${input.value}"`);
        });
        
        // Mostrar datos del FormData
        console.log('\n=== FORMDATA QUE SE ENVIARÍA ===');
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            const tipo = typeof value;
            const vacio = (value === '' || value === null || value === undefined);
            console.log(`  ${key}: "${value}" (tipo: ${tipo}, vacío: ${vacio})`);
        }
        
        // Analizar WebComponents
        console.log('\n=== WEBCOMPONENTS ===');
        const webComponents = form.querySelectorAll('dav-textfield, dav-dropdown, dav-checkbox, dav-textarea');
        webComponents.forEach(wc => {
            const name = wc.getAttribute('name') || wc.getAttribute('id') || 'sin-nombre';
            const value = wc.value;
            const checked = wc.checked;
            console.log(`  <${wc.tagName.toLowerCase()}> name="${name}"`);
            console.log(`    .value = "${value}" (tipo: ${typeof value})`);
            if (wc.tagName.toLowerCase() === 'dav-checkbox') {
                console.log(`    .checked = ${checked} (tipo: ${typeof checked})`);
            }
        });
        
        // Validación simulada del backend
        console.log('\n=== SIMULACIÓN VALIDACIÓN BACKEND ===');
        const campos = ['nombre', 'tipoIdentificacion', 'numeroDocumento', 'telefono', 'correo', 'asunto', 'detalle', 'autorizacion'];
        campos.forEach(campo => {
            const valor = formData.get(campo);
            const esValido = valor && valor.toString().trim() !== '';
            const icon = esValido ? '✅' : '❌';
            console.log(`  ${icon} ${campo}: "${valor}" - ${esValido ? 'VÁLIDO' : 'FALLA isNotBlank()'}`);
        });
        
        // Validación especial de email
        const correo = formData.get('correo');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValido = correo && emailRegex.test(correo);
        console.log(`\n  📧 Correo "${correo}" - formato ${emailValido ? '✅ válido' : '❌ inválido'}`);
        
        // Validación especial de autorización
        const auth = formData.get('autorizacion');
        const authValida = auth && (auth.toLowerCase() === 'true' || auth.toLowerCase() === 'on');
        console.log(`  ☑️ Autorización "${auth}" - ${authValida ? '✅ válido' : '❌ FALLA (debe ser "true" o "on")'}`);
        
        console.log('\n🔴 ENVÍO BLOQUEADO - Revisa los datos arriba');
        console.log('💡 Para enviar de verdad, recarga la página y envía sin este script');
        
        return false;
    }, true); // true = capture phase
    
    console.log('🎯 Script instalado. Ahora llena el formulario y presiona Enviar.');
    console.log('   El envío será bloqueado y verás los datos en consola.');
})();
```