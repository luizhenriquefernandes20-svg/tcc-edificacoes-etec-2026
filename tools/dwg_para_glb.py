# Converte o modelo 3D do projeto (exportado do Revit em DWG) para glTF binário,
# que é o formato que o visualizador do site consome.
#
# O caminho é: DWG --AutoCAD--> DXF --ezdxf--> malhas --este script--> GLB
#
# O DWG traz sólidos ACIS, um formato fechado que não se lê fora do AutoCAD.
# O ezdxf consegue reconstruir a malha a partir do B-rep quando as faces são
# planas, que é o caso de tudo que vem do Revit.
#
# Requer:  python -m pip install ezdxf
# Uso:     python tools/dwg_para_glb.py entrada.dxf saida.glb
#
# Para gerar o DXF a partir do DWG, no AutoCAD Core Console:
#   accoreconsole.exe /i modelo.dwg /s script.scr /l en-US
# com o script contendo: FILEDIA / 0 / _DXFOUT / caminho.dxf / 16

import sys, json, struct, math, collections
import ezdxf
from ezdxf.acis import api as acis

# Cada camada do Revit vira um material. Cor em RGB 0-1 e acabamento.
# As cores acompanham a paleta do site: concreto claro, madeira em tom de
# tijolo, metal escuro na cobertura.
MATERIAIS = {
    'Pisos':                   dict(cor=(0.851, 0.839, 0.808), metal=0.0, rugosidade=0.95),
    'Paredes':                 dict(cor=(0.937, 0.925, 0.902), metal=0.0, rugosidade=0.90),
    'Telhados':                dict(cor=(0.290, 0.278, 0.267), metal=0.6, rugosidade=0.45),
    'Quadro estrutural':       dict(cor=(0.659, 0.404, 0.290), metal=0.0, rugosidade=0.80),
    'Pilares estruturais':     dict(cor=(0.659, 0.404, 0.290), metal=0.0, rugosidade=0.80),
    'Mobiliário':              dict(cor=(0.722, 0.706, 0.682), metal=0.1, rugosidade=0.70),
    'Peças hidrossanitárias':  dict(cor=(0.784, 0.800, 0.816), metal=0.7, rugosidade=0.30),
    'Luminárias':              dict(cor=(0.227, 0.220, 0.212), metal=0.5, rugosidade=0.50),
    'Modelos genéricos':       dict(cor=(0.753, 0.737, 0.714), metal=0.0, rugosidade=0.85),
    'Importações nas famílias':dict(cor=(0.490, 0.600, 0.388), metal=0.0, rugosidade=1.00),
}
PADRAO = dict(cor=(0.70, 0.69, 0.67), metal=0.0, rugosidade=0.9)

# Camadas que são anotação de projeto, não geometria construída
IGNORAR = {'Níveis', 'Niveis', 'Defpoints', 'Eixos'}


def multiplicar(a, b):
    """Produto de duas matrizes 4x4 em lista de listas."""
    return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]


def matriz_do_insert(e):
    """Monta a matriz de um INSERT: escala, rotação em Z e deslocamento."""
    sx = e.dxf.get('xscale', 1.0) or 1.0
    sy = e.dxf.get('yscale', 1.0) or 1.0
    sz = e.dxf.get('zscale', 1.0) or 1.0
    ang = math.radians(e.dxf.get('rotation', 0.0) or 0.0)
    c, s = math.cos(ang), math.sin(ang)
    ins = e.dxf.insert
    return [
        [c * sx, -s * sy, 0.0, ins.x],
        [s * sx,  c * sy, 0.0, ins.y],
        [0.0,     0.0,    sz,  ins.z],
        [0.0,     0.0,    0.0, 1.0],
    ]


def aplicar(m, p):
    x, y, z = p
    return (
        m[0][0]*x + m[0][1]*y + m[0][2]*z + m[0][3],
        m[1][0]*x + m[1][1]*y + m[1][2]*z + m[1][3],
        m[2][0]*x + m[2][1]*y + m[2][2]*z + m[2][3],
    )


