const GOOGLE_INPUT_TOOLS = 'https://inputtools.google.com/request'

export async function transliterate(
  text: string,
  itc: string,
  numSuggestions = 5
): Promise<string[]> {
  if (!text.trim() || !itc) return []

  const params = new URLSearchParams({
    text: text.trim(),
    itc,
    num: String(numSuggestions),
    cp: '0',
    cs: '1',
    ie: 'utf-8',
    oe: 'utf-8',
  })

  const res = await fetch(`${GOOGLE_INPUT_TOOLS}?${params}`)
  if (!res.ok) return []

  const data = await res.json()
  // Response format: ["SUCCESS", [["input", ["suggestion1", "suggestion2", ...]]]]
  if (data[0] !== 'SUCCESS' || !data[1]?.[0]?.[1]) return []
  return data[1][0][1] as string[]
}
