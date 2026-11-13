/* Original art and deterministic local animation. Coordinates are logical 960 x 540. */
const display=document.getElementById('picture'),out=display.getContext('2d');
const stage=document.createElement('canvas');stage.width=960;stage.height=540;
const g=stage.getContext('2d');
const C={ink:'#11172e',night:'#161e3a',blue:'#273c61',river:'#1c3555',wave:'#425e7b',pink:'#ee9eae',cream:'#f7e5bc',gold:'#dfad67',dark:'#111628',wood:'#514151',purple:'#635376'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*clamp(t),r=Math.round;
const fract=v=>v-Math.floor(v),hash=n=>fract(Math.sin(n*127.13+31.71)*43758.5453);
const pulse=(t,at,d=.4)=>t<at||t>at+d?0:Math.sin((t-at)/d*Math.PI);
const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(r(x),r(y),r(w),r(h))};
function poly(points,c){g.fillStyle=c;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(r(x),r(y)):g.moveTo(r(x),r(y)));g.closePath();g.fill()}
function line(points,c,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineJoin='miter';g.lineCap='square';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(r(x),r(y)):g.moveTo(r(x),r(y)));g.stroke()}
function pixelDisc(x,y,rad,c,sx=1){if(rad<=0)return;g.fillStyle=c;const step=rad>120?4:2;for(let dy=-rad;dy<rad;dy+=step){const hw=Math.sqrt(Math.max(0,rad*rad-dy*dy))*sx;g.fillRect(r(x-hw),r(y+dy),Math.max(1,r(hw*2)),step+1)}}
function text(s,x,y,size=20,c=C.cream,align='center'){g.font=`900 ${size}px MVChinese`;g.textAlign=align;g.textBaseline='middle';g.fillStyle=c;g.fillText(s,r(x),r(y))}
function star(x,y,s,c=C.cream){rect(x-s,y,2*s+2,2,c);rect(x,y-s,2,2*s+2,c)}
function heart(x,y,s,c=C.pink){poly([[x-3*s,y-2*s],[x-s,y-2*s],[x,y-s],[x+s,y-2*s],[x+3*s,y-2*s],[x+3*s,y],[x,y+3*s],[x-3*s,y]],c)}
function shadowOval(x,y,w=45,h=5){g.globalAlpha=.25;pixelDisc(x,y,h,'#090d20',w/h);g.globalAlpha=1}
function panel(x,y,w,h,c,edge=C.ink){rect(x-3,y-3,w+6,h+6,edge);rect(x,y,w,h,c)}
function camera(cx,cy,z){g.translate(480,270);g.scale(z,z);g.translate(-cx,-cy)}
const sprites={boat:new Image(),people:new Image()};sprites.boat.src='assets/boat-atlas.png';sprites.people.src='assets/people-atlas.png';
const boats=[
 [43,82,422,341,231,397],[486,102,379,342,676,397],[913,89,385,346,1105,397],[1352,80,397,324,1550,397],
 [42,487,391,329,236,809],[471,497,403,319,673,809],[911,487,395,329,1107,809],[1352,497,396,319,1550,809]
];
const people=[
 [82,65,238,304,180,364],[455,89,215,281,553,364],[751,80,277,290,918,364],[1142,80,244,290,1283,364],
 [82,398,220,319,197,711],[451,392,241,325,560,711],[784,398,234,319,901,711],[1170,402,207,315,1263,711],
 [90,736,208,316,184,1046],[457,736,204,316,555,1046],[805,736,212,316,902,1046],[1170,749,214,310,1259,1053]
];
function sprite(kind,i,x,y,s,alpha=1){const a=(kind==='boat'?boats:people)[i];g.save();g.globalAlpha=alpha;g.imageSmoothingEnabled=false;g.drawImage(sprites[kind],a[0],a[1],a[2],a[3],r(x+(a[0]-a[4])*s),r(y+(a[1]-a[5])*s),r(a[2]*s),r(a[3]*s));g.restore()}
function boat(i,x,y,s=.55){sprite('boat',i,x,y,s)}
function person(i,x,y,s=.48,a=1){sprite('people',i,x,y,s,a)}

