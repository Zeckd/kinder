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

async function loadParents() {
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('parentsTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/parent/get-list?page=${currentPage}&size=${pageSize}`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const parents = await response.json();
        loading.style.display = 'none';
        
        if (parents.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        parents.forEach(parent => {
            const row = document.createElement('tr');
            const contact = parent.contact || {};
            row.innerHTML = `
                <td>${parent.id || ''}</td>
                <td>${parent.firstName || ''}</td>
                <td>${parent.lastName || ''}</td>
                <td>${parent.patronymic || ''}</td>
                <td>${contact.phoneNumber || ''}</td>
                <td>${contact.email || ''}</td>
                <td>${getRoleName(parent.role)}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editParent(${parent.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteParent(${parent.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading parents:', error);
    }
}

function getRoleName(role) {
    const roles = {
        'FATHER': 'Отец',
        'MOTHER': 'Мать',
        'BROTHER': 'Брат',
        'SISTER': 'Сестра'
    };
    return roles[role] || role;
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('parentForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить родителя';
    document.getElementById('parentFormElement').reset();
    document.getElementById('parentId').value = '';
    document.getElementById('parentFormElement').scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    document.getElementById('parentForm').style.display = 'none';
}

async function editParent(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/parent/find-by-id?id=${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        
        const parent = await response.json();
        const contact = parent.contact || {};
        
        document.getElementById('parentId').value = parent.id;
        document.getElementById('firstName').value = parent.firstName || '';
        document.getElementById('lastName').value = parent.lastName || '';
        document.getElementById('patronymic').value = parent.patronymic || '';
        document.getElementById('phoneNumber').value = contact.phoneNumber || '';
        document.getElementById('secondaryPhoneNumber').value = contact.secondaryPhoneNumber || '';
        document.getElementById('email').value = contact.email || '';
        document.getElementById('role').value = parent.role || '';
        
        document.getElementById('formTitle').textContent = 'Редактировать родителя';
        document.getElementById('parentForm').style.display = 'block';
        document.getElementById('parentFormElement').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error loading parent:', error);
    }
}

async function deleteParent(id) {
    if (!checkAuth()) return;
    if (!confirm('Вы уверены, что хотите удалить этого родителя?')) return;
    
    try {
        const response = await fetch(`/api/parent/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления');
        }
        
        alert('Родитель успешно удален');
        loadParents();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error deleting parent:', error);
    }
}

document.getElementById('parentFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const parentId = document.getElementById('parentId').value;
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        patronymic: document.getElementById('patronymic').value,
        contactCreate: {
            phoneNumber: document.getElementById('phoneNumber').value,
            secondaryPhoneNumber: document.getElementById('secondaryPhoneNumber').value || null,
            email: document.getElementById('email').value
        }
    };
    
    const role = document.getElementById('role').value;
    
    try {
        let response;
        if (parentId) {
            // Обновление
            response = await fetch(`/api/parent/update?id=${parentId}&role=${role}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            // Создание
            response = await fetch(`/api/parent/create?role=${role}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(parentId ? 'Родитель успешно обновлен' : 'Родитель успешно создан');
        hideForm();
        loadParents();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error saving parent:', error);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('parentsTable');
    const tr = table.getElementsByTagName('tr');
    
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < td.length; j++) {
            if (td[j]) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadParents();
    }
});

