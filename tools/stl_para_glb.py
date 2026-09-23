# Junta os STL exportados do AutoCAD (um por camada) num único glTF binário.
#
# Por que passar por STL: o ezdxf só reconstrói malha de faces planas, e o
# projeto tem peças curvas (pilares roliços, cuba, torneira, luminárias) que
# ficavam de fora. O próprio AutoCAD sabe triangular sólidos ACIS curvos —
# é isso que o comando STLOUT faz. Exportando uma vez por camada, a
# informação de material, que o STL não carrega, vem do nome do arquivo.
#
# Uso:  python tools/stl_para_glb.py pasta_com_stl saida.glb

import sys, os, struct, math, collections, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dwg_para_glb import montar_glb, MATERIAIS   # paleta e escritor de GLB


# O DWG sai do Revit girado: nada nele é paralelo aos eixos do desenho. As três
# famílias de faces do modelo (topo de laje, e as duas direções de parede) formam
# um triedro perfeito, e é ele que devolve a peça à posição de pé. A confirmação
# vem da própria cobertura: em relação a este vertical ela fica a 5,71°, ou seja,
# 10% de caimento — o valor do projeto.
BASE = (
    ( 0.59722, -0.79876,  0.07282),   # comprimento
    ( 0.79877,  0.58413, -0.14441),   # largura
    ( 0.07282,  0.14441,  0.98683),   # vertical
)


def desgirar(p):
    return tuple(sum(p[i] * eixo[i] for i in range(3)) for eixo in BASE)


def nome_da_camada(arquivo):
    """O AutoCAD grava os STL sem acento; devolve o nome de camada original."""
    def simples(t):
        t = unicodedata.normalize('NFKD', t)
        return ''.join(c for c in t if not unicodedata.combining(c)).lower()
    base = os.path.splitext(arquivo)[0]
    alvo = simples(base)
    for camada in MATERIAIS:
        if simples(camada) == alvo:
            return camada
    return base


def ler_stl(caminho):
    """Lê STL binário ou ASCII e devolve lista de triângulos."""
    with open(caminho, 'rb') as f:
        dados = f.read()
    if dados[:5].lower() == b'solid' and b'facet' in dados[:2048]:
        return ler_stl_texto(dados.decode('utf-8', 'replace'))

    n = struct.unpack_from('<I', dados, 80)[0]
    if 84 + n * 50 != len(dados):
        raise ValueError('%s: tamanho não bate com %d triângulos' % (caminho, n))
    tris = []
    for i in range(n):
        base = 84 + i * 50 + 12          # pula a normal gravada
        v = struct.unpack_from('<9f', dados, base)
        tris.append((v[0:3], v[3:6], v[6:9]))
    return tris


def ler_stl_texto(txt):
    tris, atual = [], []
    for linha in txt.splitlines():
        p = linha.split()
        if len(p) == 4 and p[0] == 'vertex':
            atual.append((float(p[1]), float(p[2]), float(p[3])))
            if len(atual) == 3:
                tris.append(tuple(atual)); atual = []
    return tris


def main():
    pasta = sys.argv[1] if len(sys.argv) > 1 else '.'
    saida = sys.argv[2] if len(sys.argv) > 2 else 'modelo.glb'

    por_camada = collections.OrderedDict()
    for arq in sorted(os.listdir(pasta)):
        if not arq.lower().endswith('.stl'):
            continue
        camada = nome_da_camada(arq)
        tris = [tuple(desgirar(v) for v in t)
                for t in ler_stl(os.path.join(pasta, arq))]
        if tris:
            por_camada[camada] = tris

    if not por_camada:
        print('nenhum STL com geometria em', pasta); return 1

    todos = [p for tris in por_camada.values() for t in tris for p in t]
    mins = [min(p[i] for p in todos) for i in range(3)]
    maxs = [max(p[i] for p in todos) for i in range(3)]
    largura = max(maxs[i] - mins[i] for i in range(3))
    escala = 0.001 if largura > 500 else 1.0
    centro = [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2, mins[2]]

    print('triângulos por camada:')
    for cam, tris in sorted(por_camada.items(), key=lambda kv: -len(kv[1])):
        marca = '' if cam in MATERIAIS else '   (cor padrão)'
        print('  %-28s %8d%s' % (cam[:28], len(tris), marca))

    print('\nresultado: %.2f x %.2f x %.2f m' %
          tuple((maxs[i] - mins[i]) * escala for i in range(3)))

    montar_glb(por_camada, escala, centro, saida)
    total = sum(len(v) for v in por_camada.values())
    print('gravado %s (%.2f MB, %d triângulos)'
          % (saida, os.path.getsize(saida) / 1048576, total))
    return 0


if __name__ == '__main__':
    sys.exit(main())