function sky(t,arcade=false){
 rect(-700,-600,2360,1400,arcade?'#202039':C.night);
 rect(-700,133,2360,100,'#242e4a');rect(-700,233,2360,60,'#33405a');
 for(let i=0;i<43;i++){const x=hash(i)*1000,y=hash(i+101)*210;const blink=(Math.floor(t*1.3+i)%7===0);rect(x,y,blink?3:2,blink?3:2,i%4===0?C.pink:'#7f829a')}
 pixelDisc(718,78,31,C.cream);pixelDisc(731,66,29,C.night);
 for(let j=0;j<4;j++){const x=((j*281-t*(j%2?1.2:.55)+1100)%1200)-160,y=75+j%2*58;poly([[x,y+12],[x+20,y+12],[x+20,y+4],[x+59,y+4],[x+59,y],[x+92,y],[x+92,y+10],[x+140,y+10],[x+140,y+20],[x,y+20]],j%2?'#303852':'#2b324d')}
 for(let layer=0;layer<2;layer++)for(let i=0;i<21;i++){
  const w=34+hash(i+layer*90)*26,h=25+hash(i+71+layer*10)*87,x=i*55-40,y=268-h;
  rect(x,y,w,h,layer?'#26344d':'#303953');
  if(i%3===0)rect(x+7,y-13,4,14,'#27334a');
  for(let a=0;a<3;a++)for(let b=0;b<Math.floor(h/14)-1;b++)if(hash(i*51+a*11+b*3)>.44)rect(x+7+a*11,y+10+b*15,4,6,(i+a+b)%3===0?'#ad8b75':'#6c6d7a');
 }
 // A bridge stays part of the city rather than becoming a decorative motion layer.
 rect(-20,253,1000,10,'#171f37');rect(-20,252,1000,2,'#7d6c78');
 for(let i=0;i<10;i++){rect(i*110,252,9,30,'#18223d');rect(i*110+35,235,3,18,'#18223d');rect(i*110+34,232,5,4,C.gold)}
}
function water(t){
 rect(-700,280,2360,600,C.river);
 for(let i=0;i<125;i++){
  const y=286+hash(i+8)*280,x=(hash(i)*1200+t*(i%2?2.4:-1.6)+1200)%1200-120,w=7+hash(i+2)*42;
  rect(x,y,w,2,i%5===0?'#4a6176':'#2a4565');
 }
 for(let j=0;j<7;j++)for(let k=0;k<14;k++){
  const x=85+j*129+Math.sin(k*3.1+t*1.3+j)*6,y=282+k*11,w=3+hash(j*40+k)*15;
  rect(x-w/2,y,w,2,j===5?'#b78a81':'#7b6c75');
 }
}
function dock(x,y,w,left=false){
 rect(x,y,w,10,'#9d7e78');rect(x,y+10,w,19,'#5c4f63');rect(x,y+27,w,9,'#383a51');
 for(let i=0;i<w/34;i++){rect(x+i*34,y+11,2,16,'#3b354b');rect(x+i*34+3,y+12,23,2,'#7b6273')}
 for(let i=0;i<3;i++){const px=x+14+i*(w-30)/2;rect(px,y+36,10,124,'#232b43');rect(px+2,y+38,2,112,'#5b5063')}
 if(left){for(let i=0;i<18;i++){const px=x+hash(i)*w;rect(px,y-7,3,8,'#587068');rect(px+3,y-4,4,2,'#9b9a7b')}}
}
function lamp(x,y,t){
 rect(x-3,y-166,6,166,'#182035');rect(x-6,y-168,12,5,'#7b6376');
 poly([[x-15,y-169],[x-8,y-188],[x+8,y-188],[x+15,y-169]],'#182035');
 panel(x-10,y-165,20,28,'#edc487');rect(x-6,y-162,12,21,'#fae6bd');rect(x-2,y-165,3,28,'#61495a');
 g.globalAlpha=.055+.015*Math.sin(t*1.9);pixelDisc(x,y-151,37,C.cream);g.globalAlpha=1;
}
function rope(x1,y1,x2,y2,taut,t){
 const sag=(1-taut)*34;const points=[];for(let i=0;i<=24;i++){const p=i/24;points.push([mix(x1,x2,p),mix(y1,y2,p)+Math.sin(p*Math.PI)*sag+(taut>.8?Math.sin(p*18-t*15)*Math.max(0,1-(t-4.55))*2:0)])}
 line(points,C.ink,5);line(points,'#c98296',2);
}
function splash(x,y,at,t,strength=1){const d=t-at;if(d<0||d>1.15)return;const p=d/1.15;g.globalAlpha=1-p;
 for(let i=0;i<5;i++){const a=(i-2)*.46,dist=d*22*strength;rect(x+Math.sin(a)*dist*2,y-Math.cos(a)*Math.sin(p*Math.PI)*13*strength,3,3,'#a6bec7')}
 line([[x-8-p*30,y+2+p*6],[x-12-p*31,y+5+p*6],[x+12+p*31,y+5+p*6],[x+18+p*30,y+1+p*6]],'#7593a5',2);g.globalAlpha=1;
}
function wake(x,y,t,dir=1){for(let i=0;i<3;i++){const a=fract(t*.7+i/3);g.globalAlpha=(1-a)*.6;line([[x-dir*(30+a*70),y+3+i*5],[x-dir*(60+a*70),y+6+i*5]],'#92a2b2',2)}g.globalAlpha=1}
function coin(x,y,s=1,question=true,turn=1){g.save();g.translate(r(x),r(y));g.scale(Math.max(.08,Math.abs(turn)),1);pixelDisc(0,0,14*s,C.ink);pixelDisc(0,-1*s,12*s,question?'#827394':C.gold);pixelDisc(-1*s,-2*s,9*s,question?'#b49bab':C.cream);text(question?'?':'♥',0,-1*s,18*s,question?'#423955':'#bc7b65');g.restore()}
function weight(x,y,s=1,angle=0){g.save();g.translate(r(x),r(y));g.rotate(angle);panel(-10*s,-12*s,20*s,24*s,'#635373');text('?',0,0,23*s,C.pink);g.restore()}

