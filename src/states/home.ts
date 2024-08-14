import { createMachine } from 'xstate'

export default createMachine({
  id: 'home',
  initial: 'initial',
  states: {
    initial: {
      on: { NEXT: 'getData' }
    },
    getData: {
      on: { NEXT: 'viewData' }
    },
    viewData: {
      on: {
        GET: 'getData'
      }
    }
  }
})
