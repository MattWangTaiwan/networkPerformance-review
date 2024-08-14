import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import initSqlJs, { Database } from 'sql.js'

import type { NetworkProfile } from '@/types'
import { currencyMap } from '@/utils'

import mock from '../utils/take-home-assignment-dataset.json'

export default defineStore('data', () => {
  const networkProfile = ref<NetworkProfile | null>(null)

  const timeRange = ref<string[]>([])
  const currency = ref<string>('')

  const db = ref<Database | null>(null)

  const loading = ref(false)

  const currencyRatio = computed(() => {
    return currencyMap.get(currency.value) || 1
  })

  async function fetchData() {
    const { network, unit_reports } = mock as any
    networkProfile.value = network
    currency.value = networkProfile.value?.currency || 'TWD'
    await storeData(unit_reports)
  }

  function setTimeRange(range: string[]) {
    timeRange.value = range
  }

  function setCurrency(value: string) {
    currency.value = value
  }

  async function initialize() {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    })
    db.value = new SQL.Database()
    db.value.run(`
      CREATE TABLE IF NOT EXISTS tbl_unit_reports (
        date TEXT,
        impression INTEGER,
        request INTEGER,
        revenue REAL,
        ecpm REAL,
        rpm REAL,
        unitId TEXT,
        PRIMARY KEY (date, unitId)
      )
    `)
  }

  async function storeData(data: any) {
    const schema = []
    let statement = ''
    for (const record of data) {
      const values = `(
        '${record.date}',
        '${record.impression}',
        '${record.request}',
        '${record.revenue}',
        '${record.impression === 0 ? 0 : (record.revenue / record.impression) * 1000}',
        '${record.request === 0 ? 0 : (record.revenue / record.request) * 1000}',
        '${record.unit_id}'
      )`

      if (statement.length === 0) {
        statement = `INSERT OR REPLACE INTO tbl_unit_reports VALUES ${values}`
      } else {
        statement += `,${values}`
      }

      if (statement.length >= 600000) {
        schema.push(`${statement};`)
        statement = ''
      }
    }

    if (statement.length) {
      schema.push(`${statement};`)
      statement = ''
    }
    await db.value.run(schema.join('\n'))
  }

  async function getStoreData(statement: string) {
    if (timeRange.value.length === 0) return []
    const result = await db.value?.exec(statement)
    return result[0]?.values || []
  }

  function showLoading() {
    loading.value = true
  }

  function hideLoading() {
    loading.value = false
  }

  return {
    initialize,

    fetchData,
    networkProfile,

    setTimeRange,
    timeRange,

    setCurrency,
    currency,
    currencyRatio,

    getStoreData,

    loading,
    showLoading,
    hideLoading
  }
})
