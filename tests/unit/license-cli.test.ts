import { execFileSync } from 'node:child_process'
import { generateKeyPairSync } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

const directory = mkdtempSync(join(tmpdir(), 'studentski-denar-license-'))

afterAll(() => rmSync(directory, { recursive: true, force: true }))

describe('license CLI', () => {
  it('parses --lifetime without consuming the following --key option', () => {
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    const keyPath = join(directory, 'private-key.local.pem')
    writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }))

    const license = execFileSync(
      process.execPath,
      [
        'scripts/generate-license.mjs',
        '--email',
        'ana@example.com',
        '--tier',
        'lifetime',
        '--lifetime',
        '--key',
        keyPath,
      ],
      { encoding: 'utf8' },
    ).trim()

    const payload = JSON.parse(Buffer.from(license.split('.')[1], 'base64url').toString('utf8'))
    expect(payload).toMatchObject({ tier: 'lifetime', lifetime: true, expiresAt: null })
  })
})
