document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', () => {
        if (input.checkValidity() || input.value.trim() !== '') {
            const errorSpan = input.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-message')) {
                errorSpan.textContent = '';
            }
        }
                });
            })
        });

    const registrationForm = document.getElementById('registration-form');
    const patientListContainer = document.getElementById('patient-list-container');

    const getPacientes = () => JSON.parse(localStorage.getItem('pacientes')) || [];

    const guardarPaciente = (paciente) => {
        const pacientes = getPacientes();
        pacientes.push(paciente);
        localStorage.setItem('pacientes', JSON.stringify(pacientes));
    };

    function validarRut(rutCompleto) {
    rutCompleto = rutCompleto.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (!/^[0-9]+[0-9K]$/.test(rutCompleto)) return false;

    const cuerpo = rutCompleto.slice(0, -1);
    const dv = rutCompleto.slice(-1);
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvFinal = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dv === dvFinal;
}

    if (registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            document.querySelectorAll('.error-message').forEach(span => span.textContent = '');

            let valid = true;


            const getInput = (id) => document.getElementById(id);
            const showError = (id, message) => {
                const span = getInput(id).nextElementSibling;
                span.textContent = message;
                valid = false;
            };

            // Campos básicos
            const nombre = getInput('nombre').value.trim();
            const apellido = getInput('apellido').value.trim();
            const rut = getInput('rut').value.trim();
            const edad = parseInt(getInput('edad').value);
            const sexo = getInput('sexo').value;

            const temperatura = parseFloat(getInput('temperatura').value);
            const presionSistolica = parseInt(getInput('presionSistolica').value);
            const presionDiastolica = parseInt(getInput('presionDiastolica').value);
            const pulsaciones = parseInt(getInput('pulsaciones').value);
            const oxigeno = parseInt(getInput('oxigeno').value);
            const sintomas = new Set();
            document.querySelectorAll('.symptom-grid input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.checked) {
                    sintomas.add(checkbox.value);
                }
            });
            
            const otrosSintomas = getInput('otrosSintomas').value;

            // Validaciones
            if (!nombre) showError('nombre', 'Campo obligatorio');
            if (!apellido) showError('apellido', 'Campo obligatorio');
            if (!rut) {
                showError('rut', 'Campo obligatorio');
            } else if (!validarRut(rut)) {
                showError('rut', 'RUT no válido');
            }
            if (isNaN(edad) || edad <= 0) showError('edad', 'Edad debe ser mayor a 0');
            if (!sexo) showError('sexo', 'Seleccione un sexo');

            if (isNaN(temperatura) || temperatura < 30 || temperatura > 45) showError('temperatura', 'Temperatura entre 30°C y 45°C');
            if (isNaN(presionSistolica) || presionSistolica <= 0) showError('presionSistolica', 'Debe ser un número positivo');
            if (isNaN(presionDiastolica) || presionDiastolica <= 0) showError('presionDiastolica', 'Debe ser un número positivo');
            if (isNaN(pulsaciones) || pulsaciones <= 0) showError('pulsaciones', 'Debe ser un número positivo');
            if (isNaN(oxigeno) || oxigeno <= 0) showError('oxigeno', 'Debe ser un número positivo');
            if (sintomas.size === 0) showError('sintomas', 'Seleccione al menos un síntoma');
            if (!valid) return;


            if (otrosSintomas.trim() !== '') {
                otrosSintomas.split(',').forEach(s => sintomas.add(s.trim()));
            }

            const total = sintomas.size;
            let clasificacion = total <= 3 ? 'Verde' : total <= 5 ? 'Amarillo' : 'Rojo';

            const paciente = {
                nombre, apellido, rut, edad, sexo,
                temperatura, presion: `${presionSistolica}/${presionDiastolica}`,
                pulsaciones, oxigeno,
                sintomas: Array.from(sintomas),
                clasificacion
            };

            guardarPaciente(paciente);

            // Mostrar resultado
            document.getElementById('classification-badge').textContent = clasificacion;
            document.getElementById('classification-badge').className = `badge-${clasificacion.toLowerCase()}`;
            document.getElementById('result-container').style.display = 'block';

            registrationForm.reset();
        });
    }

    // Mostrar pacientes en pacientes.html
    if (patientListContainer) {
        const pacientes = getPacientes();

        if (pacientes.length === 0) {
            patientListContainer.innerHTML = '<p>No hay pacientes registrados.</p>';
        } else {
            pacientes.forEach((p, index) => {
                const card = document.createElement('div');
                card.className = `patient-card card-${p.clasificacion.toLowerCase()}`;
                card.innerHTML = `
                    <div class="patient-card-header">
                        <h3>${p.nombre} ${p.apellido}</h3>
                    </div>
                    <div class="patient-card-body">
                        <p><strong>RUT:</strong> ${p.rut}</p>
                        <p><strong>Edad:</strong> ${p.edad}</p>
                        <p><strong>Sexo:</strong> ${p.sexo}</p>
                        <p><strong>Temperatura:</strong> ${p.temperatura}°C</p>
                        <p><strong>Presión Sistólica:</strong> ${p.presion.split('/')[0]} mmHg</p>
                        <p><strong>Presión Diastólica:</strong> ${p.presion.split('/')[1]} mmHg</p>
                        <p><strong>Pulsaciones:</strong> ${p.pulsaciones} ppm</p>
                        <p><strong>Oxígeno en la Sangre:</strong> ${p.oxigeno}%</p>
                        <p><strong>Síntomas:</strong></p>
                        <ul class="symptom-list">
                            ${p.sintomas.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                        <p><strong>Clasificación:</strong> <span class="badge-${p.clasificacion.toLowerCase()}">${p.clasificacion}</span></p>
                        <button class="attend-btn" data-rut="${p.rut}">Atender</button>
                    </div>
                `;
                patientListContainer.appendChild(card);
            })}
            document.querySelectorAll('.attend-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const rut = btn.getAttribute('data-rut');
                    if (confirm(`¿Está seguro que desea atender al paciente con RUT ${rut}?`)) {
                        let pacientes = getPacientes().filter(p => p.rut !== rut);
                        localStorage.setItem('pacientes', JSON.stringify(pacientes));
                        location.reload(); // Recarga la página para actualizar la lista
                    }
                });
            });
        }
