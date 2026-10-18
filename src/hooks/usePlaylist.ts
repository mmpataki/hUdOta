import { useState, useCallback } from 'react'
import type { Song, MetaKey, PlaylistConfig } from '../types'
import * as sheets from '../services/sheets'
import * as drive from '../services/drive'
import type { PlaylistInfo } from '../types'

export function usePlaylist() {
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistInfo | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [metaKeys, setMetaKeys] = useState<MetaKey[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [config, setConfig] = useState<PlaylistConfig | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPlaylists = useCallback(async () => {
    setLoading(true)
    const list = await drive.listPlaylists()
    setPlaylists(list)
    setLoading(false)
    return list
  }, [])

  const selectPlaylist = useCallback(async (playlist: PlaylistInfo) => {
    setLoading(true)
    setCurrentPlaylist(playlist)
    const [songData, meta, hdrs, cfg] = await Promise.all([
      sheets.getSongs(playlist.id),
      sheets.getMetaKeys(playlist.id),
      sheets.getSheetHeaders(playlist.id),
      sheets.getConfig(playlist.id),
    ])
    setSongs(songData)
    setMetaKeys(meta)
    setHeaders(hdrs)
    setConfig(cfg)
    setLoading(false)
  }, [])

  const createPlaylist = useCallback(async (name: string) => {
    setLoading(true)
    const info = await drive.createPlaylist(name)
    setPlaylists(prev => [info, ...prev])
    await selectPlaylist(info)
    setLoading(false)
    return info
  }, [selectPlaylist])

  const deletePlaylist = useCallback(async (id: string) => {
    await drive.deletePlaylist(id)
    setPlaylists(prev => prev.filter(p => p.id !== id))
    if (currentPlaylist?.id === id) {
      setCurrentPlaylist(null)
      setSongs([])
      setMetaKeys([])
      setHeaders([])
      setConfig(null)
    }
  }, [currentPlaylist])

  const addSong = useCallback(async (song: Omit<Song, 'id' | 'dateAdded'>) => {
    if (!currentPlaylist) return
    await sheets.addSong(currentPlaylist.id, song, headers)
    const updated = await sheets.getSongs(currentPlaylist.id)
    setSongs(updated)
  }, [currentPlaylist, headers])

  const removeSong = useCallback(async (songId: string) => {
    if (!currentPlaylist) return
    await sheets.removeSong(currentPlaylist.id, songId)
    setSongs(prev => prev.filter(s => s.id !== songId))
  }, [currentPlaylist])

  const addMeta = useCallback(async (meta: MetaKey) => {
    if (!currentPlaylist) return
    await sheets.addMetaKey(currentPlaylist.id, meta)
    const [updatedMeta, updatedHeaders] = await Promise.all([
      sheets.getMetaKeys(currentPlaylist.id),
      sheets.getSheetHeaders(currentPlaylist.id),
    ])
    setMetaKeys(updatedMeta)
    setHeaders(updatedHeaders)
  }, [currentPlaylist])

  const removeMeta = useCallback(async (key: string) => {
    if (!currentPlaylist) return
    await sheets.removeMetaKey(currentPlaylist.id, key)
    const [updatedMeta, updatedHeaders, updatedSongs] = await Promise.all([
      sheets.getMetaKeys(currentPlaylist.id),
      sheets.getSheetHeaders(currentPlaylist.id),
      sheets.getSongs(currentPlaylist.id),
    ])
    setMetaKeys(updatedMeta)
    setHeaders(updatedHeaders)
    setSongs(updatedSongs)
  }, [currentPlaylist])

  const togglePublic = useCallback(async () => {
    if (!currentPlaylist || !config) return
    const newVal = !config.isPublic
    await Promise.all([
      sheets.updateConfig(currentPlaylist.id, 'isPublic', String(newVal)),
      drive.setPlaylistPublic(currentPlaylist.id, newVal),
    ])
    setConfig(prev => prev ? { ...prev, isPublic: newVal } : prev)
  }, [currentPlaylist, config])

  return {
    playlists,
    currentPlaylist,
    songs,
    metaKeys,
    headers,
    config,
    loading,
    loadPlaylists,
    selectPlaylist,
    createPlaylist,
    deletePlaylist,
    addSong,
    removeSong,
    addMeta,
    removeMeta,
    togglePublic,
  }
}
