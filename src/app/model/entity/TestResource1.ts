import { BaseClass } from './BaseClass'
import { MainEntity } from './MainEntity'
class test21Futrue extends BaseClass {

}
class test22Futrue extends BaseClass {

}
class test23Futrue extends BaseClass {

}
export class TestResource1 extends MainEntity {
  static resource = false
  static features = {
    test21Futrue: test21Futrue,
    test22Futrue: test22Futrue,
    test23Futrue: test23Futrue
  }
}
