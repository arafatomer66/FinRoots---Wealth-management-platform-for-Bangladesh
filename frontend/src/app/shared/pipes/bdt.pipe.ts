import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bdt', standalone: true })
export class BdtPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '৳0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '৳0.00';

    // Bangladesh number formatting: 12,34,567.89
    const [intPart, decPart] = num.toFixed(2).split('.');
    const lastThree = intPart.slice(-3);
    const otherNumbers = intPart.slice(0, -3);
    const formatted = otherNumbers
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

    return `৳${formatted}.${decPart}`;
  }
}
