/**
 * Created by Ali on 3/4/2017.
 */
export class Inventory{
  id: number;
  productId: number;
  unopenedPack: number = null;
  productCode: string;
  productName: string;
  lastCount: Date;
  state: string;
  shouldIncluded: boolean = true;
  shouldCountToday: boolean = true;
}
