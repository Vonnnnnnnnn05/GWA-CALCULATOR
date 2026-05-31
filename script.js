document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    const form = document.getElementById('grade-form');
    const courseInput = document.getElementById('course');
    const unitsInput = document.getElementById('units');
    const gradeInput = document.getElementById('grade');
    const tableBody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');
    const tableResponsive = document.querySelector('.table-responsive');
    const gwaValue = document.getElementById('gwa-value');
    const totalUnitsDisplay = document.getElementById('total-units');
    const clearBtn = document.getElementById('clear-btn');

    // Retrieve subjects from localStorage or initialize empty array
    let subjects = JSON.parse(localStorage.getItem('vongwa_subjects')) || [];

    // Initial render
    renderTable();

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const courseName = courseInput.value.trim() || `Subject ${subjects.length + 1}`;
        const units = parseFloat(unitsInput.value);
        const grade = parseFloat(gradeInput.value);

        if (isNaN(units) || isNaN(grade)) return;

        const newSubject = {
            id: Date.now().toString(),
            course: courseName,
            units: units,
            grade: grade
        };

        subjects.push(newSubject);
        saveData();
        renderTable();
        
        // Reset form inputs except focus
        courseInput.value = '';
        unitsInput.value = '';
        gradeInput.value = '';
        courseInput.focus();
    });

    // Clear all data
    clearBtn.addEventListener('click', () => {
        if(subjects.length === 0) return;
        
        if(confirm('Are you sure you want to delete all entries?')) {
            subjects = [];
            saveData();
            renderTable();
        }
    });

    // Delete single subject
    function deleteSubject(id) {
        subjects = subjects.filter(subject => subject.id !== id);
        saveData();
        renderTable();
    }

    // Expose delete to global scope for inline onclick usage
    window.deleteSubject = deleteSubject;

    // Calculate the GWA
    function calculateGWA() {
        if (subjects.length === 0) {
            gwaValue.textContent = "0.0000";
            totalUnitsDisplay.textContent = "0";
            return;
        }

        let totalUnits = 0;
        let totalGradePoints = 0;

        subjects.forEach(subject => {
            totalUnits += subject.units;
            // Formula: Sum of (Units * Grade) / Total Units
            totalGradePoints += (subject.units * subject.grade);
        });

        const gwa = totalGradePoints / totalUnits;
        
        // Update DOM
        gwaValue.textContent = gwa.toFixed(4);
        totalUnitsDisplay.textContent = totalUnits;
    }

    // Render the table and update UI state
    function renderTable() {
        tableBody.innerHTML = '';
        
        if (subjects.length === 0) {
            emptyState.classList.remove('hidden');
            tableResponsive.classList.add('hidden');
            clearBtn.style.opacity = '0.5';
            clearBtn.style.pointerEvents = 'none';
        } else {
            emptyState.classList.add('hidden');
            tableResponsive.classList.remove('hidden');
            clearBtn.style.opacity = '1';
            clearBtn.style.pointerEvents = 'auto';

            subjects.forEach(subject => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${subject.course}</strong></td>
                    <td>${subject.units}</td>
                    <td>${subject.grade.toFixed(2)}</td>
                    <td class="action-column">
                        <button class="action-btn" onclick="deleteSubject('${subject.id}')" title="Remove Subject">
                            <i data-lucide="x"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            
            // Re-initialize icons for newly added DOM elements
            lucide.createIcons();
        }

        calculateGWA();
    }

    // Save current state to local storage
    function saveData() {
        localStorage.setItem('vongwa_subjects', JSON.stringify(subjects));
    }
});
