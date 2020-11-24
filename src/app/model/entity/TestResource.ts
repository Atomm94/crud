import { BaseClass } from './BaseClass'
import { MainEntity } from './MainEntity'

class test11Futrue extends BaseClass {

}
class test12Futrue extends BaseClass {

}
class test13Futrue extends BaseClass {

}
export class TestResource extends MainEntity {
  static resource = true
  static features ={
    test11Futrue: test11Futrue,
    test12Futrue: test12Futrue,
    test13Futrue: test13Futrue
  }
}
