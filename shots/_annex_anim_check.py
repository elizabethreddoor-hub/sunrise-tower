import asyncio
from playwright.async_api import async_playwright
JS="""async()=>{const a=P7_annex,[BX0,BX1,BZ0,BZ1]=a.bounds,res=[];
 const rects={fence_annex:[BX0,BX1,BZ0,BZ1+.3],sign:[BX0,BX1,BZ1,BZ1+.5],plinth:[-16,16,-10.45,12.05]};
 for(const i of [2,1,0]){const c=P7_cars[i];for(const mode of ['leaving','returning']){
   c.state=mode;c.d=mode==='leaving'?0:48;c.g.visible=true;let hit=[],minz=1e9,minxAnnex=1e9,n=0;
   while(c.state===mode){await new Promise(r=>setTimeout(r,50));const q=c.g.position,b={min:{x:q.x-1.8,z:q.z-.925},max:{x:q.x+1.8,z:q.z+.925}};n++;
     for(const k in rects){const r=rects[k];if(b.max.x>r[0]&&b.min.x<r[1]&&b.max.z>r[2]&&b.min.z<r[3]&&b.min.x>-60&&b.max.x<40)hit.push(k+'@d='+c.d.toFixed(1));}
     if(b.min.z<minz)minz=b.min.z;if(b.max.x>-60) {}
     if(n>600)break;}
   res.push({car:i,mode,samples:n,hits:[...new Set(hit.map(h=>h.split('@')[0]))],minZ_front_clearance_vs_fence:+(minz-(BZ1+.3)).toFixed(2),finalState:c.state});
   if(mode==='leaving'){c.state='gone';}}
 }
 return JSON.stringify(res)}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':640,'height':400})
        pg.on('pageerror',lambda e:print('ERR',e))
        await pg.goto('http://localhost:8765/index.html?sched=0&dump=1'); await pg.wait_for_timeout(10000)
        print(await pg.evaluate(JS))
        await b.close()
asyncio.run(main())
