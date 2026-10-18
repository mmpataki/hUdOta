import { GOOGLE_API_KEY, APP_PROPERTY_KEY } from '../config'
import { fetchWithAuth, getAccessToken } from './auth'
import type { PlaylistInfo } from '../types'

const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function listPlaylists(): Promise<PlaylistInfo[]> {
  const q = `appProperties has { key='app' and value='${APP_PROPERTY_KEY}' } and trashed=false`
  const res = await fetchWithAuth(
    `${DRIVE_API}/files?q=${encodeURIComponent(q)}&fields=files(id,name)&orderBy=modifiedTime desc`
  )
  const data = await res.json()
  return (data.files || []).map((f: { id: string; name: string }) => ({
    id: f.id,
    name: f.name,
  }))
}

export async function createPlaylist(name: string): Promise<PlaylistInfo> {
  const res = await fetchWithAuth(SHEETS_API, {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        title: name,
      },
      sheets: [
        {
          properties: { title: 'Songs', index: 0 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'ID' } },
                { userEnteredValue: { stringValue: 'Name' } },
                { userEnteredValue: { stringValue: 'NameRomanized' } },
                { userEnteredValue: { stringValue: 'Language' } },
                { userEnteredValue: { stringValue: 'Tags' } },
                { userEnteredValue: { stringValue: 'DateAdded' } },
                { userEnteredValue: { stringValue: 'Links' } },
                { userEnteredValue: { stringValue: 'Vocalist' } },
              ],
            }],
          }],
        },
        {
          properties: { title: 'Meta', index: 1 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Key' } },
                { userEnteredValue: { stringValue: 'Label' } },
                { userEnteredValue: { stringValue: 'IsMultiValue' } },
              ],
            }],
          }],
        },
        {
          properties: { title: 'Config', index: 2 },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Key' } },
                  { userEnteredValue: { stringValue: 'Value' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'playlistName' } },
                  { userEnteredValue: { stringValue: name } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'isPublic' } },
                  { userEnteredValue: { stringValue: 'false' } },
                ],
              },
              {
                values: [
                  { userEnteredValue: { stringValue: 'createdAt' } },
                  { userEnteredValue: { stringValue: new Date().toISOString() } },
                ],
              },
            ],
          }],
        },
      ],
    }),
  })
  const data = await res.json()
  const spreadsheetId = data.spreadsheetId

  await fetchWithAuth(`${DRIVE_API}/files/${spreadsheetId}?fields=id`, {
    method: 'PATCH',
    body: JSON.stringify({
      appProperties: { app: APP_PROPERTY_KEY },
    }),
  })

  return { id: spreadsheetId, name }
}

export async function deletePlaylist(spreadsheetId: string): Promise<void> {
  await fetchWithAuth(`${DRIVE_API}/files/${spreadsheetId}`, {
    method: 'DELETE',
  })
}

export async function setPlaylistPublic(spreadsheetId: string, isPublic: boolean): Promise<void> {
  if (isPublic) {
    await fetchWithAuth(`${DRIVE_API}/files/${spreadsheetId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    })
  } else {
    const res = await fetchWithAuth(
      `${DRIVE_API}/files/${spreadsheetId}/permissions?fields=permissions(id,type)`
    )
    const data = await res.json()
    const anyonePerm = data.permissions?.find((p: { type: string }) => p.type === 'anyone')
    if (anyonePerm) {
      await fetchWithAuth(
        `${DRIVE_API}/files/${spreadsheetId}/permissions/${anyonePerm.id}`,
        { method: 'DELETE' }
      )
    }
  }
}

export async function fetchPublicSpreadsheet(spreadsheetId: string): Promise<Record<string, string[][]>> {
  const url = `${SHEETS_API}/${spreadsheetId}/values:batchGet?ranges=Songs&ranges=Meta&ranges=Config&key=${GOOGLE_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Playlist not found or not public')
  const data = await res.json()
  const result: Record<string, string[][]> = {}
  for (const vr of data.valueRanges || []) {
    const sheetName = vr.range.split('!')[0].replace(/'/g, '')
    result[sheetName] = vr.values || []
  }
  return result
}

export function getPublicUrl(spreadsheetId: string): string {
  const base = window.location.href.split('#')[0]
  return `${base}#/public/${spreadsheetId}`
}
