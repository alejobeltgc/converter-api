```javascript
// Interceptar el envío REAL y ver los datos
(function() {
    const originalSubmit = HTMLFormElement.prototype.submit;
    
    HTMLFormElement.prototype.submit = function() {
        console.log('🚀 FORMULARIO A PUNTO DE ENVIARSE');
        console.log('='.repeat(60));
        
        // Mostrar todos los inputs del formulario
        const allInputs = this.querySelectorAll('input, select, textarea');
        console.log(`Total de elementos: ${allInputs.length}\n`);
        
        allInputs.forEach(input => {
            console.log(`📝 ${input.name || '(sin nombre)'}: "${input.value}" [type: ${input.type}]`);
        });
        
        console.log('\n=== FORM DATA ===');
        const fd = new FormData(this);
        for (let [key, val] of fd.entries()) {
            console.log(`  ${key} = "${val}"`);
        }
        
        console.log('='.repeat(60));
        console.log('⏳ Enviando en 3 segundos... (revisa los datos arriba)');
        
        const form = this;
        setTimeout(() => {
            originalSubmit.call(form);
        }, 3000);
    };
    
    console.log('✅ Interceptor instalado. Ahora presiona el botón ENVIAR del formulario.');
    console.log('   Verás los datos 3 segundos antes de que se envíe.');
})();
```