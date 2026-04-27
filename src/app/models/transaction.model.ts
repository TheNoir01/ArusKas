export interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'outflow';
  category: string;
  subType?: string;
}