# Security Specification — POUVOIR & CONSÉQUENCE

## 1. Data Invariants

1. **Identity & Authentication**:
   - Public reads (`get`, `list`) are allowed on `/powers/{powerId}` and `/consequences/{consequenceId}`.
   - All writes (`create`, `update`) require `request.auth != null` (including Firebase Anonymous Authentication).
   - No `delete` operation is permitted on any collection (`powers`, `consequences`, `consequenceVotes`, `duoVotes`).
   - On creation of `powers` or `consequences`, `authorUid` MUST strictly equal `request.auth.uid`, and `createdAt` MUST strictly equal `request.time`.
   - On creation of `consequenceVotes` or `duoVotes`, `uid` MUST strictly equal `request.auth.uid`, and `createdAt` MUST strictly equal `request.time`.

2. **Schema & Volumetric Bounds**:
   - `powers`:
     - `text`: string, `10 <= size() <= 200`
     - `authorUid`: string, `1 <= size() <= 128`, regex `^[a-zA-Z0-9_\-]+$`
     - `authorName`: string, `2 <= size() <= 20`
     - `createdAt`: timestamp (`request.time` on create, immutable on update)
     - `consequenceCount`: int (`0` on create, `+1` only on update)
     - `bestConsequenceId`: `null` on create, valid ID string on update
     - `bestConsequenceVotes`: int (`0` on create, `>= existing + 1` on update)
   - `consequences`:
     - `powerId`: valid ID string referencing an existing `/powers/{powerId}` document
     - `powerText`: string (`10 <= size() <= 200`) matching the parent power's text
     - `text`: string (`5 <= size() <= 160`)
     - `authorUid`: string (`request.auth.uid`)
     - `authorName`: string (`2 <= size() <= 20`)
     - `createdAt`: timestamp (`request.time` on create)
     - `votes`: int (`0` on create, `+1` only on update)
     - `duoVotes`: int (`0` on create, `+1` only on update)
   - `consequenceVotes`:
     - Document ID `voteId` MUST equal `request.auth.uid + '_' + incoming().powerId`
     - `uid`, `powerId`, `consequenceId`, `createdAt` required and strictly typed; no updates or deletes allowed.
   - `duoVotes`:
     - Document ID `voteId` MUST equal `request.auth.uid + '_' + incoming().consequenceId`
     - `uid`, `powerId`, `consequenceId`, `createdAt` required and strictly typed; no updates or deletes allowed.

3. **Atomicity & Counter Integrity (`getAfter` / `existsAfter`)**:
   - Text fields (`text`, `powerText`, `authorName`, `authorUid`, `createdAt`) can NEVER be modified after creation.
   - Incrementing `consequences/{consequenceId}.votes` by `+1` requires that `/consequenceVotes/$(request.auth.uid + '_' + existing().powerId)` did NOT exist before the batch and DOES exist after (`getAfter`) with `consequenceId == consequenceId`.
   - Incrementing `consequences/{consequenceId}.duoVotes` by `+1` requires that `/duoVotes/$(request.auth.uid + '_' + consequenceId)` did NOT exist before the batch and DOES exist after (`existsAfter`).
   - Incrementing `powers/{powerId}.consequenceCount` by `+1` is the only allowed counter change on `consequenceCount`.
   - Updating `powers/{powerId}.bestConsequenceId` and `bestConsequenceVotes` requires a concurrent valid vote creation in `consequenceVotes` (`getAfter`) and `bestConsequenceVotes >= existing().bestConsequenceVotes + 1`.

---

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Power Creation**: `auth = null`, creating `/powers/p1` → `PERMISSION_DENIED`.
2. **Identity Spoofing on Power Creation**: `auth.uid = 'userA'`, `authorUid = 'userB'` → `PERMISSION_DENIED`.
3. **Short Text Bypass on Power**: `text = 'Court'` (< 10 chars) → `PERMISSION_DENIED`.
4. **Oversized Text Resource Exhaustion**: `text` with 500 chars (> 200 chars) → `PERMISSION_DENIED`.
5. **Pre-Seeded Votes on Power Creation**: `consequenceCount = 50` or `bestConsequenceVotes = 99` on create → `PERMISSION_DENIED`.
6. **Shadow Field Injection on Consequence**: Adding `{ isFeatured: true }` to `/consequences/c1` → `PERMISSION_DENIED`.
7. **Post-Creation Text Mutation**: Author `userA` attempting to update `text` on `/powers/p1` → `PERMISSION_DENIED`.
8. **Counter Jump Attack (`+10` Votes)**: Updating `/consequences/c1` with `votes: existing.votes + 10` → `PERMISSION_DENIED`.
9. **Unbacked Counter Increment (No Vote Doc in Batch)**: Incrementing `/consequences/c1.duoVotes` by `+1` without creating `/duoVotes/userA_c1` in the same batch → `PERMISSION_DENIED`.
10. **Forged Vote ID**: Creating `/consequenceVotes/randomId` where ID != `uid + '_' + powerId` → `PERMISSION_DENIED`.
11. **Vote Modification / Double Vote**: Updating or overwriting `/duoVotes/userA_c1` after creation → `PERMISSION_DENIED`.
12. **Document Deletion Attempt**: Deleting `/powers/p1`, `/consequences/c1`, or `/duoVotes/userA_c1` → `PERMISSION_DENIED`.