function riverScene(t){
 let z=1.32,cx=629,cy=268;
 if(t>=3.92&&t<8.22){const p=ease((t-4.25)/1.5);z=mix(1.32,1,p);cx=mix(629,480,p);cy=mix(268,270,p)}
 if(t>=8.22&&t<11.48){z=1.62;cx=772;cy=260}
 if(t>=11.48){z=1.53;cx=480;cy=278}
 g.save();camera(cx,cy,z);sky(t);water(t);
 dock(-80,342,287,true);dock(755,331,330);lamp(919,331,t);
 // Book poses share an exact feet anchor; no floating legs or independent arm rotation.
 const girlFrame=t<8.22?8: t<9.32?8:t<10.2?9:10;
 shadowOval(839,333,34,4);person(girlFrame,839,331,.46);
 // A page turn produces its own little paper highlight and a falling leaf beside the pier.
 if(t>=9.32&&t<9.8){const p=(t-9.32)/.48;line([[810,278],[799+10*p,269-8*Math.sin(p*Math.PI)],[810,275]],C.cream,2)}
 if(t>=8.22){const d=t-8.22;poly([[782+d*5,254+d*10],[790+d*5,255+d*10],[786+d*5,261+d*10]],C.gold)}
 let bx,by=374,frame=0;
 if(t<3.92){
  const k=Math.floor(t/.96),p=fract(t/.96);bx=450+Math.min(4,k)*37+ease((p-.18)/.64)*37;
  frame=[0,1,2,3][Math.min(3,Math.floor(p*4))];by+=Math.sin(p*Math.PI*2)*1.5;
 }else{bx=mix(601,476,ease((t-4.72)/2.6));frame=t<4.5?3:4;by+=Math.sin((t-4)*3)*1.6*Math.exp(-Math.max(0,t-4)*.4)}
 if(t>=11.48){
  bx=476;const d=t-11.48,cycle=d<2.15?d%0.83:2.15;
  frame=d>2.25?5:cycle<.23?5:cycle<.51?6:cycle<.68?7:5;
  const impacts=[12.18,13.01,13.84];let sink=0;for(const at of impacts)if(t>at)sink+=5+5*Math.exp(-(t-at)*4)*Math.sin((t-at)*18);by=374+sink;
 }
 let si=0;if(t>4.65){si=t<5.05?1:t<5.46?2:3}
 shadowOval(142,343,45,4);person(si,142,342,.46);
 const grips=[[292,234,180],[628,261,553],[961,251,918],[1322,256,1283]];
 const a=grips[si],gx=142+(a[0]-a[2])*.46,gy=342+(a[1]-364)*.46;
 const taut=ease((t-4.3)/.35);
 rope(gx,gy,bx-101,by-63,taut,t);
 // Small knot remains attached to the stern through all character pose changes.
 pixelDisc(bx-101,by-63,4,'#ce8b9a');
 shadowOval(bx,by+6,104,5);
 if(t<3.92){wake(bx-65,by+2,t);const paddle=[[110,-1],[85,12],[83,13],[88,-27]][frame];for(let k=0;k<5;k++)splash(bx+paddle[0],by+7,k*.96+.27,t,.8)}
 else if(t>4.8&&t<7.4)wake(bx+75,by+1,t,-1);
 boat(frame,bx,by);
 // Water covers the immersed oar tip, while the torso and gunwale stay intact.
 if(t<3.92&&[1,2].includes(frame)){rect(bx+64,by+7,36,11,'#2b4765');line([[bx+62,by+7],[bx+103,by+7]],'#91acb8',2)}
 if(t>=11.48){
  for(let k=0;k<3;k++){
   const at=11.96+k*.83,d=t-at;
   if(d>=0&&d<.24){const p=d/.24;weight(bx+51,by-37+p*p*29,.68,p*.25)}
   splash(bx+52,by+1,12.18+k*.83,t,.65);
  }
  // The newly raised water line is the consequence of the weights, not a global bobbing loop.
  if(t>12.18){const rise=(by-374);rect(bx-91,by-2,181,Math.max(2,rise*.3),'#2a4663');line([[bx-97,by-2],[bx-56,by-2],[bx-44,by],[bx+92,by]],'#89a3af',2)}
 }
 // Transient scene words complement, rather than replace, the readable lyric line.
 if(t>.98&&t<3.2){const a=ease((t-.98)/.3)*(1-ease((t-2.8)/.4));g.globalAlpha=a;const d=mix(28,8,ease((t-1.1)/1.6));text('靠',bx+32-d,171,23,C.pink);text('近',bx+32+d,171,23,C.cream);g.globalAlpha=1}
 if(t>5.13&&t<7.4){g.globalAlpha=1-ease((t-7)/.4);const shift=ease((t-5.13)/1.6)*47;text('退后',536-shift,185,29,C.pink);for(let i=0;i<3;i++)poly([[548+i*12-shift,182],[555+i*12-shift,177],[555+i*12-shift,187]],'#bb7d96');g.globalAlpha=1}
 g.restore();
}

