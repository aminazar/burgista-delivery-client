/**
 * Created by Ali on 3/6/2017.
 */
export class Delivery{
  id: number;
  uid: number;
  productCode: string;
  productName: string;
  realDelivery: number = 0;
  minDelivery: number = 0;
  maxDelivery: number = 0;
  min: number;
  max: number;
  stock: number;
  stockDate: string;
  untilNextCountingDay: number;
  state: string = 'exist';
  isPrinted: boolean = false;
  oldCount = 0;
}
