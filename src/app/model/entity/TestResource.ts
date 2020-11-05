import { MainEntity } from './MainEntity'

class test11Futrue {

}
class test12Futrue {

}
class test13Futrue {

}
export class TestResource extends MainEntity {
  static resource = true
  static features ={
    test11Futrue: test11Futrue,
    test12Futrue: test12Futrue,
    test13Futrue: test13Futrue
  }
}