function arcadeStreet(t){
 sky(t,true);rect(-700,272,2360,300,'#2b2a42');rect(-700,411,2360,6,'#665063');
 for(let y=432;y<560;y+=27){rect(-700,y,2360,2,'#40384d');for(let i=0;i<23;i++)rect(i*66+(y%2)*30,y,2,24,'#40384d')}
 // A lived-in little arcade: shop awning, tiled wall and side street, no borrowed footage.
 panel(50,158,242,204,'#302a46');rect(42,153,264,18,'#866176');
 for(let i=0;i<8;i++){rect(43+i*33,171,33,25,i%2?'#b88585':'#e4b098');poly([[43+i*33,196],[76+i*33,196],[70+i*33,202],[49+i*33,202]],i%2?'#b88585':'#e4b098')}
 panel(74,215,78,123,'#45516a');rect(82,222,62,63,'#8b7386');rect(110,215,4,123,'#24243d');rect(76,284,76,4,'#24243d');
 panel(175,214,91,124,'#3e3c59');text('营业中',220,239,15,'#c79999');rect(185,260,71,3,'#75617a');
 for(let i=0;i<6;i++){rect(185+i*11,279,7,35,i%2?'#6d7188':'#9d8088')}
 panel(96,108,148,33,'#41324d');text('心事游乐场',170,126,17,C.pink);
 // A parked bike and plant imply a real street outside the fantasy cabinet.
 for(const x of[62,130]){pixelDisc(x,403,22,'#141c32');pixelDisc(x,403,17,'#514356');pixelDisc(x,403,14,'#2b2a42')}
 line([[62,403],[89,366],[108,403],[62,403],[110,370],[130,403]],'#927183',3);line([[88,366],[81,361],[98,361]],'#c29b9e',3);
 rect(889,383,31,32,'#796073');for(let i=0;i<8;i++)poly([[903,386],[881+hash(i)*44,345+hash(i+1)*29],[906,376]],i%2?'#6c8a81':'#4c706d');
}
function claw(x,y,closed=0){
 line([[x,135],[x,y]],'#c4b4c3',3);rect(x-13,130,26,9,'#c4b4c3');rect(x-8,y-9,16,15,C.ink);rect(x-6,y-9,12,12,'#d6c6c6');
 const spread=mix(27,16,closed);line([[x-5,y+4],[x-spread,y+18],[x-spread+mix(-1,9,closed),y+33]],'#11182d',7);line([[x+5,y+4],[x+spread,y+18],[x+spread-mix(-1,9,closed),y+33]],'#11182d',7);
 line([[x-5,y+4],[x-spread,y+18],[x-spread+mix(-1,9,closed),y+33]],'#c4b9c3',3);line([[x+5,y+4],[x+spread,y+18],[x+spread-mix(-1,9,closed),y+33]],'#c4b9c3',3);
}
function toy(x,y,s=.23){person(4,x,y,s);text('我',x+2,y-18,10,C.cream)}
function coinPile(t){
 const n=Math.floor(clamp((t-19.55)/2.7)*36),settle=ease((t-23.22)/1.6);for(let i=0;i<n;i++){
  let row=0,col=i;while(col>=8-row){col-=8-row;row++;}
  const x=170+col*mix(18,23,settle)+row*9-settle*40,y=415-row*mix(12,5,settle);
  coin(x,y,.58,true,1);
 }
 if(t>=19.55&&t<22.4)for(let j=0;j<5;j++){
  const p=fract((t-19.55)*2.5+j*.21),x=290-40*p+Math.sin(j*9)*25;
  coin(x,309+108*p*p,.62,true,Math.cos(p*7));
 }
}
function machineScene(t,zOverride=null){
 g.save();
 if(zOverride){camera(zOverride.cx,zOverride.cy,zOverride.z)}
 else if(t>23.22&&t<27.62){const z=mix(1,1.17,ease((t-23.22)/1.5));camera(mix(480,541,ease((t-23.22)/1.5)),mix(270,255,ease((t-23.22)/1.5)),z)}
 else if(t>=27.62){camera(480,270,1)}
 arcadeStreet(t);
 shadowOval(582,431,272,9);
 // Cabinet shell; all mechanics use shared world coordinates.
 panel(338,88,489,335,'#8c6179');rect(342,90,11,328,'#bd8998');rect(811,90,12,328,'#62475f');
 panel(355,103,452,239,'#172b40');rect(360,108,442,232,'#254357');
 // Gentle alternating light bars, with a row of deliberately discrete pixels.
 panel(350,62,468,39,'#543e5e');text('如果是我',583,81,23,C.cream);
 for(let i=0;i<24;i++){rect(355+i*19,64,4,4,(i+Math.floor(t*3))%5===0?C.cream:'#aa758e');rect(355+i*19,93,4,4,(i+Math.floor(t*3))%5===0?C.cream:'#aa758e')}
 rect(367,132,424,6,'#8c8098');rect(368,138,421,3,'#142238');
 rect(361,307,440,31,'#364355');for(let i=0;i<12;i++)rect(368+i*36,327,22,3,'#59616a');
 // Bench and open seat. The girl's cardboard support is visibly folded and outlined.
 rect(569,289,193,10,'#ddbd8f');rect(569,299,193,5,'#997b7b');rect(581,303,6,29,'#786272');rect(744,303,6,29,'#786272');
 rect(570,252,191,8,'#b89d86');rect(580,259,5,29,'#a4877c');rect(750,259,5,29,'#a4877c');
 poly([[710,228],[758,310],[737,310]],'#b89b85');line([[710,228],[758,310],[737,310]],'#dbc6a3',2);
 person(11,707,304,.30);line([[693,216],[700,221],[706,217]],'#f8deba',2);
 g.globalAlpha=.10+.03*Math.sin(t*3);poly([[617,158],[572,299],[661,299]],C.cream);g.globalAlpha=1;
 line([[590,290],[643,290]],C.cream,3);
 // Other toys remain small and do not compete with the single chosen boy.
 heart(493,310,8,'#a5798e');pixelDisc(538,309,16,'#96a3a3');rect(530,305,3,3,C.ink);rect(541,305,3,3,C.ink);
 let clx=424,cly=174,closed=0,tx=424,ty=324,ts=.23,drawToy=true;
 if(t>=23.22){
  const u=t-23.22;
  cly=mix(174,232,ease((u-.45)/1.05));closed=ease((u-1.5)/.30);
  if(u>1.8){cly=mix(232,168,ease((u-1.8)/.85));ty=cly+92;}
  if(u>2.65){clx=mix(424,612,ease((u-2.65)/1.55));tx=clx;}
  if(u>1.8)tx=clx;
 }
 if(t>=27.62){
  const d=t-27.62;closed=1-ease((d-.22)/.2);clx=612;cly=168;
  if(d<.35){tx=612;ty=260}
  else if(d<.95){const p=(d-.35)/.6;tx=612;ty=260+87*p*p}
  else if(d<1.5){const p=(d-.95)/.55;tx=mix(612,338,ease(p));ty=381;ts=.09}
  else if(d<2.1){const p=(d-1.5)/.6;tx=mix(338,274,p);ty=mix(374,357,p)-32*Math.sin(p*Math.PI);ts=.18}
  else{tx=274;ty=357;ts=.18}
  if(d>.95)drawToy=false;
 }
 // Calling rings pass over the toy at the sung word; they do not run all the time.
 if(t>=23.22&&t<25){
  const p=clamp((t-23.22)/1.5),x=mix(704,424,p);g.globalAlpha=(1-p)*.6+.15;pixelDisc(x,242,18+p*24,C.gold);pixelDisc(x,242,14+p*24,'#254357');g.globalAlpha=1;
  if(t>24.2){star(401,239,4,C.cream);star(445,241,3,C.pink)}
 }
 if(drawToy)toy(tx,ty,ts);
 claw(clx,cly,closed);
 // Glass highlights, narrow enough to keep faces legible.
 g.globalAlpha=.06;poly([[770,110],[788,110],[728,336],[710,336]],'#f8e5ca');poly([[383,110],[390,110],[367,190],[363,190]],'#f8e5ca');g.globalAlpha=1;
 rect(355,103,5,239,'#d2a2ab');rect(803,103,4,239,'#d2a2ab');rect(355,339,452,6,'#b68a97');
 // Prize return is a visible diagonal tube under the bench, then a front opening.
 panel(355,349,302,37,'#302f49');line([[614,349],[600,366],[369,366]],'#b98eaa',10);line([[614,349],[600,366],[369,366]],'#604f6c',6);
 if(t>28.57&&t<29.12){g.save();g.beginPath();g.rect(354,347,304,41);g.clip();toy(tx,ty,.09);g.restore()}
 panel(324,361,48,36,'#171f36');rect(323,359,50,4,'#dba3ae');
 const greed=ease((t-19.7)/2.5)*(1-ease((t-23.22)/.8));let joyX=mix(279,323,greed),joyY=mix(341,313,greed);
 // The control recedes as self-made questions pile up: a small visible telescoping shelf.
 poly([[joyX-15,joyY+8],[344,joyY+8],[352,joyY+20],[joyX-15,joyY+20]],'#bf8799');line([[joyX+9,joyY+21],[337,351]],'#69516b',5);
 rect(joyX-2,joyY-8,4,15,'#e7c9b6');pixelDisc(joyX,joyY-12,6,C.pink);
 panel(718,356,69,43,'#3c304c');text('空位',752,370,13,C.cream);text('01',752,389,16,'#e8a8b4');
 panel(395,392,46,16,'#463951');rect(406,396,24,4,'#d8b5aa');
 panel(780,407,31,8,'#38283f');rect(365,423,19,9,'#111a2b');rect(784,423,19,9,'#111a2b');
 // The real boy stands outside. Whole poses keep shoes and fingers coherent.
 let pose=t<19.22?4:t<20.1?6:t<23.22?5:t<27.62?4:7;
 shadowOval(229,420,39,5);person(pose,230,418,.56);
 coinPile(t);
 // Wrist shadow reaches a lever; it stays attached to the hand instead of floating.
 const d=t-27.62;
 if(d>=0){const p=ease(d/.35),hx=274,hy=357;line([[hx,hy],[hx+18*p,hy-17*p],[hx+40*p,hy-8*p],[mix(hx,329,p),mix(hy,347+ease((d-.2)/.3)*14,p)]],'#151b32',10);line([[hx,hy-1],[hx+18*p,hy-18*p],[hx+40*p,hy-9*p],[mix(hx,329,p),mix(hy,346+ease((d-.2)/.3)*14,p)]],'#42304c',3)}
 rect(328,340,4,19,'#d1a6b1');pixelDisc(330,344+(d>0?ease((d-.2)/.3)*16:0),6,d>0?'#f4b68d':'#e890a9');
 if(d>=0&&d<1.3){g.globalAlpha=1-ease((d-.9)/.4);text('退币',330,321,15,C.pink);g.globalAlpha=1}
 if(t>=29.12)toy(tx,ty,ts);
 if(t>29.2){star(615,279,3,C.cream);g.globalAlpha=.2;line([[589,285],[643,285]],C.cream,3);g.globalAlpha=1}
 g.restore();
}

