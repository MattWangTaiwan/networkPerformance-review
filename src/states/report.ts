import { createMachine } from 'xstate'

export default createMachine({
  id: 'report',
  initial: 'getData',
  states: {
    getData: {
      on: {
        NEXT: 'viewData'
      }
    },
    viewData: {
      on: {
        GET: 'getData'
      }
    }
  }
})
