(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,47071,e=>{"use strict";var t=e.i(71645),i=e.i(90072),n=e.i(38408),r=e.i(30353),r=r;let s=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function o(e,o){let a=(0,n.f)(e=>e.gl),l=(0,r.H)(i.H5,s(e)?Object.values(e):e);return(0,t.useLayoutEffect)(()=>{null==o||o(l)},[o]),(0,t.useEffect)(()=>{if("initTexture"in a){let e=[];Array.isArray(l)?e=l:l instanceof i.Sk?e=[l]:s(l)&&(e=Object.values(l)),e.forEach(e=>{e instanceof i.Sk&&a.initTexture(e)})}},[a,l]),(0,t.useMemo)(()=>{if(!s(e))return l;{let t={},i=0;for(let n in e)t[n]=l[i++];return t}},[e,l])}o.preload=e=>r.H.preload(i.H5,e),o.clear=e=>r.H.clear(i.H5,e),e.s(["f",0,o],47071)},54075,e=>{"use strict";let t,i;var n=e.i(43476),r=e.i(75056),s=e.i(98903),o=e.i(38408);function a(){return(a=Object.assign.bind()).apply(null,arguments)}var l=e.i(71645),c=e.i(90072),d=c,f=c;let u=new f.VQ,p=new f.cE;class h extends f.Kx{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new f.ki([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new f.ki([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new f.hC(t,6,1);return this.setAttribute("instanceStart",new f.Zq(i,3,0)),this.setAttribute("instanceEnd",new f.Zq(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));let n=new f.hC(i,2*t,1);return this.setAttribute("instanceColorStart",new f.Zq(n,t,0)),this.setAttribute("instanceColorEnd",new f.Zq(n,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new f.nw(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new f.VQ);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),u.setFromBufferAttribute(t),this.boundingBox.union(u))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new f.L0),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let r=0,s=e.count;r<s;r++)p.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(p)),p.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(p));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var m=c,x=e.i(8560);let v=parseInt(c.Tu.replace(/\D+/g,""));class g extends m.Zg{constructor(e){super({type:"LineMaterial",uniforms:m.SP.clone(m.SP.merge([x.O.common,x.O.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new m.wq(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${v>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let y=v>=125?"uv1":"uv2",w=new d.$i,S=new d.cE,j=new d.cE,b=new d.$i,E=new d.$i,z=new d.$i,_=new d.cE,M=new d.nd,L=new d._i,A=new d.cE,U=new d.VQ,O=new d.L0,C=new d.$i;function P(e,t,n){return C.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),C.multiplyScalar(1/C.w),C.x=i/n.width,C.y=i/n.height,C.applyMatrix4(e.projectionMatrixInverse),C.multiplyScalar(1/C.w),Math.abs(Math.max(C.x,C.y))}class B extends d.kE{constructor(e=new h,t=new g({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let e=0,r=0,s=t.count;e<s;e++,r+=2)S.fromBufferAttribute(t,e),j.fromBufferAttribute(i,e),n[r]=0===r?0:n[r-1],n[r+1]=n[r]+S.distanceTo(j);let r=new d.hC(n,2,1);return e.setAttribute("instanceDistanceStart",new d.Zq(r,1,0)),e.setAttribute("instanceDistanceEnd",new d.Zq(r,1,1)),this}raycast(e,n){let r,s,o=this.material.worldUnits,a=e.camera;null!==a||o||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let l=void 0!==e.params.Line2&&e.params.Line2.threshold||0;t=e.ray;let c=this.matrixWorld,f=this.geometry,u=this.material;if(i=u.linewidth+l,null===f.boundingSphere&&f.computeBoundingSphere(),O.copy(f.boundingSphere).applyMatrix4(c),o)r=.5*i;else{let e=Math.max(a.near,O.distanceToPoint(t.origin));r=P(a,e,u.resolution)}if(O.radius+=r,!1!==t.intersectsSphere(O)){if(null===f.boundingBox&&f.computeBoundingBox(),U.copy(f.boundingBox).applyMatrix4(c),o)s=.5*i;else{let e=Math.max(a.near,U.distanceToPoint(t.origin));s=P(a,e,u.resolution)}U.expandByScalar(s),!1!==t.intersectsBox(U)&&(o?function(e,n){let r=e.matrixWorld,s=e.geometry,o=s.attributes.instanceStart,a=s.attributes.instanceEnd,l=Math.min(s.instanceCount,o.count);for(let s=0;s<l;s++){L.start.fromBufferAttribute(o,s),L.end.fromBufferAttribute(a,s),L.applyMatrix4(r);let l=new d.cE,c=new d.cE;t.distanceSqToSegment(L.start,L.end,c,l),c.distanceTo(l)<.5*i&&n.push({point:c,pointOnLine:l,distance:t.origin.distanceTo(c),object:e,face:null,faceIndex:s,uv:null,[y]:null})}}(this,n):function(e,n,r){let s=n.projectionMatrix,o=e.material.resolution,a=e.matrixWorld,l=e.geometry,c=l.attributes.instanceStart,f=l.attributes.instanceEnd,u=Math.min(l.instanceCount,c.count),p=-n.near;t.at(1,z),z.w=1,z.applyMatrix4(n.matrixWorldInverse),z.applyMatrix4(s),z.multiplyScalar(1/z.w),z.x*=o.x/2,z.y*=o.y/2,z.z=0,_.copy(z),M.multiplyMatrices(n.matrixWorldInverse,a);for(let n=0;n<u;n++){if(b.fromBufferAttribute(c,n),E.fromBufferAttribute(f,n),b.w=1,E.w=1,b.applyMatrix4(M),E.applyMatrix4(M),b.z>p&&E.z>p)continue;if(b.z>p){let e=b.z-E.z,t=(b.z-p)/e;b.lerp(E,t)}else if(E.z>p){let e=E.z-b.z,t=(E.z-p)/e;E.lerp(b,t)}b.applyMatrix4(s),E.applyMatrix4(s),b.multiplyScalar(1/b.w),E.multiplyScalar(1/E.w),b.x*=o.x/2,b.y*=o.y/2,E.x*=o.x/2,E.y*=o.y/2,L.start.copy(b),L.start.z=0,L.end.copy(E),L.end.z=0;let l=L.closestPointToPointParameter(_,!0);L.at(l,A);let u=d.rB.lerp(b.z,E.z,l),h=u>=-1&&u<=1,m=_.distanceTo(A)<.5*i;if(h&&m){L.start.fromBufferAttribute(c,n),L.end.fromBufferAttribute(f,n),L.start.applyMatrix4(a),L.end.applyMatrix4(a);let i=new d.cE,s=new d.cE;t.distanceSqToSegment(L.start,L.end,s,i),r.push({point:s,pointOnLine:i,distance:t.origin.distanceTo(s),object:e,face:null,faceIndex:n,uv:null,[y]:null})}}}(this,a,n))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(w),this.material.uniforms.resolution.value.set(w.z,w.w))}}class D extends h{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e,t=3){let i=e.length-t,n=new Float32Array(2*i);if(3===t)for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];else for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5],n[2*r+6]=e[r+6],n[2*r+7]=e[r+7];return super.setColors(n,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class R extends B{constructor(e=new D,t=new g({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let T=l.forwardRef(function({points:e,color:t=0xffffff,vertexColors:i,linewidth:n,lineWidth:r,segments:s,dashed:d,...f},u){var p,m;let x=(0,o.f)(e=>e.size),v=l.useMemo(()=>s?new B:new R,[s]),[y]=l.useState(()=>new g),w=(null==i||null==(p=i[0])?void 0:p.length)===4?4:3,S=l.useMemo(()=>{let n=s?new h:new D,r=e.map(e=>{let t=Array.isArray(e);return e instanceof c.cE||e instanceof c.$i?[e.x,e.y,e.z]:e instanceof c.wq?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(n.setPositions(r.flat()),i){t=0xffffff;let e=i.map(e=>e instanceof c.Es?e.toArray():e);n.setColors(e.flat(),w)}return n},[e,s,i,w]);return l.useLayoutEffect(()=>{v.computeLineDistances()},[e,v]),l.useLayoutEffect(()=>{d?y.defines.USE_DASH="":delete y.defines.USE_DASH,y.needsUpdate=!0},[d,y]),l.useEffect(()=>()=>{S.dispose(),y.dispose()},[S]),l.createElement("primitive",a({object:v,ref:u},f),l.createElement("primitive",{object:S,attach:"geometry"}),l.createElement("primitive",a({object:y,attach:"material",color:t,vertexColors:!!i,resolution:[x.width,x.height],linewidth:null!=(m=null!=n?n:r)?m:1,dashed:d,transparent:4===w},f)))}),H=l.forwardRef(({threshold:e=15,geometry:t,...i},n)=>{let r=l.useRef(null);l.useImperativeHandle(n,()=>r.current,[]);let s=l.useMemo(()=>[0,0,0,1,0,0],[]),o=l.useRef(null),d=l.useRef(null);return l.useLayoutEffect(()=>{let i=r.current.parent,n=null!=t?t:null==i?void 0:i.geometry;if(!n||o.current===n&&d.current===e)return;o.current=n,d.current=e;let s=new c.nC(n,e).attributes.position.array;r.current.geometry.setPositions(s),r.current.geometry.attributes.instanceStart.needsUpdate=!0,r.current.geometry.attributes.instanceEnd.needsUpdate=!0,r.current.computeLineDistances()}),l.createElement(T,a({segments:!0,points:s,ref:r,raycast:()=>null},i))});var I=e.i(47071);let G="#eadcc3",N="#a0703f",W="#c09363",V="#4a2e1f",q="#cfcac1",k="#f7f5f0",F=e=>`/renofix-website/images/hero/${e}`,$={leftBlind:F("left-blind.jpg"),wallpaper:F("back-wallpaper.jpg"),blind:F("window-blind.jpg"),leftPaper:F("left-wallpaper.jpg"),printR:F("print-right.jpg"),rug:F("rug.jpg"),leaf:F("leaf.jpg"),screen:F("screen.jpg")},Z=Object.keys($),K=Z.map(e=>$[e]);function Q({size:e,position:t,color:i,rotation:r,edges:s=!0}){return(0,n.jsxs)("mesh",{position:t,rotation:r,castShadow:!0,receiveShadow:!0,children:[(0,n.jsx)("boxGeometry",{args:e}),(0,n.jsx)("meshStandardMaterial",{color:i,roughness:.85,metalness:0}),s&&(0,n.jsx)(H,{color:"#6f5a45",threshold:15})]})}function X({map:e,size:t,position:i,rotation:r}){return(0,n.jsxs)("mesh",{position:i,rotation:r,children:[(0,n.jsx)("planeGeometry",{args:t}),(0,n.jsx)("meshBasicMaterial",{map:e,toneMapped:!1})]})}let J=[[0,.16],[.12,.3],[.26,.44],[.4,.58]];function Y({i:e,progress:t,children:i}){let r=(0,l.useRef)(null);return(0,s.f)(()=>{let i=r.current;if(!i)return;let[n,s]=J[e],o=1-Math.pow(1-Math.min(1,Math.max(0,(t.current-n)/(s-n))),3);i.visible=o>.001,i.position.y=(1-o)*1.2,i.scale.setScalar(.7+.3*o)}),(0,n.jsx)("group",{ref:r,children:i})}function ee(){let e=1.79- -1.78,t=(1.79+-1.78)/2,i=5.67,r=-2.535+.3;return(0,n.jsxs)("group",{children:[(0,n.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[t,0,r],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[e,i]}),(0,n.jsx)("meshStandardMaterial",{color:"#e3dace",roughness:.5})]}),(0,n.jsxs)("mesh",{rotation:[Math.PI/2,0,0],position:[t,2.9,r],children:[(0,n.jsx)("planeGeometry",{args:[e,i]}),(0,n.jsx)("meshStandardMaterial",{color:"#f1e7d6",roughness:1})]}),(0,n.jsxs)("mesh",{position:[t,1.45,-5.07],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[e,2.9]}),(0,n.jsx)("meshStandardMaterial",{color:G,roughness:1})]}),(0,n.jsxs)("mesh",{position:[-1.78,1.45,r],rotation:[0,Math.PI/2,0],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[i,2.9]}),(0,n.jsx)("meshStandardMaterial",{color:G,roughness:1})]}),(0,n.jsxs)("mesh",{position:[1.79,1.45,r],rotation:[0,-Math.PI/2,0],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[i,2.9]}),(0,n.jsx)("meshStandardMaterial",{color:G,roughness:1})]})]})}function et(){return(0,n.jsxs)("group",{position:[.2,2.76,-3.45],children:[(0,n.jsxs)("mesh",{position:[0,.07,0],children:[(0,n.jsx)("cylinderGeometry",{args:[.02,.02,.14,8]}),(0,n.jsx)("meshStandardMaterial",{color:"#8d8a85"})]}),(0,n.jsxs)("mesh",{children:[(0,n.jsx)("cylinderGeometry",{args:[.09,.09,.06,20]}),(0,n.jsx)("meshStandardMaterial",{color:"#9a958d",metalness:.3,roughness:.5})]}),[0,2*Math.PI/3,4*Math.PI/3].map(e=>(0,n.jsxs)("mesh",{rotation:[0,e,0],position:[.42*Math.cos(e),0,-(.42*Math.sin(e))],children:[(0,n.jsx)("boxGeometry",{args:[.7,.01,.11]}),(0,n.jsx)("meshStandardMaterial",{color:"#a9a399",roughness:.6})]},e))]})}function ei({x:e,y:t,z:i}){let r=2.9-t;return(0,n.jsxs)("group",{position:[e,t,i],children:[(0,n.jsxs)("mesh",{position:[0,r/2,0],children:[(0,n.jsx)("cylinderGeometry",{args:[.004,.004,r,4]}),(0,n.jsx)("meshBasicMaterial",{color:"#b08a4a"})]}),(0,n.jsxs)("mesh",{children:[(0,n.jsx)("sphereGeometry",{args:[.085,20,14]}),(0,n.jsx)("meshStandardMaterial",{color:"#b5774a",transparent:!0,opacity:.85,roughness:.2,metalness:.2})]})]})}function en({tex:e}){let t=-5.07+.01,i=-1.77;return(0,n.jsxs)("group",{children:[(0,n.jsx)(Q,{size:[2.05,.03,1.85],position:[.17,2.88,-3.4],color:"#2b3350",edges:!1}),(0,n.jsx)(Q,{size:[2.25,.08,.1],position:[.17,2.86,-2.45],color:k,edges:!1}),(0,n.jsx)(Q,{size:[2.25,.08,.1],position:[.17,2.86,-4.35],color:k,edges:!1}),(0,n.jsx)(et,{}),[-1.26,.02,1.34].map(e=>(0,n.jsxs)("mesh",{position:[e,2.895,-4.67],rotation:[Math.PI/2,0,0],children:[(0,n.jsx)("circleGeometry",{args:[.06,24]}),(0,n.jsx)("meshBasicMaterial",{color:"#fffaf0",side:c.Vs})]},e)),(0,n.jsx)(ei,{x:-1.28,y:1.86,z:-4}),(0,n.jsx)(ei,{x:-1.04,y:1.96,z:-4}),(0,n.jsx)(Q,{size:[.93,.34,.22],position:[.2,2.57,-4.96],color:k}),(0,n.jsx)(X,{map:e.wallpaper,size:[.99,1.47],position:[-1.285,1.52,t]}),(0,n.jsx)(Q,{size:[.53,.64,.03],position:[-1.275,1.53,t+.015],color:"#1f1b18",edges:!1}),(0,n.jsx)(X,{map:e.printR,size:[.47,.58],position:[-1.275,1.53,t+.035]}),(0,n.jsx)(Q,{size:[1.96,1.53,.05],position:[.19,1.535,t+.02],color:N}),(0,n.jsx)(X,{map:e.blind,size:[1.8,1.43],position:[.19,1.535,t+.05]}),(0,n.jsx)(X,{map:e.leftPaper,size:[.9,1.5],position:[i,1.53,-4.63],rotation:[0,Math.PI/2,0]}),(0,n.jsx)(Q,{size:[.05,1.66,1.06],position:[i+.025,1.43,-3.67],color:N}),(0,n.jsx)(X,{map:e.leftBlind,size:[.92,1.5],position:[i+.055,1.43,-3.67],rotation:[0,Math.PI/2,0]})]})}function er({tex:e}){let t=1.78;return(0,n.jsxs)("group",{children:[(0,n.jsx)(Q,{size:[.6,.43,5.05],position:[-1.48,.215,-2.07],color:V}),(0,n.jsx)(Q,{size:[.62,.04,5.05],position:[-1.47,.45,-2.07],color:"#e9e3d9"}),(0,n.jsx)(Q,{size:[.5,.55,.47],position:[-1.53,.275,-4.83],color:V}),(0,n.jsx)(Q,{size:[.06,2.75,2],position:[t-.03,1.375,-4.05],color:N}),(0,n.jsx)(Q,{size:[.02,2.6,1.85],position:[t-.065,1.38,-4.05],color:"#efe6d7",edges:!1}),(0,n.jsx)(Q,{size:[.26,.04,1.2],position:[t-.2,.97,-4.1],color:N}),(0,n.jsx)(X,{map:e.leaf,size:[.83,1.23],position:[t-.08,1.59,-3.7],rotation:[0,-Math.PI/2,0]}),(0,n.jsxs)("group",{position:[0,0,-1.6],children:[(0,n.jsx)(X,{map:e.screen,size:[.41,1.375],position:[1.365,1.108,0]}),(0,n.jsx)(Q,{size:[.41,1.2,.05],position:[1.365,2.4,-.01],color:N,edges:!1}),(0,n.jsx)(Q,{size:[.41,.42,.05],position:[1.365,.21,-.01],color:N,edges:!1})]})]})}function es({x0:e,x1:t}){let i=t-e;return(0,n.jsxs)("group",{position:[(e+t)/2,0,-4.57],children:[(0,n.jsx)(Q,{size:[i,.08,.8],position:[0,.16,0],color:W}),(0,n.jsx)(Q,{size:[.07,.58,.8],position:[-i/2+.035,.37,0],color:W}),(0,n.jsx)(Q,{size:[.07,.58,.8],position:[i/2-.035,.37,0],color:W}),[-i/2+.035,i/2-.035].map(e=>[-.36,.36].map(t=>(0,n.jsx)(Q,{size:[.06,.16,.06],position:[e,.08,t],color:W,edges:!1},`${e}${t}`))),(0,n.jsx)(Q,{size:[i-.16,.16,.7],position:[0,.28,.03],color:q}),(0,n.jsx)(Q,{size:[i-.16,.44,.16],position:[0,.56,-.3],color:q}),(0,n.jsx)(Q,{size:[.4,.38,.12],position:[0,.58,-.16],rotation:[-.25,0,.6],color:"#6d7a20"})]})}function eo({tex:e}){return(0,n.jsxs)("group",{children:[(0,n.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[.25,.006,-3.37],children:[(0,n.jsx)("planeGeometry",{args:[2.72,1.53]}),(0,n.jsx)("meshBasicMaterial",{map:e.rug,toneMapped:!1})]}),(0,n.jsx)(Q,{size:[.9,.35,.7],position:[.26,.175,-3.07],color:W}),(0,n.jsx)(Q,{size:[.4,.01,.28],position:[.26,.355,-3.12],color:N,edges:!1}),(0,n.jsx)(Q,{size:[.1,.32,.32],position:[-1.3,.63,-3.35],rotation:[0,.6,-.2],color:"#c79a3a"}),(0,n.jsx)(Q,{size:[.1,.34,.34],position:[-1.38,.64,-2.75],rotation:[0,.6,-.2],color:"#dfe3e6"}),(0,n.jsxs)("mesh",{position:[-1.48,.65,-4.83],children:[(0,n.jsx)("sphereGeometry",{args:[.1,20,14]}),(0,n.jsx)("meshStandardMaterial",{color:"#2f6f73",roughness:.3})]})]})}function ea({progress:e,onReady:t}){let i,r=(i=(0,I.f)(K,e=>{for(let t of e)t.colorSpace=c.nj,t.anisotropy=4}),(0,l.useMemo)(()=>{let e={};return Z.forEach((t,n)=>e[t]=i[n]),e},[i]));return(0,l.useEffect)(()=>{t?.()},[t]),(0,n.jsxs)("group",{children:[(0,n.jsx)(ee,{}),(0,n.jsx)(Y,{i:0,progress:e,children:(0,n.jsx)(en,{tex:r})}),(0,n.jsx)(Y,{i:1,progress:e,children:(0,n.jsx)(er,{tex:r})}),(0,n.jsxs)(Y,{i:2,progress:e,children:[(0,n.jsx)(es,{x0:-1.06,x1:-.03}),(0,n.jsx)(es,{x0:.32,x1:1.32}),(0,n.jsx)(Q,{size:[.36,.5,.6],position:[.145,.25,-4.7],color:W})]}),(0,n.jsx)(Y,{i:3,progress:e,children:(0,n.jsx)(eo,{tex:r})})]})}function el({pointer:e}){let{invalidate:t}=(0,o.f)(),i=(0,l.useRef)({x:0,y:0});return(0,s.f)(({camera:n})=>{i.current.x+=(e.current.x-i.current.x)*.08,i.current.y+=(e.current.y-i.current.y)*.08,n.view&&-20===n.view.offsetX||n.setViewOffset(840,470,-20,-30,840,470),n.position.set(.4+.12*i.current.x,1.02-.06*i.current.y,0),n.lookAt(n.position.x,n.position.y,n.position.z-1),(Math.abs(e.current.x-i.current.x)>.001||Math.abs(e.current.y-i.current.y)>.001)&&t()}),null}e.s(["default",0,function({onReady:e,onLost:t,progress:i}){let s=(0,l.useRef)({x:0,y:0}),o=(0,l.useRef)(null);return(0,l.useEffect)(()=>{let e=o.current;if(!e)return;let t=t=>{let i=e.getBoundingClientRect();s.current.x=(t.clientX-i.left)/i.width*2-1,s.current.y=(t.clientY-i.top)/i.height*2-1,window.dispatchEvent(new Event("renofix-hero-pointer"))},i=()=>{s.current.x=0,s.current.y=0,window.dispatchEvent(new Event("renofix-hero-pointer"))};return e.addEventListener("pointermove",t),e.addEventListener("pointerleave",i),()=>{e.removeEventListener("pointermove",t),e.removeEventListener("pointerleave",i)}},[]),(0,n.jsx)("div",{ref:o,className:"absolute inset-0",children:(0,n.jsxs)(r.f,{frameloop:"demand",shadows:!0,dpr:[1,1.5],gl:{antialias:!0,preserveDrawingBuffer:!1},camera:{fov:46.5,near:.05,far:40,position:[.4,1.02,0]},onCreated:({gl:e,invalidate:i})=>{e.toneMapping=c.c2,e.toneMappingExposure=1.1;let n=()=>i();window.addEventListener("renofix-hero-pointer",n),e.domElement.addEventListener("webglcontextlost",()=>{window.removeEventListener("renofix-hero-pointer",n),t?.()},{once:!0})},"aria-hidden":"true",children:[(0,n.jsx)("color",{attach:"background",args:[G]}),(0,n.jsx)("hemisphereLight",{args:["#fff6e8","#cdbfa8",1.25]}),(0,n.jsx)("ambientLight",{intensity:.4}),(0,n.jsx)("directionalLight",{position:[1.5,2.8,.5],intensity:1.2,castShadow:!0,"shadow-mapSize":[1024,1024],"shadow-camera-left":-3,"shadow-camera-right":3,"shadow-camera-top":3,"shadow-camera-bottom":-3,"shadow-camera-far":10,"shadow-bias":-5e-4}),(0,n.jsx)("pointLight",{position:[.2,2.6,-3.4],intensity:3,distance:6,color:"#ffe2b8"}),(0,n.jsx)(el,{pointer:s}),(0,n.jsx)(l.Suspense,{fallback:null,children:(0,n.jsx)(ea,{progress:i,onReady:e})})]})})}],54075)},98072,function(e){e.n(e.i(54075))}]);