import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Employee, Position } from '@/types';
import api from '@/plugins/axios';

export const useEmployeeStore = defineStore('employees', () => {
  // Hardcode positions to match DB seeds (1: Admin, 2: Member) since we don't have a /positions endpoint yet
  const positions = ref<Position[]>([
    { id: 1, name: 'Admin', description: 'Administrator', is_active: true },
    { id: 2, name: 'Staff / Member', description: 'Regular Staff', is_active: true }
  ]);

  const employees = ref<Employee[]>([]);
  const isLoading = ref(false);

  async function fetchEmployees() {
    isLoading.value = true;
    try {
      const res = await api.get('/employees');
      employees.value = res.data.data || [];
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function addEmployee(employee: Omit<Employee, 'id'>) {
    try {
      const payload = {
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        last_name: employee.last_name,
        gender: employee.gender,
        birth_date: employee.birth_date,
        marital_status: employee.marital_status,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        hire_date: employee.hire_date,
        termination_date: employee.termination_date,
        employment_type: employee.employment_type,
        salary: employee.salary,
        bank_name: employee.bank_name,
        bank_account_number: employee.bank_account_number,
        bank_account_name: employee.bank_account_name,
        position_id: employee.position_id,
        is_active: employee.is_active
      };
      const res = await api.post('/employees', payload);
      employees.value.unshift(res.data.data);
    } catch (error) {
      console.error('Failed to add employee:', error);
      throw error;
    }
  }

  async function updateEmployee(id: number, updatedData: Partial<Employee>) {
    try {
      const payload: any = { ...updatedData };
      delete payload.id;
      delete payload.position;
      delete payload.user;

      const res = await api.patch(`/employees/${id}`, payload);
      const index = employees.value.findIndex(e => e.id === id);
      if (index !== -1) {
        employees.value[index] = res.data.data;
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      throw error;
    }
  }

  async function deleteEmployee(id: number) {
    try {
      await api.delete(`/employees/${id}`);
      employees.value = employees.value.filter(e => e.id !== id);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      throw error;
    }
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
