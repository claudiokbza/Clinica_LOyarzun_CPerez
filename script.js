document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA COMPARTIDA ---
    const getPatients = () => {
        return JSON.parse(localStorage.getItem('clinicPatients')) || [];
    };

    const savePatients = (patients) => {
        localStorage.setItem('clinicPatients', JSON.stringify(patients));
    };


    // --- LÓGICA PARA LA PÁGINA DE REGISTRO (registro.html) ---
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {

        const fields = {
            nombre: document.getElementById('nombre'),
            apellido: document.getElementById('apellido'),
            rut: document.getElementById('rut'),
            edad: document.getElementById('edad'),
            sexo: document.getElementById('sexo'),
            temperatura: document.getElementById('temperatura'),
            presionSistolica: document.getElementById('presionSistolica'),
            presionDiastolica: document.getElementById('presionDiastolica'),
            pulsaciones: document.getElementById('pulsaciones'),
            oxigeno: document.getElementById('oxigeno')
        };
        
        const validateField = (field, name) => {
            const errorSpan = field.nextElementSibling;
            let message = '';
            
            // 1. Validar campo obligatorio
            if (!field.value.trim()) {
                message = 'Este campo es obligatorio.';
            } 
            // 2. Validaciones numéricas y de rango
            else if (field.type === 'number') {
                const value = parseFloat(field.value);
                if (isNaN(value)) {
                    message = 'Debe ingresar un valor numérico.';
                } else {
                    if (name === 'edad' && value <= 0) message = 'La edad debe ser mayor a 0.';
                    if (name === 'temperatura' && (value < 30 || value > 45)) message = 'Temperatura fuera de rango (30-45°C).';
                    if ((name === 'presionSistolica' || name === 'presionDiastolica' || name === 'pulsaciones' || name === 'oxigeno') && value <= 0) message = 'El valor debe ser positivo.';
                }
            }
            
            errorSpan.textContent = message;
            field.classList.toggle('error', !!message);
            return !message;
        };

        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();

            let isFormValid = true;
            for (const key in fields) {
                if (!validateField(fields[key], key)) {
                    isFormValid = false;
                }
            }

            if (!isFormValid) return;

            // --- Recolección y Clasificación de Síntomas ---
            const sintomas = new Set();
            document.querySelectorAll('.symptom-grid input[type="checkbox"]:checked').forEach(cb => {
                sintomas.add(cb.value);
            });

            const temp = parseFloat(fields.temperatura.value);
            const pSis = parseFloat(fields.presionSistolica.value);
            const pDia = parseFloat(fields.presionDiastolica.value);
            
            if (temp > 37.8) sintomas.add('Fiebre');
            if (pSis > 140 || pDia > 90) sintomas.add('Presión alta');
            if (pSis < 90 || pDia < 60) sintomas.add('Presión baja');
            
            const otrosSintomas = document.getElementById('otrosSintomas').value.trim();
            if (otrosSintomas) {
                otrosSintomas.split(',').forEach(s => s.trim() && sintomas.add(s.trim()));
            }

            const totalSintomas = sintomas.size;
            let clasificacion;
            if (totalSintomas <= 3) clasificacion = 'Verde';
            else if (totalSintomas <= 5) clasificacion = 'Amarillo';
            else clasificacion = 'Rojo';

            // --- Guardar Paciente ---
            const newPatient = {
                id: Date.now(),
                nombre: fields.nombre.value,
                apellido: fields.apellido.value,
                rut: fields.rut.value,
                edad: fields.edad.value,
                sexo: fields.sexo.value,
                temperatura: temp,
                presion: `${pSis}/${pDia}`,
                pulsaciones: fields.pulsaciones.value,
                oxigeno: fields.oxigeno.value,
                sintomas: Array.from(sintomas),
                clasificacion: clasificacion
            };

            const patients = getPatients();
            patients.push(newPatient);
            savePatients(patients);

            // --- Mostrar Resultado ---
            const resultContainer = document.getElementById('result-container');
            const badge = document.getElementById('classification-badge');
            badge.textContent = clasificacion;
            badge.className = `badge-${clasificacion.toLowerCase()}`;
            resultContainer.style.display = 'block';

            registrationForm.reset();
            setTimeout(() => { resultContainer.style.display = 'none'; }, 5000);
        });
    }


    // --- LÓGICA PARA LA PÁGINA DE PACIENTES (pacientes.html) ---
    const patientListContainer = document.getElementById('patient-list-container');
    if (patientListContainer) {
        const patients = getPatients();
        if (patients.length === 0) {
            patientListContainer.innerHTML = '<p>No hay pacientes registrados en el sistema.</p>';
        } else {
            patients.forEach(p => {
                const card = document.createElement('div');
                card.className = `patient-card card-${p.clasificacion.toLowerCase()}`;
                
                let symptomsHTML = p.sintomas.map(s => `<li>${s}</li>`).join('');

                card.innerHTML = `
                    <div class="patient-card-header">
                        <h3>${p.nombre} ${p.apellido}</h3>
                    </div>
                    <div class="patient-card-body">
                        <p><strong>RUT:</strong> ${p.rut}</p>
                        <p><strong>Edad:</strong> ${p.edad} años</p>
                        <p><strong>Temp:</strong> ${p.temperatura}°C | <strong>Presión:</strong> ${p.presion} mmHg</p>
                        <p><strong>Pulsaciones:</strong> ${p.pulsaciones} ppm | <strong>O₂:</strong> ${p.oxigeno}%</p>
                        <p><strong>Síntomas:</strong></p>
                        <ul class="symptom-list">${symptomsHTML}</ul>
                    </div>
                `;
                patientListContainer.appendChild(card);
            });
        }
    }
});