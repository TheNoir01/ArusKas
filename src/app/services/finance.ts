import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  private transactions: Transaction[] = [];
  private baseSalary: number | null = null;
  private lastAutoSalaryMonth = '';
  private readonly storageKey = 'finapp';
  private readonly baseSalaryKey = 'finapp_base_salary';
  private readonly autoSalaryMonthKey = 'finapp_auto_salary_month';

  constructor() {
    this.load();
    this.loadSalarySettings();
  }

  getTransactions() {
    return this.transactions;
  }

  addTransaction(data: Transaction) {
    data.id = Date.now();
    this.transactions.push(data);
    this.save();
  }

  deleteTransaction(id: number) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
  }

  getIncome(type?: string) {
    return this.transactions.filter(t =>
      t.type === 'income' && (!type || t.subType === type)
    );
  }

  getOutflow(type?: string) {
    return this.transactions.filter(t =>
      t.type === 'outflow' && (!type || t.subType === type)
    );
  }

  getTotalIncome() {
    return this.transactions
      .filter(t => t.type === 'income')
      .reduce((a, b) => a + b.amount, 0);
  }

  getTotalOutflow() {
    return this.transactions
      .filter(t => t.type === 'outflow')
      .reduce((a, b) => a + b.amount, 0);
  }

  getBaseSalary() {
    return this.baseSalary;
  }

  setBaseSalary(amount: number) {
    this.baseSalary = amount;
    localStorage.setItem(this.baseSalaryKey, String(amount));
  }

  ensureMonthlyBaseSalary(date = new Date()) {
    if (!this.baseSalary || this.baseSalary <= 0) {
      return false;
    }

    const monthKey = this.getMonthKey(date);
    if (this.lastAutoSalaryMonth === monthKey) {
      return false;
    }

    this.addTransaction({
      id: 0,
      name: 'Gaji Pokok',
      amount: this.baseSalary,
      date: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString(),
      type: 'income',
      category: 'Gaji',
      subType: 'tetap'
    });

    this.lastAutoSalaryMonth = monthKey;
    localStorage.setItem(this.autoSalaryMonthKey, monthKey);
    return true;
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
  }

  load() {
    const data = localStorage.getItem(this.storageKey);
    if (data) this.transactions = JSON.parse(data);
  }

  private loadSalarySettings() {
    const savedBaseSalary = localStorage.getItem(this.baseSalaryKey);
    const parsedBaseSalary = Number(savedBaseSalary);
    this.baseSalary = Number.isFinite(parsedBaseSalary) && parsedBaseSalary > 0
      ? parsedBaseSalary
      : null;

    this.lastAutoSalaryMonth = localStorage.getItem(this.autoSalaryMonthKey) || '';
  }

  private getMonthKey(date: Date) {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }
}