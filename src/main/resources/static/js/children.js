let currentPage = 0;
let pageSize = 10;
let groups = [];

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

async function loadGroups() {
    try {
        const response = await fetch('/api/group/get-list?page=0&size=100', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            groups = await response.json();
            const select = document.getElementById('groupId');
            select.innerHTML = '<option value="">Без группы</option>';
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name || `Группа ${group.id}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadChildren() {
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('childrenTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/child/get-list?page=${currentPage}&size=${pageSize}`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const children = await response.json();
        loading.style.display = 'none';
        
        if (children.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        children.forEach(child => {
            const row = document.createElement('tr');
            const groupName = child.group ? (child.group.name || `Группа ${child.group.id}`) : 'Без группы';
            row.innerHTML = `
                <td>${child.id || ''}</td>
                <td>${child.firstName || ''}</td>
                <td>${child.lastName || ''}</td>
                <td>${child.patronymic || ''}</td>
                <td>${child.dateOfBirth || ''}</td>
                <td>${groupName}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editChild(${child.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteChild(${child.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading children:', error);
    }
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('childForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить ребенка';
    document.getElementById('childFormElement').reset();
    document.getElementById('childId').value = '';
    document.getElementById('childFormElement').scrollIntoView({ behavior: 'smooth' });
}

function hideForm() {
    document.getElementById('childForm').style.display = 'none';
}

async function editChild(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/child/find-by-id?id=${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        
        const child = await response.json();
        
        document.getElementById('childId').value = child.id;
        document.getElementById('firstName').value = child.firstName || '';
        document.getElementById('lastName').value = child.lastName || '';
        document.getElementById('patronymic').value = child.patronymic || '';
        document.getElementById('dateOfBirth').value = child.dateOfBirth || '';
        document.getElementById('groupId').value = child.group ? child.group.id : '';
        
        document.getElementById('formTitle').textContent = 'Редактировать ребенка';
        document.getElementById('childForm').style.display = 'block';
        document.getElementById('childFormElement').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error loading child:', error);
    }
}

async function deleteChild(id) {
    if (!checkAuth()) return;
    if (!confirm('Вы уверены, что хотите удалить этого ребенка?')) return;
    
    try {
        const response = await fetch(`/api/child/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления');
        }
        
        alert('Ребенок успешно удален');
        loadChildren();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error deleting child:', error);
    }
}

document.getElementById('childFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const childId = document.getElementById('childId').value;
    const groupId = document.getElementById('groupId').value;
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        patronymic: document.getElementById('patronymic').value || null,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        group: groupId ? parseInt(groupId) : null,
        parentsId: []
    };
    
    try {
        let response;
        if (childId) {
            response = await fetch(`/api/child/update?id=${childId}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/child/create', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(childId ? 'Ребенок успешно обновлен' : 'Ребенок успешно создан');
        hideForm();
        loadChildren();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
        console.error('Error saving child:', error);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('childrenTable');
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

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadGroups();
        loadChildren();
    }
});

