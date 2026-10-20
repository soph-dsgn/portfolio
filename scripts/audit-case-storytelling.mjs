import assert from 'node:assert/strict'
import fs from 'node:fs'
import { caseVisuals } from '../src/data/caseVisuals.ts'
import { getCaseGroups, withoutFinalPeriod } from '../src/data/caseContent.ts'
import { diagramModeFor } from '../src/data/caseDiagramModes.ts'

const documents = JSON.parse(fs.readFileSync(new URL('../src/data/caseDocuments.json',import.meta.url),'utf8'))
const en = JSON.parse(fs.readFileSync(new URL('../src/i18n/en.json',import.meta.url),'utf8'))
const normalizedKey = text => text.replace(/[\u00a0\u202f]/g,' ').replace(/\u2011/g,'-').replace(/\s+/g,' ').trim().replace(/(?<!\.)\.$/,'')
assert.equal(en[normalizedKey('п. п.')],'pp','Percentage-point suffix must resolve through the production normalization')
const rows = []
let charts = 0, bars = 0, statements = 0, maxConsecutiveDiagrams = 0, resultMetrics = 0
for (const [project,visuals] of Object.entries(caseVisuals)) {
  const groups = getCaseGroups({document:documents[project]})
  const resultItems = groups.find(g=>g.id==='final').nodes[0].items
  resultMetrics += resultItems.length
  const evidence = visuals.filter(v=>v.group==='final'&&v.presentation==='changes')
  for (const group of groups) {
    let consecutive = 0
    for (const node of group.nodes) for (const visual of visuals.filter(v=>v.group===group.id&&(node.kind==='list'?node.items.join(' '):node.text).includes(v.after))) {
      consecutive = !visual.presentation && diagramModeFor(visual.id) ? consecutive + 1 : 0
      maxConsecutiveDiagrams = Math.max(maxConsecutiveDiagrams,consecutive)
    }
  }
  assert.equal(evidence.length,0,`${project}: results must remain compact metrics, not charts`)
  for (const v of visuals) {
    const hits = groups.filter(g=>g.id===v.group).flatMap(g=>g.nodes.filter(n=>(n.kind==='list'?n.items.join(' '):n.text).includes(v.after)))
    if (v.presentation) assert.equal(hits.length,1,`${v.id}: presentation must actually render once`)
    if (v.presentation) {
      if (['problem-solution','opportunity'].includes(v.presentation))
        assert(v.pairTones,`${v.id}: paired semantics must be configured explicitly`)
      if (['comparison','before-after','risks','states'].includes(v.presentation))
        assert(v.items.every(item=>item.tone),`${v.id}: missing explicit semantic tone`)
      for (const text of [v.title,v.caption,...v.items.flatMap(i=>[i.label,i.detail,i.note])].filter(Boolean)) {
        const key = normalizedKey(withoutFinalPeriod(text))
        if (/[а-яё]/i.test(key)) assert(en[key],`${v.id}: missing EN: ${key}`)
      }
    }
    if (v.presentation==='changes') {
      charts++
      for (const item of v.items) {
        const m = item.measure
        if (!m) { statements++; continue }
        bars += m.kind==='before-after'?2:1
        if (m.kind==='relative') {
          const values = typeof m.value==='number'?[m.value]:m.value
          assert(values.every(n=>Number.isFinite(n)&&n>=0),`${v.id}: invalid magnitude`)
          assert(values.length===1||values[0]<=values[1],`${v.id}: reversed interval`)
          const source = item.detail.match(/(\d+(?:[.,]\d+)?)(?:[–-](\d+(?:[.,]\d+)?))?\s*(%|п\.\s*п\.)/)
          assert(source,`${v.id}: no quantitative source`)
          assert.deepEqual(values,source[2]?[Number(source[1]),Number(source[2])]:[Number(source[1])],`${v.id}: magnitude differs from source`)
          assert.equal(m.unit,source[3]==='%'?'percent':'points',`${v.id}: % / pp confusion`)
        } else if (m.kind==='completion') assert(m.value>=0&&m.value<=100)
        else assert(m.before>=0&&m.after>=0)
      }
    }
    const form = v.presentation ?? diagramModeFor(v.id) ?? (v.columns?'reference table':'compact definitions')
    const reason = v.presentation==='changes'?'Measured change; no invented baselines':v.presentation?'Editorial evidence, not a relationship graph':hits.length?'Sequence, architecture, branch or scannable technical reference':'Legacy unmatched anchor; not reactivated to avoid duplicating current narrative'
    rows.push({project,id:v.id,form,live:hits.length===1,reason})
  }
}
assert(maxConsecutiveDiagrams<=3,'Four large diagrams in a row without another evidence format')
const summary={configured:rows.length,rendered:rows.filter(r=>r.live).length,editorial:rows.filter(r=>caseVisuals[r.project].find(v=>v.id===r.id).presentation).length,charts,bars,compactResultMetrics:resultMetrics,unscaledStatements:statements,maxConsecutiveDiagrams}
console.log(JSON.stringify(summary,null,2))
if(process.argv.includes('--report')) {
  const report = '# Case visual storytelling audit\n\n'+
    'All five results charts (portal-kpi, wallet-kpi, astoria-kpi, health-kpi, atlyx-kpi) were removed. The 22 original result statements are rendered by the existing compact CaseResults component. No outcome percentage was moved into research or interpreted as a completion share.\n\n'+
    'There are no confirmed stage shares, drop-off counts or baseline/final pairs in the current context/research source text. Atlyx mentions more than 10 scenarios and an average of 3–4 steps, but has no comparable baseline. These remain textual; no analytical chart has been invented. The reusable evidence renderer remains available for actual future measurements.\n\n'+
    'Shared comparison surfaces have no separators on desktop or mobile. Semantic tones are configured explicitly: problem/red, solution/green, neutral/grey, hypothesis/grey. SkyWallet versus Sky Capital remains neutral. The global cursor was removed; CaseCursor is unchanged.\n\n'+
    '| Case | Visual id | Presentation | Rendered | Reason |\n|---|---|---|---|---|\n'+rows.map(r=>`| ${r.project} | ${r.id} | ${r.form} | ${r.live?'yes':'no'} | ${r.reason} |`).join('\n')+'\n'
  fs.mkdirSync(new URL('../docs/',import.meta.url),{recursive:true})
  fs.writeFileSync(new URL('../docs/case-visual-storytelling.md',import.meta.url),report)
}
