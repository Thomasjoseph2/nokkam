/**
 * Opaque keyset-pagination cursors. Encodes the sort key of the last item so the next page
 * is fetched with a range query (stable under inserts, unlike skip/limit).
 */
export interface CreatedAtCursor {
  createdAt: Date;
  id: string;
}

export function encodeCursor(cursor: CreatedAtCursor): string {
  return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`).toString('base64url');
}

export function decodeCursor(raw: string): CreatedAtCursor | null {
  const decoded = Buffer.from(raw, 'base64url').toString('utf8');
  const [iso, id] = decoded.split('|');
  if (!iso || !id) return null;
  const createdAt = new Date(iso);
  return Number.isNaN(createdAt.getTime()) ? null : { createdAt, id };
}
