let currentPage = 0;
let pageSize = 10;

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

async function loadTeachers() {
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('teachersTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/teacher/get-list?page=${currentPage}&size=${pageSize}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const teachers = await response.json();
        loading.style.display = 'none';
        
        if (teachers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        teachers.forEach(teacher => {
            const row = document.createElement('tr');
            const contact = teacher.contact || {};
            row.innerHTML = `
                <td>${teacher.id || ''}</td>
                <td>${teacher.firstName || ''}</td>
                <td>${teacher.lastName || ''}</td>
                <td>${teacher.patronymic || ''}</td>
                <td>${contact.phoneNumber || ''}</td>
                <td>${contact.email || ''}</td>
                <td>${teacher.position === 'TEACHER' ? 'Воспитатель' : 'Помощник'}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editTeacher(${teacher.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteTeacher(${teacher.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading teachers:', error);
    }
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('teacherForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить воспитателя';
    document.getElementById('teacherFormElement').reset();
    document.getElementById('teacherId').value = '';
}

function hideForm() {
    document.getElementById('teacherForm').style.display = 'none';
}

async function editTeacher(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/teacher/find-by-id?id=${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const teacher = await response.json();
        const contact = teacher.contact || {};
        
        document.getElementById('teacherId').value = teacher.id;
        document.getElementById('firstName').value = teacher.firstName || '';
        document.getElementById('lastName').value = teacher.lastName || '';
        document.getElementById('patronymic').value = teacher.patronymic || '';
        document.getElementById('dateOfBirth').value = teacher.dateOfBirth || '';
        document.getElementById('phoneNumber').value = contact.phoneNumber || '';
        document.getElementById('secondaryPhoneNumber').value = contact.secondaryPhoneNumber || '';
        document.getElementById('email').value = contact.email || '';
        document.getElementById('position').value = teacher.position || '';
        
        document.getElementById('formTitle').textContent = 'Редактировать воспитателя';
        document.getElementById('teacherForm').style.display = 'block';
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deleteTeacher(id) {
    if (!checkAuth() || !confirm('Удалить воспитателя?')) return;
    
    try {
        const response = await fetch(`/api/teacher/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        alert('Воспитатель удален');
        loadTeachers();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

document.getElementById('teacherFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const teacherId = document.getElementById('teacherId').value;
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        patronymic: document.getElementById('patronymic').value || null,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        contactCreate: {
            phoneNumber: document.getElementById('phoneNumber').value,
            secondaryPhoneNumber: document.getElementById('secondaryPhoneNumber').value || null,
            email: document.getElementById('email').value
        }
    };
    
    const position = document.getElementById('position').value;
    
    try {
        let response;
        if (teacherId) {
            response = await fetch(`/api/teacher/update?id=${teacherId}&position=${position}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`/api/teacher/create?position=${position}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(teacherId ? 'Воспитатель обновлен' : 'Воспитатель создан');
        hideForm();
        loadTeachers();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('teachersTable');
    const tr = table.getElementsByTagName('tr');
    
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < td.length; j++) {
            if (td[j] && (td[j].textContent || td[j].innerText).toLowerCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadTeachers();
    }
});

