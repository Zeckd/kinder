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

async function loadChildren() {
    try {
        const response = await fetch('/api/child/get-list?page=0&size=100', {
            headers: getAuthHeaders()
        });
        if (response.ok) {
            const children = await response.json();
            const select = document.getElementById('childId');
            select.innerHTML = '<option value="">Выберите ребенка</option>';
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.firstName || ''} ${child.lastName || ''}`.trim() || `Ребенок ${child.id}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading children:', error);
    }
}

async function loadPayments() {
    if (!checkAuth()) return;
    
    currentPage = parseInt(document.getElementById('pageInput').value) || 0;
    pageSize = parseInt(document.getElementById('sizeInput').value) || 10;
    
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('errorMessage');
    const tableBody = document.getElementById('paymentsTableBody');
    
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    tableBody.innerHTML = '';
    
    try {
        const response = await fetch(`/api/payment/get-list?page=${currentPage}&size=${pageSize}`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        
        const payments = await response.json();
        loading.style.display = 'none';
        
        if (payments.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет данных</td></tr>';
            return;
        }
        
        payments.forEach(payment => {
            const row = document.createElement('tr');
            const child = payment.child ? `${payment.child.firstName || ''} ${payment.child.lastName || ''}`.trim() : '-';
            const paymentTypeNames = {
                'CASH': 'Наличные',
                'QR': 'QR-код',
                'CARD': 'Карта',
                'TRANSFER': 'Перевод'
            };
            
            row.innerHTML = `
                <td>${payment.id || ''}</td>
                <td>${child}</td>
                <td>${payment.period || ''}</td>
                <td>${payment.paymentSum || 0} сом</td>
                <td>${paymentTypeNames[payment.paymentType] || payment.paymentType}</td>
                <td>${payment.paymentDate || ''}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="editPayment(${payment.id})">✏️</button>
                    <button class="btn-small btn-delete" onclick="deletePayment(${payment.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        loading.style.display = 'none';
        errorDiv.textContent = `Ошибка загрузки: ${error.message}`;
        errorDiv.style.display = 'block';
        console.error('Error loading payments:', error);
    }
}

function showCreateForm() {
    if (!checkAuth()) return;
    document.getElementById('paymentForm').style.display = 'block';
    document.getElementById('formTitle').textContent = 'Добавить платеж';
    document.getElementById('paymentFormElement').reset();
    document.getElementById('paymentId').value = '';
}

function hideForm() {
    document.getElementById('paymentForm').style.display = 'none';
}

async function editPayment(id) {
    if (!checkAuth()) return;
    
    try {
        const response = await fetch(`/api/payment/find-by-id?id=${id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        const payment = await response.json();
        
        document.getElementById('paymentId').value = payment.id;
        document.getElementById('childId').value = payment.child ? payment.child.id : '';
        document.getElementById('period').value = payment.period || '';
        document.getElementById('paymentSum').value = payment.paymentSum || '';
        document.getElementById('paymentType').value = payment.paymentType || '';
        
        document.getElementById('formTitle').textContent = 'Редактировать платеж';
        document.getElementById('paymentForm').style.display = 'block';
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

async function deletePayment(id) {
    if (!checkAuth() || !confirm('Удалить платеж?')) return;
    
    try {
        const response = await fetch(`/api/payment/delete?id=${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        alert('Платеж удален');
        loadPayments();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
}

document.getElementById('paymentFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    const paymentId = document.getElementById('paymentId').value;
    const data = {
        childId: parseInt(document.getElementById('childId').value),
        period: document.getElementById('period').value,
        paymentSum: parseFloat(document.getElementById('paymentSum').value)
    };
    
    const paymentType = document.getElementById('paymentType').value;
    
    try {
        let response;
        if (paymentId) {
            response = await fetch(`/api/payment/update?id=${paymentId}&paymentType=${paymentType}&delete=ACTIVE`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`/api/payment/create?paymentType=${paymentType}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сохранения');
        }
        
        alert(paymentId ? 'Платеж обновлен' : 'Платеж создан');
        hideForm();
        loadPayments();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

function filterTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('paymentsTable');
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
        loadChildren();
        loadPayments();
    }
});

