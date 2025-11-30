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
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('ageGroupsTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/age-group/get-list?page=${currentPage}&size=${pageSize}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const ageGroups = await response.json();
        loading.style.display = 'none';
        
        if (ageGroups.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        ageGroups.forEach(ag => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ag.id || ''}</td>
                <td>${ag.name || ''}</td>
                <td>${ag.ageGroup || ''}</td>
                <td>${ag.price || 0} сом</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editAgeGroup(${ag.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deleteAgeGroup(${ag.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading age groups:', error);
    }
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('ageGroupForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить возрастную группу';
    document.getElementById('ageGroupFormElement').reset();
    document.getElementById('ageGroupId').value = '';
}

function hideForm() {
    document.getElementById('ageGroupForm').style.display = 'none';
}

async function editAgeGroup(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/age-group/find-by-id?id=${id}`);
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const ag = await response.json();
        
        document.getElementById('ageGroupId').value = ag.id;
        document.getElementById('name').value = ag.name || '';
        document.getElementById('ageGroup').value = ag.ageGroup || '';
        document.getElementById('price').value = ag.price || '';
        
        document.getElementById('formTitle').textContent = 'Редактировать возрастную группу';
        document.getElementById('ageGroupForm').style.display = 'block';
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deleteAgeGroup(id) {
    if (!checkAuth() || !confirm('Удалить возрастную группу?')) return;
    
    try {
        const response = await fetch(`/api/age-group/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        alert('Возрастная группа удалена');
        loadAgeGroups();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

document.getElementById('ageGroupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const ageGroupId = document.getElementById('ageGroupId').value;
    const data = {
        name: document.getElementById('name').value,
        ageGroup: parseInt(document.getElementById('ageGroup').value),
        price: parseFloat(document.getElementById('price').value)
    };
    
    try {
        let response;
        if (ageGroupId) {
            response = await fetch(`/api/age-group/update?id=${ageGroupId}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch('/api/age-group/create', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(ageGroupId ? 'Возрастная группа обновлена' : 'Возрастная группа создана');
        hideForm();
        loadAgeGroups();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('ageGroupsTable');
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
    }
});

