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

async function loadAgeGroups() {
    try {
        const response = await fetch('/api/age-group/get-list?page=0&size=100');
        if (response.ok) {
            const ageGroups = await response.json();
            const select = document.getElementById('ageGroupId');
            select.innerHTML = '<option value="">Выберите возрастную группу</option>';
            ageGroups.forEach(ag => {
                const option = document.createElement('option');
                option.value = ag.id;
                option.textContent = ag.name || `Возрастная группа ${ag.id}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading age groups:', error);
    }
}

async function loadGroups() {
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('groupsTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/group/get-list?page=${currentPage}&size=${pageSize}`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const groups = await response.json();
        loading.style.display = 'none';
        
        if (groups.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        groups.forEach(group => {
            const row = document.createElement('tr');
            const teacher = group.teacher ? `${group.teacher.firstName || ''} ${group.teacher.lastName || ''}`.trim() : '-';
            const assistant = group.assistant ? `${group.assistant.firstName || ''} ${group.assistant.lastName || ''}`.trim() : '-';
            const childrenCount = group.children ? group.children.length : 0;
            const ageGroup = group.ageGroup ? (group.ageGroup.name || `Группа ${group.ageGroup.id}`) : '-';
            
            row.innerHTML = `
                <td>${group.id || ''}</td>
                <td>${group.name || ''}</td>
                <td>${ageGroup}</td>
                <td>${teacher}</td>
                <td>${assistant}</td>
                <td>${childrenCount}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editGroup(${group.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteGroup(${group.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading groups:', error);
    }
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('groupForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить группу';
    document.getElementById('groupFormElement').reset();
    document.getElementById('groupId').value = '';
}

function hideForm() {
    document.getElementById('groupForm').style.display = 'none';
}

async function editGroup(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/group/find-by-id?id=${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const group = await response.json();
        
        document.getElementById('groupId').value = group.id;
        document.getElementById('name').value = group.name || '';
        document.getElementById('ageGroupId').value = group.ageGroup ? group.ageGroup.id : '';
        
        document.getElementById('formTitle').textContent = 'Редактировать группу';
        document.getElementById('groupForm').style.display = 'block';
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deleteGroup(id) {
    if (!checkAuth() || !confirm('Удалить группу?')) return;
    
    try {
        const response = await fetch(`/api/group/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        alert('Группа удалена');
        loadGroups();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

document.getElementById('groupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const groupId = document.getElementById('groupId').value;
    const data = {
        name: document.getElementById('name').value,
        ageGroupId: parseInt(document.getElementById('ageGroupId').value)
    };
    
    try {
        let response;
        if (groupId) {
            response = await fetch(`/api/group/update?id=${groupId}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/group/create', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(groupId ? 'Группа обновлена' : 'Группа создана');
        hideForm();
        loadGroups();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('groupsTable');
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
        loadAgeGroups();
        loadGroups();
    }
});

