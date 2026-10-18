import { fetchWithAuth } from './auth'
import type { Song, MetaKey, PlaylistConfig } from '../types'
import { MULTI_VALUE_DELIMITER } from '../types'

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

function parseMultiValue(val: string): string[] {
  if (!val) return []
  return val.split(MULTI_VALUE_DELIMITER).map(v => v.trim()).filter(Boolean)
}

function encodeMultiValue(vals: string[]): string {
  return vals.filter(Boolean).join(MULTI_VALUE_DELIMITER)
}

export async function getSheetHeaders(spreadsheetId: string): Promise<string[]> {
  const res = await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Songs!1:1`
  )
  const data = await res.json()
  return data.values?.[0] || []
}

export async function getSongs(spreadsheetId: string): Promise<Song[]> {
  const res = await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Songs`
  )
  const data = await res.json()
  const rows: string[][] = data.values || []
  if (rows.length < 2) return []

  const headers = rows[0]
  return rows.slice(1).map(row => {
    const get = (col: string) => row[headers.indexOf(col)] || ''
    const song: Song = {
      id: get('ID'),
      name: get('Name'),
      nameRomanized: get('NameRomanized'),
      language: get('Language'),
      tags: parseMultiValue(get('Tags')),
      dateAdded: get('DateAdded'),
      links: parseMultiValue(get('Links')),
      vocalist: parseMultiValue(get('Vocalist')),
      custom: {},
    }
    const builtInCols = ['ID', 'Name', 'NameRomanized', 'Language', 'Tags', 'DateAdded', 'Links', 'Vocalist']
    headers.forEach((h, i) => {
      if (!builtInCols.includes(h)) {
        song.custom[h] = parseMultiValue(row[i] || '')
      }
    })
    return song
  })
}

export async function addSong(
  spreadsheetId: string,
  song: Omit<Song, 'id' | 'dateAdded'>,
  headers: string[]
): Promise<void> {
  const id = crypto.randomUUID()
  const dateAdded = new Date().toISOString().split('T')[0]

  const row = headers.map(h => {
    switch (h) {
      case 'ID': return id
      case 'Name': return song.name
      case 'NameRomanized': return song.nameRomanized
      case 'Language': return song.language
      case 'Tags': return encodeMultiValue(song.tags)
      case 'DateAdded': return dateAdded
      case 'Links': return encodeMultiValue(song.links)
      case 'Vocalist': return encodeMultiValue(song.vocalist)
      default: return encodeMultiValue(song.custom[h] || [])
    }
  })

  await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Songs:append?valueInputOption=RAW`,
    {
      method: 'POST',
      body: JSON.stringify({ values: [row] }),
    }
  )
}

export async function removeSong(spreadsheetId: string, songId: string): Promise<void> {
  const res = await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}/values/Songs`)
  const data = await res.json()
  const rows: string[][] = data.values || []
  if (rows.length < 2) return

  const headers = rows[0]
  const idCol = headers.indexOf('ID')
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[idCol] === songId)
  if (rowIndex === -1) return

  const metaRes = await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`)
  const metaData = await metaRes.json()
  const songsSheet = metaData.sheets.find(
    (s: { properties: { title: string } }) => s.properties.title === 'Songs'
  )
  const sheetId = songsSheet.properties.sheetId

  await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    }),
  })
}

export async function getMetaKeys(spreadsheetId: string): Promise<MetaKey[]> {
  const res = await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Meta`
  )
  const data = await res.json()
  const rows: string[][] = data.values || []
  if (rows.length < 2) return []

  return rows.slice(1).map(row => ({
    key: row[0] || '',
    label: row[1] || row[0] || '',
    isMultiValue: row[2] === 'true',
  }))
}

export async function addMetaKey(spreadsheetId: string, meta: MetaKey): Promise<void> {
  await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Meta:append?valueInputOption=RAW`,
    {
      method: 'POST',
      body: JSON.stringify({
        values: [[meta.key, meta.label, String(meta.isMultiValue)]],
      }),
    }
  )

  const headers = await getSheetHeaders(spreadsheetId)
  if (!headers.includes(meta.key)) {
    const col = String.fromCharCode(65 + headers.length)
    await fetchWithAuth(
      `${SHEETS_API}/${spreadsheetId}/values/Songs!${col}1?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[meta.key]] }),
      }
    )
  }
}

