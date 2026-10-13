import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
const root = new URL('../', import.meta.url)
const english = JSON.parse(fs.readFileSync(new URL('src/i18n/en.json', root), 'utf8'))
const russian = JSON.parse(fs.readFileSync(new URL('src/i18n/ru.json', root), 'utf8'))
const numbers = text => (text.replace(/(\d) (?=\d{3}\b)/g, '$1').replace(/(\d),(?=\d{3}\b)/g, '$1').match(/\d+(?:[.,]\d+)?/g) ?? []).sort()
assert.equal(new Set(russian).size, russian.length)
assert.equal(Object.keys(english).length, russian.length)
for (const source of russian) {
  assert.ok(english[source]?.trim(), `Missing translation: ${source}`)
  // Brand spelling explicitly retained in English portfolio copy.
  assert.ok(!/[А-Яа-яЁё]/.test(english[source].replace(/Юкки/g, '')), `Mixed language: ${source}`)
  assert.deepEqual(numbers(english[source]), numbers(source), `Changed numbers: ${source}`)
}
const path = new URL('src/i18n/translate.ts', root)
const compiled = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
const result = { exports: {} }
vm.runInNewContext(compiled, { module: result, exports: result.exports, require: createRequire(path) })
const { translate } = result.exports
assert.equal(translate('с\u00a0опытом в\u00a0финтехе,', 'en'), 'with experience in fintech,')
assert.equal(translate('Фото Софьи Стрельченко', 'en'), 'Photo of Sophie Strelchenko')
assert.equal(translate('Карта → Поиск', 'en'), 'Map → Search')
assert.equal(translate('Воспроизвести: Мессенджер', 'en'), 'Play: Messenger')
assert.equal(translate('Перейти к экрану 2: Обо мне', 'en'), 'Go to screen 2: About')
assert.equal(translate('01.10.2026', 'en'), '01.10.2026')
assert.equal(translate('Figma', 'en'), 'Figma')
assert.equal(translate('В опыте — Юкки', 'ru'), 'В опыте — Юкки')
console.log(`Localization: ${russian.length} entries checked; numbers and dynamic labels preserved`)
