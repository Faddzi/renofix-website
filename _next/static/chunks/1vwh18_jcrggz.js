(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,47071,e=>{"use strict";var t=e.i(71645),r=e.i(90072),o=e.i(38408),a=e.i(30353),a=a;let n=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function i(e,i){let l=(0,o.f)(e=>e.gl),s=(0,a.H)(r.H5,n(e)?Object.values(e):e);return(0,t.useLayoutEffect)(()=>{null==i||i(s)},[i]),(0,t.useEffect)(()=>{if("initTexture"in l){let e=[];Array.isArray(s)?e=s:s instanceof r.Sk?e=[s]:n(s)&&(e=Object.values(s)),e.forEach(e=>{e instanceof r.Sk&&l.initTexture(e)})}},[l,s]),(0,t.useMemo)(()=>{if(!n(e))return s;{let t={},r=0;for(let o in e)t[o]=s[r++];return t}},[e,s])}i.preload=e=>a.H.preload(r.H5,e),i.clear=e=>a.H.clear(r.H5,e),e.s(["f",0,i],47071)},76457,e=>{"use strict";var t=e.i(43476),r=e.i(75056),o=e.i(98903),a=e.i(38408),n=e.i(47071),i=e.i(71645),l=e.i(90072);let s=new l.Es("#0b1426"),u=new l.Es("#243457"),c=new l.Es("#e58a58"),f=new l.Es("#3a3756"),d=f.clone().convertLinearToSRGB(),h=1.612,m=new l.cE(-2,5,-18);function v(e){let t=e>>>0;return()=>{let e=t=t+0x6d2b79f5>>>0;return e=Math.imul(e^e>>>15,1|e),(((e^=e+Math.imul(e^e>>>7,61|e))^e>>>14)>>>0)/0x100000000}}let p=(e,t,r)=>{let o=Math.min(1,Math.max(0,(r-e)/(t-e)));return o*o*(3-2*o)},g=`
  attribute float aSeed;
  attribute float aLit;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vDepth;
  varying float vSeed;
  varying float vLit;
  void main() {
    mat4 m = modelMatrix;
    #ifdef USE_INSTANCING
      m = m * instanceMatrix;
    #endif
    vec4 wp = m * vec4(position, 1.0);
    vWorld = wp.xyz;
    vN = normalize(mat3(m) * normal);
    vSeed = aSeed;
    vLit = aLit;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`,x=`
  uniform vec3 uFog;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec3 uBase;
  varying vec3 vWorld;
  varying vec3 vN;
  varying float vDepth;
  varying float vSeed;
  varying float vLit;

  // stable per-window random number (inputs are whole numbers, kept small for precision)
  float hash(vec2 p) {
    p = mod(p, 512.0);
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 n = normalize(vN);
    // facade lit from the dusk sky behind the city, darker towards the street
    float sky = 0.55 + 0.45 * clamp(vWorld.y / 22.0, 0.0, 1.0);
    float side = abs(n.x) > 0.5 ? 0.78 : 1.0;
    vec3 col = uBase * sky * side;

    if (abs(n.y) > 0.5) {
      col = uBase * 0.7;
    } else {
      float u = abs(n.x) > 0.5 ? vWorld.z : vWorld.x;
      vec2 g = vec2(u / 0.32, vWorld.y / 0.36);
      vec2 cell = floor(g);
      vec2 f = fract(g);
      float win = step(0.16, f.x) * step(f.x, 0.84) * step(0.22, f.y) * step(f.y, 0.82);
      float seed = floor(vSeed + 0.5);
      float face = floor(n.x + 0.5) * 3.0 + floor(n.z + 0.5) * 7.0;
      cell += vec2(seed * 13.0 + face, seed * 5.0);
      float h = hash(cell);
      float lit = step(1.0 - vLit, h);
      float tone = hash(cell + 9.1);
      vec3 warm = mix(vec3(0.98, 0.58, 0.28), vec3(1.0, 0.8, 0.58), tone) * (0.62 + 0.33 * hash(cell + 2.7));
      vec3 dark = vec3(0.07, 0.09, 0.14) + 0.06 * tone;
      // a few cool-white offices and TV-blue rooms
      if (tone > 0.94) warm = vec3(0.62, 0.72, 0.86);
      vec3 glass = mix(dark, warm, lit);
      // far away, windows are smaller than a pixel: show their average glow instead of noise
      vec2 fw = fwidth(g);
      float far = smoothstep(0.25, 0.7, max(fw.x, fw.y));
      vec3 near = mix(col, glass, win);
      vec3 avg = mix(col, mix(dark, vec3(1.0, 0.7, 0.45), vLit * 0.9), 0.42);
      col = mix(near, avg, far);
      // ground floor shops
      if (vWorld.y < 0.36) col = mix(col, vec3(1.0, 0.75, 0.45), win * 0.6);
    }

    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    col = mix(col, uFog, fog);
    gl_FragColor = vec4(col, 1.0);
  }
`;function w({towers:e,look:r}){let o=(0,i.useRef)(null),{invalidate:n}=(0,a.f)(),s=(0,i.useMemo)(()=>{let t=new l.kG(1,1,1);t.translate(0,.5,0);let r=new Float32Array(e.length),o=new Float32Array(e.length),a=v(7*e.length+3);for(let t=0;t<e.length;t++)r[t]=Math.floor(400*a()),o[t]=.25+.45*a();return t.setAttribute("aSeed",new l.VZ(r,1)),t.setAttribute("aLit",new l.VZ(o,1)),t},[e]),u=(0,i.useMemo)(()=>new l.Zg({vertexShader:g,fragmentShader:x,uniforms:{uFog:{value:d},uFogNear:{value:30},uFogFar:{value:"grid"===r?120:105},uBase:{value:new l.Es("#2b3247")}}}),[r]);return(0,i.useEffect)(()=>{let t=o.current;if(!t)return;let r=new l.t;e.forEach((e,o)=>{r.position.set(e.x,0,e.z),r.scale.set(e.w,e.h,e.d),r.updateMatrix(),t.setMatrixAt(o,r.matrix)}),t.instanceMatrix.needsUpdate=!0,t.computeBoundingSphere(),n()},[e,n]),(0,t.jsx)("instancedMesh",{ref:o,args:[s,u,e.length],frustumCulled:!1})}function y({photo:e}){let r=(0,i.useMemo)(()=>{let e=new l.kG(3.2,17,3.2);return e.translate(0,8.5,0),e.setAttribute("aSeed",new l.ki(Array(24).fill(42),1)),e.setAttribute("aLit",new l.ki(Array(24).fill(.38),1)),e},[]),o=(0,i.useMemo)(()=>new l.Zg({vertexShader:g,fragmentShader:x,uniforms:{uFog:{value:d},uFogNear:{value:30},uFogFar:{value:110},uBase:{value:new l.Es("#363d52")}}}),[]),a=(0,n.f)(e,e=>{e.colorSpace=l.nj,e.anisotropy=8}),s=(0,i.useMemo)(()=>{let e=a.clone(),t=e.image,r=t?t.width/t.height:16/9,o=1.24/.66;return r>1.24/.66?(e.repeat.set(o/r,1),e.offset.set((1-o/r)/2,0)):(e.repeat.set(1,r/o),e.offset.set(0,(1-r/o)/2)),e.needsUpdate=!0,e},[a]);return(0,t.jsxs)("group",{children:[(0,t.jsx)("mesh",{geometry:r,material:o}),(0,t.jsxs)("mesh",{position:[0,9.2,h],children:[(0,t.jsx)("planeGeometry",{args:[1.34,.76]}),(0,t.jsx)("meshBasicMaterial",{color:"#14161c",toneMapped:!1})]}),(0,t.jsxs)("mesh",{position:[0,9.2,h+.002],children:[(0,t.jsx)("planeGeometry",{args:[1.24,.66]}),(0,t.jsx)("meshBasicMaterial",{map:s,toneMapped:!1})]}),(0,t.jsxs)("mesh",{position:[0,9.2,h+.004],children:[(0,t.jsx)("planeGeometry",{args:[4.96,5.5*.66]}),(0,t.jsx)("meshBasicMaterial",{map:j(),color:"#ffb070",transparent:!0,blending:l.tq,depthWrite:!1,toneMapped:!1})]}),(0,t.jsxs)("mesh",{position:[-1.61,8.5,h+.01],children:[(0,t.jsx)("boxGeometry",{args:[.06,17,.06]}),(0,t.jsx)("meshBasicMaterial",{color:"#e0582a",toneMapped:!1})]})]})}let M=null;function j(){if(M)return M;let e=document.createElement("canvas");e.width=e.height=64;let t=e.getContext("2d"),r=t.createRadialGradient(32,32,0,32,32,32);return r.addColorStop(0,"rgba(255,255,255,0.55)"),r.addColorStop(.35,"rgba(255,255,255,0.18)"),r.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=r,t.fillRect(0,0,64,64),M=new l.Nk(e)}function b({positions:e,size:r,color:o}){let a=(0,i.useMemo)(()=>{let t=new l.ld;return t.setAttribute("position",new l.f5(e,3)),t},[e]);return e.length?(0,t.jsx)("points",{geometry:a,frustumCulled:!1,children:(0,t.jsx)("pointsMaterial",{map:j(),color:o,size:r,sizeAttenuation:!0,transparent:!0,depthWrite:!1,blending:l.tq,toneMapped:!1,fog:!1})}):null}function E(){let e=(0,i.useMemo)(()=>new l.Zg({side:l.tw,depthWrite:!1,uniforms:{uTop:{value:s},uMid:{value:u},uLow:{value:c},uFog:{value:d}},vertexShader:`
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,fragmentShader:`
          uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uFog;
          varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 c = mix(uMid, uTop, smoothstep(0.1, 0.55, y));
            // warm glow above the horizon, strongest towards the west (-x)
            float west = 0.5 + 0.5 * clamp(-vDir.x, 0.0, 1.0);
            c = mix(c, uLow, (1.0 - smoothstep(0.0, 0.2, y)) * 0.85 * west);
            // fade into the fogged ground at the horizon, so there is no seam
            c = mix(uFog, c, smoothstep(-0.01, 0.07, y));
            gl_FragColor = vec4(c, 1.0);
          }
        `}),[]);return(0,t.jsx)("mesh",{material:e,renderOrder:-1,children:(0,t.jsx)("sphereGeometry",{args:[2500,48,24]})})}function S({look:e}){let r=(0,i.useMemo)(()=>{if("sea"===e){let e=new l.Ow;e.moveTo(-400,-400);for(let t=-400;t<=400;t+=4){let r=120>Math.abs(t)?-16.8+4*Math.sin(.12*t):-16.8;e.lineTo(r,t)}return e.lineTo(-400,400),e}if("hills"===e){let e=new l.Ow;return e.moveTo(19,-22),e.bezierCurveTo(40,-18,46,-40,38,-52),e.bezierCurveTo(28,-58,17,-48,19,-22),e}let t=new l.Ow;return t.moveTo(-400,-66),t.bezierCurveTo(-40,-58,30,-70,400,-60),t.lineTo(400,-400),t.lineTo(-400,-400),t},[e]),o=(0,i.useMemo)(()=>new l.pY(r,64),[r]);return(0,t.jsxs)("group",{children:[(0,t.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],children:[(0,t.jsx)("planeGeometry",{args:[6e3,6e3]}),(0,t.jsx)("meshBasicMaterial",{color:"#141826"})]}),(0,t.jsx)("mesh",{rotation:[Math.PI/2,0,0],position:[0,.02,0],geometry:o,children:(0,t.jsx)("meshBasicMaterial",{color:"#1d2a45",side:l.Vs})})]})}function F(){let e=(0,i.useMemo)(()=>{let e=[],t=[],r=v(11);for(let t=0;t<=60;t++){let o=-160+t/60*320,a=10+5*Math.sin(.37*t)+7*Math.sin(.11*t+1)+3*r();e.push(o,0,-110,o,a,-118-6*r())}for(let e=0;e<60;e++){let r=2*e;t.push(r,r+2,r+1,r+1,r+2,r+3)}let o=new l.ld;return o.setAttribute("position",new l.ki(e,3)),o.setIndex(t),o},[]);return(0,t.jsx)("mesh",{geometry:e,children:(0,t.jsx)("meshBasicMaterial",{color:"#1f2742",side:l.Vs,fog:!0})})}function k({progress:e,pointer:t}){let{invalidate:r,size:n}=(0,a.f)(),s=(0,i.useRef)({x:0,y:0,p:0}),u=(0,i.useMemo)(()=>{var e;let t,r,o,a,i;return e=n.width/Math.max(1,n.height),t=Math.tan(l.rB.degToRad(21)),o=(r=e>=1.15)?1.65:Math.max(1.6,1.24/.9/(2*t*e)),a=2*t*o,i=r?{x:a*e*.22,y:.05*a}:{x:0,y:.22*a},{path:new l.$7([new l.cE(-34,27,46),new l.cE(-17,20,30),new l.cE(-5,13.5,15),new l.cE(-.6-i.x,10,6+o),new l.cE(-i.x,9.2-i.y+.05,h+o+1.6),new l.cE(-i.x,9.2-i.y,h+o)],!1,"centripetal"),lookTo:new l.cE(0-i.x,9.2-i.y,h)}},[n.width,n.height]),c=(0,i.useRef)({pos:new l.cE,look:new l.cE});return(0,o.f)(({camera:o})=>{let a,{pos:n,look:i}=c.current,l=s.current;l.x+=(t.current.x-l.x)*.08,l.y+=(t.current.y-l.y)*.08,l.p+=(e.current-l.p)*.14;let f=(a=Math.min(1,Math.max(0,l.p/.9)))*a*(3-2*a);u.path.getPoint(f,n);let d=1-p(.6,.95,f);n.x+=2.2*l.x*d,n.y-=1.2*l.y*d,o.position.copy(n),i.copy(m).lerp(u.lookTo,p(0,.75,f)),o.lookAt(i),(Math.abs(t.current.x-l.x)>.001||Math.abs(t.current.y-l.y)>.001||Math.abs(e.current-l.p)>5e-4)&&r()}),null}function T({onReady:e}){return(0,i.useEffect)(()=>{e?.()},[e]),null}function A({look:e,seed:r,photo:o,onReady:a}){let n=(0,i.useMemo)(()=>(function(e,t){let r=v(t),o=[],a=[],n="grid"===e?4.2:3.3,i="grid"===e?13:15,l="grid"===e?15:20;for(let t=-i;t<=i;t++)for(let a=-l;a<=3;a++){let i="grid"===e?.15:.9,s=t*n+(r()-.5)*i,u=a*n+(r()-.5)*i;if(5.5>Math.abs(s-0)&&u>-4||4>Math.hypot(s-0,u-0))continue;let c=(s+.75*u)/1.25;if(u>-2&&c<4&&s<2&&s>-40&&9>Math.abs(.6*s-.8*u)&&u>0||"sea"===e&&s<-16+4*Math.sin(.12*u)||"hills"===e&&s>18&&u<-20&&u>-50||"grid"===e&&u<-l*n+8||r()<("grid"===e?.12:.2))continue;let f=Math.hypot(s,u+10),d=.12>r()?2.2:1,h=(2+14*Math.pow(r(),2.2))*d;"hills"===e&&(h*=.85),"grid"===e&&(h=.8*h+1.5),h*=1-Math.min(.4,f/160);let m=n*(.45+.3*r()),v=n*(.45+.3*r());o.push({x:s,z:u,w:m,d:v,h:Math.max(1.2,h)})}for(let t=-i;t<=i;t++)for(let o=-(4*l);o<=12;o++){let i=(t+.5)*n,l=n/4*o;!("sea"===e&&i<-16+4*Math.sin(.12*l))&&(.35>r()||a.push(i,.12,l))}for(let t=-l;t<=3;t++)for(let o=-(4*i);o<=4*i;o++){let i=n/4*o,l=(t+.5)*n;!("sea"===e&&i<-16+4*Math.sin(.12*l))&&(.45>r()||a.push(i,.12,l))}let s=[];if("sea"===e)for(let e=-80;e<=20;e+=.55)s.push(-16.6+4*Math.sin(.12*e),.16,e);return{towers:o,lights:new Float32Array(a),promenade:new Float32Array(s)}})(e,r),[e,r]);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(E,{}),(0,t.jsx)(S,{look:e}),"hills"===e&&(0,t.jsx)(F,{}),(0,t.jsx)(w,{towers:n.towers,look:e}),(0,t.jsx)(b,{positions:n.lights,size:.55,color:"#ffb46a"}),(0,t.jsx)(b,{positions:n.promenade,size:.9,color:"#ffd9a0"}),(0,t.jsx)(y,{photo:o}),(0,t.jsx)(T,{onReady:a})]})}e.s(["default",0,function({look:e,seed:o,photo:a,progress:n,onReady:s,onLost:u}){let c=(0,i.useRef)({x:0,y:0}),d=(0,i.useRef)(null);return(0,i.useEffect)(()=>{let e=d.current?.parentElement;if(!e)return;let t=t=>{let r=e.getBoundingClientRect();c.current.x=(t.clientX-r.left)/r.width*2-1,c.current.y=(t.clientY-r.top)/r.height*2-1,window.dispatchEvent(new Event("renofix-area-redraw"))};return e.addEventListener("pointermove",t),()=>e.removeEventListener("pointermove",t)},[]),(0,t.jsx)("div",{ref:d,className:"absolute inset-0",children:(0,t.jsxs)(r.f,{frameloop:"demand",dpr:[1,1.5],gl:{antialias:!0},camera:{fov:42,near:.1,far:4e3,position:[-34,27,46]},onCreated:({gl:e,scene:t,invalidate:r})=>{t.fog=new l.n5(f,30,140),e.toneMapping=l.rK;let o=()=>r();window.addEventListener("renofix-area-redraw",o),e.domElement.addEventListener("webglcontextlost",()=>{window.removeEventListener("renofix-area-redraw",o),u?.()},{once:!0})},"aria-hidden":"true",children:[(0,t.jsx)(k,{progress:n,pointer:c}),(0,t.jsx)(i.Suspense,{fallback:null,children:(0,t.jsx)(A,{look:e,seed:o,photo:a,onReady:s})})]})})}])},41459,function(e){e.n(e.i(76457))}]);