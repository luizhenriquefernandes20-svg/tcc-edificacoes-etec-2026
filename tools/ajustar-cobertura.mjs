// Corrige a cobertura do modelo 3D.
//
// Problema encontrado: os caibros e as ripas do pergolado (topo em Y=2,89)
// atravessavam a chapa da cobertura (face inferior entre Y=2,61 e 2,70 na
// faixa em que os dois se encontram). Eram 28 cm de peça de madeira passando
// por dentro da telha.
//
// Correção: elevar a cobertura e a viga que a apoia o suficiente para o beiral
// passar acima do pergolado, mantendo o caimento original de 10,3%. A chaminé
// é alongada para o alto — em vez de deslocada — para continuar atravessando a
// telha sem descolar da coifa embaixo.
//
// Uso: node tools/ajustar-cobertura.mjs [--conferir]

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const alvo = join(raiz, 'assets/model/espaco-gourmet-pergolado.glb');
const original = join(raiz, 'assets/model/espaco-gourmet-pergolado.original.glb');

const ELEVACAO = 0.32;      // metros — 28 cm de conflito + 4 cm de folga
const TOPO_CHAMINE = 3.79;  // metros — deixa ~39 cm de chaminé acima da telha

const conferir = process.argv.includes('--conferir');

// Preserva uma cópia intocada na primeira execução, para poder repetir o ajuste
if (!existsSync(original)) copyFileSync(alvo, original);
const buf = readFileSync(original);

// ---- desmonta o container GLB -------------------------------------------
const total = buf.readUInt32LE(8);
let off = 12;
const partes = [];
while (off < total) {
  const tam = buf.readUInt32LE(off);
  const tipo = buf.readUInt32LE(off + 4);
  partes.push({ tipo, ini: off + 8, tam });
  off += 8 + tam;
}
const parteJson = partes.find(p => p.tipo === 0x4e4f534a); // 'JSON'
const parteBin = partes.find(p => p.tipo === 0x004e4942);  // 'BIN'
const gltf = JSON.parse(buf.slice(parteJson.ini, parteJson.ini + parteJson.tam).toString('utf8'));
const bin = Buffer.from(buf.slice(parteBin.ini, parteBin.ini + parteBin.tam));

const indiceDe = nome => gltf.nodes.findIndex(n => n.name === nome);
const acessorDe = i => gltf.accessors[gltf.meshes[i].primitives[0].attributes.POSITION];

// Percorre as posições de uma malha aplicando uma função ao Y
function ajustarY(indiceNo, transformar) {
  const acc = acessorDe(indiceNo);
  const bv = gltf.bufferViews[acc.bufferView];
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const passo = bv.byteStride || 12;

  let menor = Infinity, maior = -Infinity;
  for (let k = 0; k < acc.count; k++) {
    const pos = base + k * passo;
    const x = bin.readFloatLE(pos);
    const y = bin.readFloatLE(pos + 4);
    const z = bin.readFloatLE(pos + 8);
    const novo = transformar(y, x, z);
    bin.writeFloatLE(novo, pos + 4);
    if (novo < menor) menor = novo;
    if (novo > maior) maior = novo;
  }
  // o min/max do accessor precisa acompanhar, senão o culling erra
  if (acc.min) acc.min[1] = menor;
  if (acc.max) acc.max[1] = maior;
  return { menor, maior };
}

const antes = {};
for (const nome of ['cobertura', 'viga_cobertura', 'chamine']) {
  const a = acessorDe(indiceDe(nome));
  antes[nome] = { min: a.min[1], max: a.max[1] };
}

if (conferir) {
  console.log('estado atual (sem gravar):');
  for (const [nome, v] of Object.entries(antes)) {
    console.log(`  ${nome.padEnd(16)} Y ${v.min.toFixed(2)} → ${v.max.toFixed(2)}`);
  }
  process.exit(0);
}

// ---- aplica os ajustes ---------------------------------------------------
const r1 = ajustarY(indiceDe('cobertura'), y => y + ELEVACAO);
const r2 = ajustarY(indiceDe('viga_cobertura'), y => y + ELEVACAO);

// A chaminé cresce só para cima: a base fica onde está, encaixada na coifa.
const chamine = antes.chamine;
const meio = (chamine.min + chamine.max) / 2;
const r3 = ajustarY(indiceDe('chamine'), y => (y > meio ? TOPO_CHAMINE : y));

// ---- remonta o GLB -------------------------------------------------------
let jsonTxt = JSON.stringify(gltf);
while (jsonTxt.length % 4 !== 0) jsonTxt += ' ';        // padding com espaço
const jsonBuf = Buffer.from(jsonTxt, 'utf8');
const binPad = (4 - (bin.length % 4)) % 4;
const binBuf = Buffer.concat([bin, Buffer.alloc(binPad)]); // padding com zero

const tamanhoFinal = 12 + 8 + jsonBuf.length + 8 + binBuf.length;
const saida = Buffer.alloc(tamanhoFinal);
saida.write('glTF', 0, 'ascii');
saida.writeUInt32LE(2, 4);
saida.writeUInt32LE(tamanhoFinal, 8);
saida.writeUInt32LE(jsonBuf.length, 12);
saida.writeUInt32LE(0x4e4f534a, 16);
jsonBuf.copy(saida, 20);
const posBin = 20 + jsonBuf.length;
saida.writeUInt32LE(binBuf.length, posBin);
saida.writeUInt32LE(0x004e4942, posBin + 4);
binBuf.copy(saida, posBin + 8);

writeFileSync(alvo, saida);

console.log('cobertura elevada em', ELEVACAO, 'm; chaminé alongada até', TOPO_CHAMINE, 'm\n');
const linha = (nome, a, d) =>
  console.log(`  ${nome.padEnd(16)} Y ${a.min.toFixed(2)}→${a.max.toFixed(2)}   vira   ${d.menor.toFixed(2)}→${d.maior.toFixed(2)}`);
linha('cobertura', antes.cobertura, r1);
linha('viga_cobertura', antes.viga_cobertura, r2);
linha('chamine', antes.chamine, r3);
console.log('\ngravado:', alvo);