function transition(t){
 if(t<15){riverScene(14.17);const p=ease((t-14.18)/.82);coin(480,mix(250,270,p),mix(2,57,p),true,1)}
 else{
  const p=ease((t-15)/1.36);const cx=mix(418,480,p),cy=mix(399,270,p),z=mix(1.9,1,p);
  machineScene(t,{cx,cy,z});
  g.save();camera(cx,cy,z);coin(418,399,mix(32,.3,p),true,1);g.restore();
 }
}
function captions(t){
 const abs=t+46.5,cue=window.MV_LYRIC_MOTION.find(c=>c.start<=abs&&abs<c.end);
 if(!cue)return;
 const len=cue.chars.length,step=len>9?37:40,left=480-(len-1)*step/2;
 // Pixel-edged plaque leaves hands, water line and prize slot clear.
 const wid=Math.max(250,len*step+56);g.globalAlpha=.90;rect(480-wid/2,468,wid,52,'#342b43');rect(480-wid/2+5,464,wid-10,4,'#342b43');rect(480-wid/2+5,520,wid-10,4,'#342b43');g.globalAlpha=1;
 rect(480-wid/2+12,467,wid-24,2,'#886478');
 let current=-1;cue.chars.forEach((a,i)=>{if(abs>=a[1])current=i});
 cue.chars.forEach(([ch,at],i)=>{
  const dt=abs-at,b=dt>=0&&dt<.32?Math.sin(Math.PI*dt/.32)*Math.exp(-dt*1.7):0;
  const x=left+i*step,y=496-b*10;
  g.save();g.translate(r(x),r(y));g.scale(1+b*.09,1+b*.09);g.font='900 32px MVChinese';g.textAlign='center';g.textBaseline='middle';
  g.lineJoin='miter';g.strokeStyle='#1c1b30';g.lineWidth=7;g.strokeText(ch,1,3);g.strokeStyle='#b37891';g.lineWidth=3;g.strokeText(ch,0,0);g.fillStyle=i===current?'#fff0be':dt>=0?'#f5dfc1':'#b9a7b4';g.fillText(ch,0,0);g.restore();
 });
 const progress=clamp((abs-cue.start)/(cue.end-cue.start));rect(480-wid/2+13,518,(wid-26)*progress,2,'#e7a1b1');
}
let assetsReady=false;
function paint(t){
 if(!assetsReady)return;
 g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.clearRect(0,0,960,540);
 if(t<14.18)riverScene(t);else if(t<16.36)transition(t);else machineScene(t);
 captions(t);
 if(t>30.18){g.globalAlpha=ease((t-30.18)/.42);rect(0,0,960,540,C.ink);g.globalAlpha=1}
 out.imageSmoothingEnabled=false;out.clearRect(0,0,1920,1080);out.drawImage(stage,0,0,1920,1080);
}
window.renderClock={t:0};
const timeline=gsap.timeline({paused:true});
timeline.to(renderClock,{t:30.6,duration:30.6,ease:'none',lazy:false,onUpdate:()=>paint(renderClock.t)},0);
window.__timelines=window.__timelines||{};window.__timelines['night-unsent']=timeline;
Promise.all([document.fonts.load('900 32px MVChinese'),...Object.values(sprites).map(im=>im.decode())]).then(()=>{assetsReady=true;paint(renderClock.t)});
