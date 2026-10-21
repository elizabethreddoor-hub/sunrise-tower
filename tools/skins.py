# Port P005 block skins to P007: recolour clothing toward blue/white/orange, keep faces/hair
from PIL import Image
import json
SRC='/workspace/aiob/skins/%s_skin_v0.1.png'
H=lambda s:tuple(int(s[i:i+2],16) for i in (1,3,5))
MAP={ # source clothing colour -> P007 colour (shade kept by delta)
 'mira':{},  # qipao #8C040C is her identity and reserved for her; untouched
 'nova':{'#B89B72':'#F08A24','#5A4032':'#1F4E85'},
 'vera':{'#E8837A':'#F08A24','#D9706A':'#C96A14'},
 'contract':{'#26385E':'#1F4E85'},
 'stylist':{'#7D9B76':'#6FA6DA'},
 'fx':{'#1E6B52':'#2F6FB3','#164F3D':'#1F4E85'},
}
def d(a,b): return sum((x-y)**2 for x,y in zip(a,b))**.5
for k,m in MAP.items():
  im=Image.open(SRC%k).convert('RGBA'); px=im.load(); n=0
  pairs=[(H(a),H(b)) for a,b in m.items()]
  for y in range(64):
    for x in range(64):
      r,g,b,a=px[x,y]
      if a==0: continue
      for s,t in pairs:
        if d((r,g,b),s)<26:
          px[x,y]=tuple(max(0,min(255,t[i]+(r,g,b)[i]-s[i])) for i in range(3))+(a,); n+=1; break
  im.save('skins/%s.png'%k); print(k,n,'px recoloured')
