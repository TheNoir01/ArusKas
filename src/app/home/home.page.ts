import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave } from '@ionic/angular';
import { FinanceService } from '../services/finance';
import { Transaction } from '../models/transaction.model';
import { UserPreferencesService } from '../services/user-preferences.service';

interface MonthlyComparisonItem {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

interface ReportRow {
  no: number;
  date: string;
  income: number;
  expense: number;
  saving: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  
})
export class HomePage implements ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave {
  incomeType = 'tetap';
  outflowType = 'primer';
  selectedReportMonth = this.getCurrentMonthKey();
  selectedIncomeHistoryMonth = this.getCurrentMonthKey();
  selectedOutflowHistoryMonth = this.getCurrentMonthKey();
  incomeHistoryVisibleCount = 20;
  outflowHistoryVisibleCount = 20;
  noFixedSalary = false;
  private readonly noFixedSalaryKey = 'finapp_no_fixed_salary';
  private readonly historyPageSize = 20;
  private readonly chartMonthLimit = 8;
  private historyCacheVersion = '';
  private monthlyComparisonCacheVersion = '';
  private monthlyComparisonCache: MonthlyComparisonItem[] = [];
  private monthlyComparisonMaxCache = 1;
  private readonly incomeHistoryCache = new Map<string, Transaction[]>();
  private readonly outflowHistoryCache = new Map<string, Transaction[]>();

  readonly incomeCategoryOptions = ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Lainnya'];
  readonly outflowCategoryOptions = ['Makanan', 'Transport', 'Tagihan', 'Hiburan', 'Belanja', 'Lainnya'];
  baseSalaryInput: number | null = null;

  incomeForm = {
    name: '',
    amount: null as number | null,
    category: ''
  };

  outflowForm = {
    name: '',
    amount: null as number | null,
    category: ''
  };

  constructor(
    public finance: FinanceService,
    private readonly preferences: UserPreferencesService
  ) { }

  ionViewWillEnter(): void {
    console.log('HomePage: ionViewWillEnter');
    const savedBaseSalary = this.finance.getBaseSalary();
    this.baseSalaryInput = savedBaseSalary;
    this.noFixedSalary = localStorage.getItem(this.noFixedSalaryKey) === 'true';
    this.finance.ensureMonthlyBaseSalary();
  }

  ionViewDidEnter(): void {
    console.log('HomePage: ionViewDidEnter');
  }

  ionViewWillLeave(): void {
    console.log('HomePage: ionViewWillLeave');
  }

  ionViewDidLeave(): void {
    console.log('HomePage: ionViewDidLeave');
  }

  get profileName(): string {
    return this.preferences.getProfile().fullName;
  }

  get hasBaseSalary(): boolean {
    return (this.finance.getBaseSalary() || 0) > 0;
  }

  get currentBaseSalary(): number {
    return this.finance.getBaseSalary() || 0;
  }

  get canUseIncomeForm(): boolean {
    return this.hasBaseSalary || this.noFixedSalary;
  }

  get totalIncome(): number {
    return this.finance.getTotalIncome();
  }

  get totalOutflow(): number {
    return this.finance.getTotalOutflow();
  }

  get totalBalance(): number {
    return this.totalIncome - this.totalOutflow;
  }

  get recentTransactions(): Transaction[] {
    return [...this.finance.getTransactions()].reverse().slice(0, 5);
  }

  get incomeTransactions(): Transaction[] {
    return this.getIncomeTransactionsForMonth(this.selectedIncomeHistoryMonth)
      .slice(0, this.incomeHistoryVisibleCount);
  }

  get outflowTransactions(): Transaction[] {
    return this.getOutflowTransactionsForMonth(this.selectedOutflowHistoryMonth)
      .slice(0, this.outflowHistoryVisibleCount);
  }

  get incomeTransactionsTotalCount(): number {
    return this.getIncomeTransactionsForMonth(this.selectedIncomeHistoryMonth).length;
  }

  get outflowTransactionsTotalCount(): number {
    return this.getOutflowTransactionsForMonth(this.selectedOutflowHistoryMonth).length;
  }

  get canLoadMoreIncomeHistory(): boolean {
    return this.incomeHistoryVisibleCount < this.incomeTransactionsTotalCount;
  }

  get canLoadMoreOutflowHistory(): boolean {
    return this.outflowHistoryVisibleCount < this.outflowTransactionsTotalCount;
  }

  get monthlyIncomeExpenseComparison(): MonthlyComparisonItem[] {
    this.ensureMonthlyComparisonCacheUpToDate();
    return this.monthlyComparisonCache;
  }

  get monthlyComparisonMax(): number {
    this.ensureMonthlyComparisonCacheUpToDate();
    return this.monthlyComparisonMaxCache;
  }

  get monthlyReportRows(): ReportRow[] {
    return this.buildMonthlyReportRows(this.selectedReportMonth);
  }

  async exportReportPdf() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    const rows = this.monthlyReportRows;
    const reportOwner = this.profileName || '-';
    if (rows.length === 0) {
      return;
    }

