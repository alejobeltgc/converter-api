```javascript
// Interceptar el click del dav-button
(function() {
    const form = document.querySelector('.dav-form-layout');
    const button = form.querySelector('dav-button');
    
    // Crear un botón de debug
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔍 DEBUG: Ver datos sin enviar';
    debugBtn.style.cssText = 'background: #ff5722; color: white; padding: 10px 20px; margin: 10px; cursor: pointer; border: none; border-radius: 5px;';
    button.parentElement.appendChild(debugBtn);
    
    debugBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
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
        
        console.clear();
        console.log('🔍 ANÁLISIS DE DATOS DEL FORMULARIO\n');
        console.log('='.repeat(60));
        
        let allValid = true;
        
        fields.forEach(f => {
            const el = form.querySelector(f.selector);
            if (!el) {
                console.log(`❌ ${f.name}: ELEMENTO NO ENCONTRADO`);
                allValid = false;
                return;
            }
            
            let rawValue;
            let stringValue;
            
            if (el.tagName === "DAV-CHECKBOX") {
                rawValue = el.checked;
                stringValue = String(el.checked);
            } else {
                rawValue = el.value;
                stringValue = String(el.value || '');
            }
            
            // Simular validación del backend
            let isValid = true;
            let reason = '';
            
            if (f.name === 'correo') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = stringValue && emailRegex.test(stringValue);
                reason = isValid ? 'email válido' : 'FALLA isValidEmail()';
            } else if (f.name === 'autorizacion') {
                isValid = stringValue.toLowerCase() === 'true' || stringValue.toLowerCase() === 'on';
                reason = isValid ? 'autorización válida' : 'FALLA isValidAuthorization() - necesita "true" o "on"';
            } else {
                isValid = stringValue && stringValue.trim() !== '';
                reason = isValid ? 'OK' : 'FALLA isNotBlank()';
            }
            
            if (!isValid) allValid = false;
            
            const icon = isValid ? '✅' : '❌';
            console.log(`${icon} ${f.name}:`);
            console.log(`   Raw value: ${JSON.stringify(rawValue)} (${typeof rawValue})`);
            console.log(`   String value: "${stringValue}"`);
            console.log(`   Validación: ${reason}`);
            console.log('');
        });
        
        console.log('='.repeat(60));
        console.log(allValid ? '✅ TODOS LOS CAMPOS PASARÍAN LA VALIDACIÓN' : '❌ HAY CAMPOS QUE FALLARÍAN LA VALIDACIÓN');
        
        return false;
    });
    
    console.log('✅ Botón de DEBUG agregado. Llena el formulario y presiona el botón naranja "DEBUG"');
})();
```