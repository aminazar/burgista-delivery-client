/**
 * Created by Ali on 3/6/2017.
 */
export class Delivery{
  id: number;
  productCode: string;
  productName: string;
  realDelivery: number = 0;
  min: number;
  max: number;
  stock: number;
  stockDate: Date;
  state: string = 'exist';
}