export async function removeMetaKey(spreadsheetId: string, key: string): Promise<void> {
  const metaRes = await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}/values/Meta`)
  const metaData = await metaRes.json()
  const metaRows: string[][] = metaData.values || []
  const metaRowIndex = metaRows.findIndex((r, i) => i > 0 && r[0] === key)

  if (metaRowIndex > 0) {
    const sheetMeta = await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`)
    const sheetData = await sheetMeta.json()
    const metaSheet = sheetData.sheets.find(
      (s: { properties: { title: string } }) => s.properties.title === 'Meta'
    )
    const metaSheetId = metaSheet.properties.sheetId

    await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: metaSheetId,
              dimension: 'ROWS',
              startIndex: metaRowIndex,
              endIndex: metaRowIndex + 1,
            },
          },
        }],
      }),
    })
  }

  const headers = await getSheetHeaders(spreadsheetId)
  const colIndex = headers.indexOf(key)
  if (colIndex >= 0) {
    const sheetMeta = await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`)
    const sheetData = await sheetMeta.json()
    const songsSheet = sheetData.sheets.find(
      (s: { properties: { title: string } }) => s.properties.title === 'Songs'
    )
    const songsSheetId = songsSheet.properties.sheetId

    await fetchWithAuth(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: songsSheetId,
              dimension: 'COLUMNS',
              startIndex: colIndex,
              endIndex: colIndex + 1,
            },
          },
        }],
      }),
    })
  }
}

export async function getConfig(spreadsheetId: string): Promise<PlaylistConfig> {
  const res = await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Config`
  )
  const data = await res.json()
  const rows: string[][] = data.values || []
  const configMap: Record<string, string> = {}
  rows.slice(1).forEach(r => {
    if (r[0]) configMap[r[0]] = r[1] || ''
  })
  return {
    playlistName: configMap.playlistName || 'Untitled',
    isPublic: configMap.isPublic === 'true',
    createdAt: configMap.createdAt || '',
  }
}

export async function updateConfig(
  spreadsheetId: string,
  key: string,
  value: string
): Promise<void> {
  const res = await fetchWithAuth(
    `${SHEETS_API}/${spreadsheetId}/values/Config`
  )
  const data = await res.json()
  const rows: string[][] = data.values || []
  const rowIndex = rows.findIndex(r => r[0] === key)

  if (rowIndex >= 0) {
    await fetchWithAuth(
      `${SHEETS_API}/${spreadsheetId}/values/Config!A${rowIndex + 1}:B${rowIndex + 1}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ values: [[key, value]] }),
      }
    )
  } else {
    await fetchWithAuth(
      `${SHEETS_API}/${spreadsheetId}/values/Config:append?valueInputOption=RAW`,
      {
        method: 'POST',
        body: JSON.stringify({ values: [[key, value]] }),
      }
    )
  }
}

export function parseSongsFromRaw(rows: string[][]): Song[] {
  if (rows.length < 2) return []
  const headers = rows[0]
  return rows.slice(1).map(row => {
    const get = (col: string) => row[headers.indexOf(col)] || ''
    const song: Song = {
      id: get('ID'),
      name: get('Name'),
      nameRomanized: get('NameRomanized'),
      language: get('Language'),
      tags: parseMultiValue(get('Tags')),
      dateAdded: get('DateAdded'),
      links: parseMultiValue(get('Links')),
      vocalist: parseMultiValue(get('Vocalist')),
      custom: {},
    }
    const builtInCols = ['ID', 'Name', 'NameRomanized', 'Language', 'Tags', 'DateAdded', 'Links', 'Vocalist']
    headers.forEach((h, i) => {
      if (!builtInCols.includes(h)) {
        song.custom[h] = parseMultiValue(row[i] || '')
      }
    })
    return song
  })
}

export function parseMetaFromRaw(rows: string[][]): MetaKey[] {
  if (rows.length < 2) return []
  return rows.slice(1).map(row => ({
    key: row[0] || '',
    label: row[1] || row[0] || '',
    isMultiValue: row[2] === 'true',
  }))
}

export function parseConfigFromRaw(rows: string[][]): PlaylistConfig {
  const configMap: Record<string, string> = {}
  rows.slice(1).forEach(r => {
    if (r[0]) configMap[r[0]] = r[1] || ''
  })
  return {
    playlistName: configMap.playlistName || 'Untitled',
    isPublic: configMap.isPublic === 'true',
    createdAt: configMap.createdAt || '',
  }
}
