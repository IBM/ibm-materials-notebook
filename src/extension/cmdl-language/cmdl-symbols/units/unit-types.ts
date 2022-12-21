import Big from 'big.js';

export interface Quantity {
  value: Big;
  uncertainty: Big | null;
  unit: string;
}