    const totalIncome = rows.reduce((sum, row) => sum + row.income, 0);
    const totalExpense = rows.reduce((sum, row) => sum + row.expense, 0);
    const finalSaving = rows[rows.length - 1].saving;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const monthLabel = this.formatMonthLabel(this.selectedReportMonth);

    doc.setFontSize(16);
    doc.text('Laporan Keuangan Bulanan', 40, 48);
    doc.setFontSize(10);
    doc.text(`Nama: ${reportOwner}`, 40, 68);
    doc.text(`Periode: ${monthLabel}`, 40, 84);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 40, 100);

    autoTable(doc, {
      startY: 118,
      head: [['No', 'Tanggal', 'Income', 'Expense', 'Saving']],
      body: rows.map((row) => [
        `${row.no}`,
        row.date,
        this.formatCurrency(row.income),
        this.formatCurrency(row.expense),
        this.formatCurrency(row.saving)
      ]),
      foot: [[
        'Total',
        '-',
        this.formatCurrency(totalIncome),
        this.formatCurrency(totalExpense),
        this.formatCurrency(finalSaving)
      ]],
      theme: 'grid',
      headStyles: {
        fillColor: [56, 128, 255],
        textColor: 255,
        halign: 'center'
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: 20,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 36 },
        1: { cellWidth: 90 },
        2: { halign: 'right', cellWidth: 110 },
        3: { halign: 'right', cellWidth: 110 },
        4: { halign: 'right', cellWidth: 110 }
      }
    });

    const fileName = `laporan-keuangan-${this.selectedReportMonth}.pdf`;

    try {
      if (Capacitor.isNativePlatform()) {
        const dataUriString = doc.output('datauristring');
        const base64Data = dataUriString.split(',')[1] || '';

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true
        });

        const fileUriResult = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'Laporan Keuangan Bulanan',
          text: 'PDF laporan berhasil dibuat.',
          url: fileUriResult.uri,
          dialogTitle: 'Bagikan atau simpan laporan'
        });

        return;
      }

      doc.save(fileName);
    } catch (error) {
      console.error('Gagal export PDF:', error);
      doc.save(fileName);
    }
  }

  trackByTransaction(_: number, transaction: Transaction): number {
    return transaction.id;
  }

  trackByMonth(_: number, item: MonthlyComparisonItem): string {
    return item.monthKey;
  }

  onIncomeMonthChange(monthKey: string) {
    this.selectedIncomeHistoryMonth = monthKey;
    this.incomeHistoryVisibleCount = this.historyPageSize;
  }

  onOutflowMonthChange(monthKey: string) {
    this.selectedOutflowHistoryMonth = monthKey;
    this.outflowHistoryVisibleCount = this.historyPageSize;
  }

  loadMoreIncomeHistory() {
    this.incomeHistoryVisibleCount += this.historyPageSize;
  }

  loadMoreOutflowHistory() {
    this.outflowHistoryVisibleCount += this.historyPageSize;
  }

  saveBaseSalary() {
    if (!this.baseSalaryInput || this.baseSalaryInput <= 0) {
      return;
    }

    this.finance.setBaseSalary(this.baseSalaryInput);
    this.noFixedSalary = false;
    localStorage.setItem(this.noFixedSalaryKey, 'false');
    this.finance.ensureMonthlyBaseSalary();
  }

  toggleNoFixedSalary(value: boolean | null | undefined) {
    this.noFixedSalary = !!value;
    localStorage.setItem(this.noFixedSalaryKey, String(this.noFixedSalary));
  }

  addIncome() {
    if (!this.canUseIncomeForm) {
      return;
    }

    if (!this.incomeForm.name || !this.incomeForm.amount || !this.incomeForm.category) {
      return;
    }

    this.finance.addTransaction({
      id: 0,
      name: this.incomeForm.name,
      amount: this.incomeForm.amount,
      date: new Date().toLocaleDateString(),
      type: 'income',
      category: this.incomeForm.category,
      subType: this.incomeType
    });

    this.incomeForm = {
      name: '',
      amount: null,
      category: ''
    };
  }

  addOutflow() {
    if (!this.outflowForm.name || !this.outflowForm.amount || !this.outflowForm.category) {
      return;
    }

    this.finance.addTransaction({
      id: 0,
      name: this.outflowForm.name,
      amount: this.outflowForm.amount,
      date: new Date().toLocaleDateString(),
      type: 'outflow',
      category: this.outflowForm.category,
      subType: this.outflowType
    });

    this.outflowForm = {
      name: '',
      amount: null,
      category: ''
    };
  }

  private buildMonthlyReportRows(monthKey: string): ReportRow[] {
    const monthTransactions = this.finance
      .getTransactions()
      .map((transaction) => ({
        transaction,
        parsedDate: this.parseTransactionDate(transaction.date)
      }))
      .filter((item) => item.parsedDate && this.getMonthKeyFromDate(item.parsedDate) === monthKey)
      .sort((a, b) => {
        const dateDiff = a.parsedDate!.getTime() - b.parsedDate!.getTime();
        return dateDiff !== 0 ? dateDiff : a.transaction.id - b.transaction.id;
      });

    let runningSaving = 0;
    return monthTransactions.map((item, index) => {
      const income = item.transaction.type === 'income' ? item.transaction.amount : 0;
      const expense = item.transaction.type === 'outflow' ? item.transaction.amount : 0;
      runningSaving += income - expense;

      return {
        no: index + 1,
        date: this.formatDateForExport(item.parsedDate!),
        income,
        expense,
        saving: runningSaving
      };
    });
  }

  private filterTransactionsByMonth(transactions: Transaction[], monthKey: string): Transaction[] {
    return transactions
      .map((transaction) => ({
        transaction,
        parsedDate: this.parseTransactionDate(transaction.date)
      }))
      .filter((item) => item.parsedDate && this.getMonthKeyFromDate(item.parsedDate) === monthKey)
      .sort((a, b) => {
        const dateDiff = b.parsedDate!.getTime() - a.parsedDate!.getTime();
        return dateDiff !== 0 ? dateDiff : b.transaction.id - a.transaction.id;
      })
      .map((item) => item.transaction);
  }

  private getIncomeTransactionsForMonth(monthKey: string): Transaction[] {
    this.ensureHistoryCacheUpToDate();

    if (!this.incomeHistoryCache.has(monthKey)) {
      this.incomeHistoryCache.set(
        monthKey,
        this.filterTransactionsByMonth(this.finance.getIncome(), monthKey)
      );
    }

    return this.incomeHistoryCache.get(monthKey) || [];
  }

  private getOutflowTransactionsForMonth(monthKey: string): Transaction[] {
    this.ensureHistoryCacheUpToDate();

    if (!this.outflowHistoryCache.has(monthKey)) {
      this.outflowHistoryCache.set(
        monthKey,
        this.filterTransactionsByMonth(this.finance.getOutflow(), monthKey)
      );
    }

    return this.outflowHistoryCache.get(monthKey) || [];
  }

  private ensureHistoryCacheUpToDate() {
    const nextVersion = this.getTransactionsVersion();

    if (this.historyCacheVersion !== nextVersion) {
      this.historyCacheVersion = nextVersion;
      this.incomeHistoryCache.clear();
      this.outflowHistoryCache.clear();
    }
  }

  private ensureMonthlyComparisonCacheUpToDate() {
    const nextVersion = this.getTransactionsVersion();
    if (this.monthlyComparisonCacheVersion === nextVersion) {
      return;
    }

    const grouped = new Map<string, { income: number; expense: number }>();

    for (const transaction of this.finance.getTransactions()) {
      const parsedDate = this.parseTransactionDate(transaction.date);
      if (!parsedDate) {
        continue;
      }

      const monthKey = this.getMonthKeyFromDate(parsedDate);
      const current = grouped.get(monthKey) || { income: 0, expense: 0 };

      if (transaction.type === 'income') {
        current.income += transaction.amount;
      } else if (transaction.type === 'outflow') {
        current.expense += transaction.amount;
      }

      grouped.set(monthKey, current);
    }

    const sorted = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const limited = sorted.slice(Math.max(0, sorted.length - this.chartMonthLimit));

    this.monthlyComparisonCache = limited.map(([monthKey, totals]) => ({
      monthKey,
      label: this.formatMonthLabel(monthKey),
      income: totals.income,
      expense: totals.expense
    }));

    const maxValue = this.monthlyComparisonCache.reduce(
      (max, item) => Math.max(max, item.income, item.expense),
      0
    );
    this.monthlyComparisonMaxCache = maxValue > 0 ? maxValue : 1;
    this.monthlyComparisonCacheVersion = nextVersion;
  }

  private getTransactionsVersion(): string {
    const transactions = this.finance.getTransactions();
    const lastTransactionId = transactions.length > 0
      ? transactions[transactions.length - 1].id
      : 0;

    return `${transactions.length}-${lastTransactionId}`;
  }

  private parseTransactionDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) {
      return new Date(direct.getFullYear(), direct.getMonth(), direct.getDate());
    }

    const parts = value.split(/[^0-9]/).filter(Boolean).map(Number);
    if (parts.length < 3) {
      return null;
    }

    let day = parts[0];
    let month = parts[1];
    let year = parts[2];

    if (year < 100) {
      year += 2000;
    }

    if (parts[0] > 12 && parts[1] <= 12) {
      day = parts[0];
      month = parts[1];
    } else if (parts[1] > 12 && parts[0] <= 12) {
      day = parts[1];
      month = parts[0];
    }

    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    return this.getMonthKeyFromDate(now);
  }

  private getMonthKeyFromDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }

  private formatDateForExport(date: Date): string {
    return date.toLocaleDateString('id-ID');
  }

  private formatMonthLabel(monthKey: string): string {
    const [yearText, monthText] = monthKey.split('-');
    const year = Number(yearText);
    const month = Number(monthText);

    if (Number.isNaN(year) || Number.isNaN(month)) {
      return monthKey;
    }

    return new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric'
    });
  }

  private formatCurrency(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
}