IDENTIDADE = [[1.0 if i == j else 0.0 for j in range(4)] for i in range(4)]


def coletar(doc, layout, matriz, saida, avisos, prof=0):
    """Percorre o desenho resolvendo blocos e acumula triângulos por camada."""
    if prof > 12:
        return
    for e in layout:
        tipo = e.dxftype()
        camada = e.dxf.get('layer', '0')

        if tipo == 'INSERT':
            try:
                bloco = doc.blocks[e.dxf.name]
            except Exception:
                continue
            coletar(doc, bloco, multiplicar(matriz, matriz_do_insert(e)), saida, avisos, prof + 1)
            continue

        if tipo not in ('3DSOLID', 'BODY', 'REGION', 'SURFACE'):
            continue
        if camada in IGNORAR:
            continue

        try:
            corpos = acis.load(e.acis_data)
        except Exception as erro:
            avisos[f'{tipo}: {type(erro).__name__}'] += 1
            continue

        for corpo in corpos:
            try:
                malhas = acis.mesh_from_body(corpo)
            except Exception as erro:
                avisos[f'malha: {type(erro).__name__}'] += 1
                continue
            for malha in malhas:
                vs = [aplicar(matriz, (v.x, v.y, v.z)) for v in malha.vertices]
                for face in malha.faces:
                    # a face pode ser um polígono de n lados: vira leque de triângulos
                    for k in range(1, len(face) - 1):
                        saida[camada].append((vs[face[0]], vs[face[k]], vs[face[k + 1]]))


def normal(a, b, c):
    ux, uy, uz = b[0]-a[0], b[1]-a[1], b[2]-a[2]
    vx, vy, vz = c[0]-a[0], c[1]-a[1], c[2]-a[2]
    nx, ny, nz = uy*vz - uz*vy, uz*vx - ux*vz, ux*vy - uy*vx
    tam = math.sqrt(nx*nx + ny*ny + nz*nz)
    return (nx/tam, ny/tam, nz/tam) if tam > 1e-12 else (0.0, 0.0, 1.0)


