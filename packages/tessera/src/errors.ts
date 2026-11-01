/**
 * One error type for the whole package. `locked` is deliberately the only reason a box fails to
 * open: a wrong key, a changed byte and a moved box look the same to whoever is trying.
 */
export type TesseraReason =
  | 'locked'
  | 'bad-encoding'
  | 'not-a-link'
  | 'no-key'
  | 'bad-key'
  | 'bad-id'
  | 'offline'
  | 'not-found'
  | 'gone'
  | 'conflict'
  | 'rejected'
  | 'relay';

export class TesseraError extends Error {
  readonly reason: TesseraReason;
  constructor(reason: TesseraReason, detail?: string) {
    super(detail ? `${reason}: ${detail}` : reason);
    this.name = 'TesseraError';
    this.reason = reason;
  }
}
