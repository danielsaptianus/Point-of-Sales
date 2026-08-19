import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Employee, Position } from '@/types';

export const useEmployeeStore = defineStore('employees', () => {
  const positions = ref<Position[]>([
    { id: 1, name: 'Store Manager', description: 'Manages overall store operations', is_active: true },
    { id: 2, name: 'Cashier', description: 'Handles customer transactions', is_active: true },
    { id: 3, name: 'Stock Admin', description: 'Manages inventory', is_active: true }
  ]);

  const employees = ref<Employee[]>([
    {
      id: 1,
      employee_number: 'EMP-001',
      first_name: 'Budi',
      last_name: 'Santoso',
      gender: 'L',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 1, Jakarta',
      hire_date: '2025-01-15T00:00:00.000Z',
      is_active: true,
      position_id: 1,
      position: positions.value[0],
      user_id: 1
    },
    {
      id: 2,
      employee_number: 'EMP-002',
      first_name: 'Siti',
      last_name: 'Aminah',
      gender: 'P',
      phone: '089876543210',
      address: 'Jl. Sudirman No. 10, Bandung',
      hire_date: '2025-03-10T00:00:00.000Z',
      is_active: true,
      position_id: 2,
      position: positions.value[1],
      user_id: 2
    }
  ]);

  const isLoading = ref(false);

  async function fetchEmployees() {
    isLoading.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    isLoading.value = false;
  }

  async function addEmployee(employee: Omit<Employee, 'id'>) {
    const newId = employees.value.length > 0 ? Math.max(...employees.value.map(e => e.id)) + 1 : 1;
    const pos = positions.value.find(p => p.id === employee.position_id);
    const newEmployee: Employee = { 
      ...employee, 
      id: newId,
      position: pos 
    };
    employees.value.push(newEmployee);
  }

  async function updateEmployee(id: number, updatedData: Partial<Employee>) {
    const index = employees.value.findIndex(e => e.id === id);
    if (index !== -1) {
      const posId = updatedData.position_id || employees.value[index].position_id;
      const pos = positions.value.find(p => p.id === posId);
      
      employees.value[index] = { 
        ...employees.value[index], 
        ...updatedData,
        position: pos 
      };
    }
  }

  async function deleteEmployee(id: number) {
    employees.value = employees.value.filter(e => e.id !== id);
  }

  return {
    positions,
    employees,
    isLoading,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
});