def montar_glb(por_camada, escala, centro, caminho):
    """Escreve o GLB: uma malha por camada, cada uma com seu material."""
    buffer = bytearray()
    acessores, views, malhas, nos, materiais = [], [], [], [], []

    def alinhar():
        while len(buffer) % 4:
            buffer.append(0)

    for camada, tris in por_camada.items():
        if not tris:
            continue
        pos, nor, idx = [], [], []
        for a, b, c in tris:
            n = normal(a, b, c)
            base = len(pos)
            for p in (a, b, c):
                # Revit usa Z para cima; glTF usa Y. Troca de eixo e centraliza.
                x = (p[0] - centro[0]) * escala
                y = (p[2] - centro[2]) * escala
                z = -(p[1] - centro[1]) * escala
                pos.append((x, y, z))
                nor.append((n[0], n[2], -n[1]))
            idx.extend((base, base + 1, base + 2))

        # --- posições ---
        alinhar(); ini = len(buffer)
        for p in pos:
            buffer += struct.pack('<fff', *p)
        views.append(dict(buffer=0, byteOffset=ini, byteLength=len(buffer)-ini))
        acessores.append(dict(
            bufferView=len(views)-1, componentType=5126, count=len(pos), type='VEC3',
            min=[min(p[i] for p in pos) for i in range(3)],
            max=[max(p[i] for p in pos) for i in range(3)],
        ))
        acc_pos = len(acessores) - 1

        # --- normais ---
        alinhar(); ini = len(buffer)
        for n in nor:
            buffer += struct.pack('<fff', *n)
        views.append(dict(buffer=0, byteOffset=ini, byteLength=len(buffer)-ini))
        acessores.append(dict(bufferView=len(views)-1, componentType=5126, count=len(nor), type='VEC3'))
        acc_nor = len(acessores) - 1

        # --- índices ---
        alinhar(); ini = len(buffer)
        usa32 = len(pos) > 65535
        for i in idx:
            buffer += struct.pack('<I' if usa32 else '<H', i)
        views.append(dict(buffer=0, byteOffset=ini, byteLength=len(buffer)-ini))
        acessores.append(dict(
            bufferView=len(views)-1, componentType=5125 if usa32 else 5123,
            count=len(idx), type='SCALAR',
        ))
        acc_idx = len(acessores) - 1

        m = MATERIAIS.get(camada, PADRAO)
        materiais.append(dict(
            name=camada,
            pbrMetallicRoughness=dict(
                baseColorFactor=[m['cor'][0], m['cor'][1], m['cor'][2], 1.0],
                metallicFactor=m['metal'], roughnessFactor=m['rugosidade'],
            ),
            doubleSided=True,
        ))
        malhas.append(dict(name=camada, primitives=[dict(
            attributes=dict(POSITION=acc_pos, NORMAL=acc_nor),
            indices=acc_idx, material=len(materiais)-1,
        )]))
        nos.append(dict(name=camada, mesh=len(malhas)-1))

    gltf = dict(
        asset=dict(version='2.0', generator='dwg_para_glb.py — TCC Edificações 2026'),
        scene=0, scenes=[dict(nodes=list(range(len(nos))))],
        nodes=nos, meshes=malhas, materials=materiais,
        accessors=acessores, bufferViews=views,
        buffers=[dict(byteLength=len(buffer))],
    )

    txt = json.dumps(gltf, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    txt += b' ' * ((4 - len(txt) % 4) % 4)
    bin_ = bytes(buffer) + b'\0' * ((4 - len(buffer) % 4) % 4)

    with open(caminho, 'wb') as f:
        f.write(b'glTF')
        f.write(struct.pack('<II', 2, 12 + 8 + len(txt) + 8 + len(bin_)))
        f.write(struct.pack('<I', len(txt))); f.write(b'JSON'); f.write(txt)
        f.write(struct.pack('<I', len(bin_))); f.write(b'BIN\0'); f.write(bin_)


def main():
    entrada = sys.argv[1] if len(sys.argv) > 1 else 'modelo.dxf'
    saida = sys.argv[2] if len(sys.argv) > 2 else 'modelo.glb'

    print('lendo', entrada)
    doc = ezdxf.readfile(entrada)

    por_camada = collections.defaultdict(list)
    avisos = collections.Counter()
    coletar(doc, doc.modelspace(), IDENTIDADE, por_camada, avisos)

    total = sum(len(v) for v in por_camada.values())
    if not total:
        print('nenhuma geometria reconhecida'); return 1

    # descobre a unidade do desenho pelo tamanho do conjunto
    todos = [p for tris in por_camada.values() for t in tris for p in t]
    mins = [min(p[i] for p in todos) for i in range(3)]
    maxs = [max(p[i] for p in todos) for i in range(3)]
    largura = max(maxs[i] - mins[i] for i in range(3))
    escala = 0.001 if largura > 500 else 1.0   # milímetros -> metros
    centro = [(mins[0]+maxs[0])/2, (mins[1]+maxs[1])/2, mins[2]]

    print('\ntriângulos por camada:')
    for cam, tris in sorted(por_camada.items(), key=lambda kv: -len(kv[1])):
        marca = '' if cam in MATERIAIS else '   (cor padrão)'
        print('  %-28s %7d%s' % (cam[:28], len(tris), marca))
    if avisos:
        print('\nnão convertidos:')
        for k, n in avisos.items():
            print('  %-40s %d' % (k, n))

    print('\ntamanho bruto: %.1f x %.1f x %.1f' % tuple(maxs[i]-mins[i] for i in range(3)))
    print('escala aplicada: %s' % ('mm para m' if escala != 1.0 else 'nenhuma'))
    print('resultado: %.2f x %.2f x %.2f m' % tuple((maxs[i]-mins[i])*escala for i in range(3)))

    montar_glb(por_camada, escala, centro, saida)
    import os
    print('\ngravado %s (%.2f MB, %d triângulos)' % (saida, os.path.getsize(saida)/1048576, total))
    return 0


if __name__ == '__main__':
    sys.exit(main())
