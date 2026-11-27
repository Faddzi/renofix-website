(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,54075,e=>{"use strict";let t,i;var n=e.i(43476),r=e.i(75056),s=e.i(38408),o=e.i(98903);function a(){return(a=Object.assign.bind()).apply(null,arguments)}var l=e.i(71645),d=e.i(90072),c=d,f=d;let u=new f.VQ,p=new f.cE;class h extends f.Kx{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new f.ki([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new f.ki([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new f.hC(t,6,1);return this.setAttribute("instanceStart",new f.Zq(i,3,0)),this.setAttribute("instanceEnd",new f.Zq(i,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let i;e instanceof Float32Array?i=e:Array.isArray(e)&&(i=new Float32Array(e));let n=new f.hC(i,2*t,1);return this.setAttribute("instanceColorStart",new f.Zq(n,t,0)),this.setAttribute("instanceColorEnd",new f.Zq(n,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new f.nw(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new f.VQ);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),u.setFromBufferAttribute(t),this.boundingBox.union(u))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new f.L0),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let r=0,s=e.count;r<s;r++)p.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(p)),p.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(p));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var m=d,v=e.i(8560);let x=parseInt(d.Tu.replace(/\D+/g,""));class y extends m.Zg{constructor(e){super({type:"LineMaterial",uniforms:m.SP.clone(m.SP.merge([v.O.common,v.O.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new m.wq(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
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
					#include <${x>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let g=x>=125?"uv1":"uv2",w=new c.$i,S=new c.cE,b=new c.cE,E=new c.$i,j=new c.$i,_=new c.$i,z=new c.cE,L=new c.nd,A=new c._i,M=new c.cE,U=new c.VQ,C=new c.L0,O=new c.$i;function B(e,t,n){return O.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),O.multiplyScalar(1/O.w),O.x=i/n.width,O.y=i/n.height,O.applyMatrix4(e.projectionMatrixInverse),O.multiplyScalar(1/O.w),Math.abs(Math.max(O.x,O.y))}class P extends c.kE{constructor(e=new h,t=new y({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let e=0,r=0,s=t.count;e<s;e++,r+=2)S.fromBufferAttribute(t,e),b.fromBufferAttribute(i,e),n[r]=0===r?0:n[r-1],n[r+1]=n[r]+S.distanceTo(b);let r=new c.hC(n,2,1);return e.setAttribute("instanceDistanceStart",new c.Zq(r,1,0)),e.setAttribute("instanceDistanceEnd",new c.Zq(r,1,1)),this}raycast(e,n){let r,s,o=this.material.worldUnits,a=e.camera;null!==a||o||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let l=void 0!==e.params.Line2&&e.params.Line2.threshold||0;t=e.ray;let d=this.matrixWorld,f=this.geometry,u=this.material;if(i=u.linewidth+l,null===f.boundingSphere&&f.computeBoundingSphere(),C.copy(f.boundingSphere).applyMatrix4(d),o)r=.5*i;else{let e=Math.max(a.near,C.distanceToPoint(t.origin));r=B(a,e,u.resolution)}if(C.radius+=r,!1!==t.intersectsSphere(C)){if(null===f.boundingBox&&f.computeBoundingBox(),U.copy(f.boundingBox).applyMatrix4(d),o)s=.5*i;else{let e=Math.max(a.near,U.distanceToPoint(t.origin));s=B(a,e,u.resolution)}U.expandByScalar(s),!1!==t.intersectsBox(U)&&(o?function(e,n){let r=e.matrixWorld,s=e.geometry,o=s.attributes.instanceStart,a=s.attributes.instanceEnd,l=Math.min(s.instanceCount,o.count);for(let s=0;s<l;s++){A.start.fromBufferAttribute(o,s),A.end.fromBufferAttribute(a,s),A.applyMatrix4(r);let l=new c.cE,d=new c.cE;t.distanceSqToSegment(A.start,A.end,d,l),d.distanceTo(l)<.5*i&&n.push({point:d,pointOnLine:l,distance:t.origin.distanceTo(d),object:e,face:null,faceIndex:s,uv:null,[g]:null})}}(this,n):function(e,n,r){let s=n.projectionMatrix,o=e.material.resolution,a=e.matrixWorld,l=e.geometry,d=l.attributes.instanceStart,f=l.attributes.instanceEnd,u=Math.min(l.instanceCount,d.count),p=-n.near;t.at(1,_),_.w=1,_.applyMatrix4(n.matrixWorldInverse),_.applyMatrix4(s),_.multiplyScalar(1/_.w),_.x*=o.x/2,_.y*=o.y/2,_.z=0,z.copy(_),L.multiplyMatrices(n.matrixWorldInverse,a);for(let n=0;n<u;n++){if(E.fromBufferAttribute(d,n),j.fromBufferAttribute(f,n),E.w=1,j.w=1,E.applyMatrix4(L),j.applyMatrix4(L),E.z>p&&j.z>p)continue;if(E.z>p){let e=E.z-j.z,t=(E.z-p)/e;E.lerp(j,t)}else if(j.z>p){let e=j.z-E.z,t=(j.z-p)/e;j.lerp(E,t)}E.applyMatrix4(s),j.applyMatrix4(s),E.multiplyScalar(1/E.w),j.multiplyScalar(1/j.w),E.x*=o.x/2,E.y*=o.y/2,j.x*=o.x/2,j.y*=o.y/2,A.start.copy(E),A.start.z=0,A.end.copy(j),A.end.z=0;let l=A.closestPointToPointParameter(z,!0);A.at(l,M);let u=c.rB.lerp(E.z,j.z,l),h=u>=-1&&u<=1,m=z.distanceTo(M)<.5*i;if(h&&m){A.start.fromBufferAttribute(d,n),A.end.fromBufferAttribute(f,n),A.start.applyMatrix4(a),A.end.applyMatrix4(a);let i=new c.cE,s=new c.cE;t.distanceSqToSegment(A.start,A.end,s,i),r.push({point:s,pointOnLine:i,distance:t.origin.distanceTo(s),object:e,face:null,faceIndex:n,uv:null,[g]:null})}}}(this,a,n))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(w),this.material.uniforms.resolution.value.set(w.z,w.w))}}class D extends h{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e,t=3){let i=e.length-t,n=new Float32Array(2*i);if(3===t)for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];else for(let r=0;r<i;r+=t)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5],n[2*r+6]=e[r+6],n[2*r+7]=e[r+7];return super.setColors(n,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class R extends P{constructor(e=new D,t=new y({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let T=l.forwardRef(function({points:e,color:t=0xffffff,vertexColors:i,linewidth:n,lineWidth:r,segments:o,dashed:c,...f},u){var p,m;let v=(0,s.f)(e=>e.size),x=l.useMemo(()=>o?new P:new R,[o]),[g]=l.useState(()=>new y),w=(null==i||null==(p=i[0])?void 0:p.length)===4?4:3,S=l.useMemo(()=>{let n=o?new h:new D,r=e.map(e=>{let t=Array.isArray(e);return e instanceof d.cE||e instanceof d.$i?[e.x,e.y,e.z]:e instanceof d.wq?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(n.setPositions(r.flat()),i){t=0xffffff;let e=i.map(e=>e instanceof d.Es?e.toArray():e);n.setColors(e.flat(),w)}return n},[e,o,i,w]);return l.useLayoutEffect(()=>{x.computeLineDistances()},[e,x]),l.useLayoutEffect(()=>{c?g.defines.USE_DASH="":delete g.defines.USE_DASH,g.needsUpdate=!0},[c,g]),l.useEffect(()=>()=>{S.dispose(),g.dispose()},[S]),l.createElement("primitive",a({object:x,ref:u},f),l.createElement("primitive",{object:S,attach:"geometry"}),l.createElement("primitive",a({object:g,attach:"material",color:t,vertexColors:!!i,resolution:[v.width,v.height],linewidth:null!=(m=null!=n?n:r)?m:1,dashed:c,transparent:4===w},f)))}),H=l.forwardRef(({threshold:e=15,geometry:t,...i},n)=>{let r=l.useRef(null);l.useImperativeHandle(n,()=>r.current,[]);let s=l.useMemo(()=>[0,0,0,1,0,0],[]),o=l.useRef(null),c=l.useRef(null);return l.useLayoutEffect(()=>{let i=r.current.parent,n=null!=t?t:null==i?void 0:i.geometry;if(!n||o.current===n&&c.current===e)return;o.current=n,c.current=e;let s=new d.nC(n,e).attributes.position.array;r.current.geometry.setPositions(s),r.current.geometry.attributes.instanceStart.needsUpdate=!0,r.current.geometry.attributes.instanceEnd.needsUpdate=!0,r.current.computeLineDistances()}),l.createElement(T,a({segments:!0,points:s,ref:r,raycast:()=>null},i))}),I="#efe9df",G="#b98a5e",N="#7f5536",W="#c9c6c0",V="#d9d6ce",q="#ddd6c9";function F({size:e,position:t,color:i,rotation:r,edges:s=!0}){return(0,n.jsxs)("mesh",{position:t,rotation:r,castShadow:!0,receiveShadow:!0,children:[(0,n.jsx)("boxGeometry",{args:e}),(0,n.jsx)("meshStandardMaterial",{color:i,roughness:.85,metalness:0}),s&&(0,n.jsx)(H,{color:"#6f655a",threshold:15})]})}function $({x:e}){return(0,n.jsxs)("group",{position:[e,0,-1.75],children:[(0,n.jsx)(F,{size:[1.2,.08,.8],position:[0,.22,0],color:G}),(0,n.jsx)(F,{size:[.06,.5,.8],position:[-.6,.35,0],color:G}),(0,n.jsx)(F,{size:[.06,.5,.8],position:[.6,.35,0],color:G}),(0,n.jsx)(F,{size:[1.12,.16,.74],position:[0,.34,.02],color:W}),(0,n.jsx)(F,{size:[1.12,.5,.18],position:[0,.62,-.3],color:W}),(0,n.jsx)(F,{size:[.42,.36,.12],position:[0,.6,-.16],rotation:[-.2,0,.08],color:"#7b8b3a"})]})}function k(){let e=(0,l.useMemo)(()=>Array.from({length:9},(e,t)=>-2.3+.32*t),[]);return(0,n.jsxs)("group",{position:[2.55,0,0],children:[e.map(e=>(0,n.jsx)(F,{size:[.07,2.9,.06],position:[0,1.45,e],color:G},e)),(0,n.jsx)(F,{size:[.1,.08,2.7],position:[0,2.86,-1.02],color:N}),[[2.15,-1.9],[1.55,-1.3],[.95,-1.55],[.45,-.75]].map(([e,t])=>(0,n.jsxs)("group",{position:[-.05,e,t],rotation:[0,Math.PI/2,0],children:[(0,n.jsxs)("mesh",{castShadow:!0,children:[(0,n.jsx)("torusGeometry",{args:[.27,.035,8,40]}),(0,n.jsx)("meshStandardMaterial",{color:N,roughness:.7})]}),(0,n.jsxs)("mesh",{position:[0,0,-.01],children:[(0,n.jsx)("circleGeometry",{args:[.25,40]}),(0,n.jsx)("meshStandardMaterial",{color:"#8fa7b8",roughness:.9,side:d.Vs})]})]},`${e}${t}`))]})}function Z(){return(0,n.jsxs)("group",{children:[(0,n.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[7,7]}),(0,n.jsx)("meshStandardMaterial",{color:"#e4ddd1",roughness:.6})]}),(0,n.jsxs)("mesh",{position:[0,3,0],rotation:[Math.PI/2,0,0],children:[(0,n.jsx)("planeGeometry",{args:[7,7]}),(0,n.jsx)("meshStandardMaterial",{color:"#f6f2ec",roughness:1})]}),(0,n.jsxs)("mesh",{position:[0,1.5,-2.6],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[7,3]}),(0,n.jsx)("meshStandardMaterial",{color:I,roughness:1})]}),(0,n.jsxs)("mesh",{position:[-2.7,1.5,0],rotation:[0,Math.PI/2,0],receiveShadow:!0,children:[(0,n.jsx)("planeGeometry",{args:[7,3]}),(0,n.jsx)("meshStandardMaterial",{color:I,roughness:1})]}),(0,n.jsxs)("mesh",{position:[2.8,1.5,0],rotation:[0,-Math.PI/2,0],children:[(0,n.jsx)("planeGeometry",{args:[7,3]}),(0,n.jsx)("meshStandardMaterial",{color:q,roughness:1})]}),(0,n.jsx)(F,{size:[2.2,.05,1.2],position:[0,2.97,-.8],color:"#4b5263",edges:!1}),[-1.2,1.2].map(e=>(0,n.jsxs)("mesh",{position:[e,2.98,-1.6],rotation:[Math.PI/2,0,0],children:[(0,n.jsx)("circleGeometry",{args:[.07,24]}),(0,n.jsx)("meshBasicMaterial",{color:"#fffaf0",side:d.Vs})]},e)),(0,n.jsx)(F,{size:[2.3,1.75,.08],position:[.3,1.7,-2.56],color:G}),(0,n.jsx)(F,{size:[2.1,1.55,.04],position:[.3,1.7,-2.5],color:"#a7ad95"}),(0,n.jsx)(F,{size:[.32,1.55,.05],position:[.42,1.7,-2.48],color:V}),[-.08,.92].map(e=>(0,n.jsx)(F,{size:[.05,1.55,.05],position:[e,1.7,-2.47],color:"#a8423a",edges:!1},e)),(0,n.jsx)(F,{size:[.06,1.7,1.2],position:[-2.64,1.75,-1.6],color:G}),(0,n.jsx)(F,{size:[.04,1.55,1.05],position:[-2.6,1.75,-1.6],color:V}),(0,n.jsx)(F,{size:[1.3,1.5,.05],position:[-1.4,1.8,-2.55],color:V}),(0,n.jsx)(F,{size:[.9,.28,.2],position:[.1,2.68,-2.48],color:"#f8f8f6"}),(0,n.jsx)($,{x:-.6}),(0,n.jsx)($,{x:.9}),(0,n.jsx)(F,{size:[.36,.42,.5],position:[.15,.21,-1.95],color:N}),(0,n.jsx)(F,{size:[1.1,.34,.8],position:[.1,.17,-.55],color:G}),(0,n.jsx)(F,{size:[2.6,.01,1.8],position:[.1,.005,-.7],color:"#c9c3b7",edges:!1}),(0,n.jsx)(F,{size:[.75,.42,2.6],position:[-2.25,.21,-.6],color:N}),(0,n.jsx)(F,{size:[.8,.05,2.65],position:[-2.23,.445,-.6],color:q}),(0,n.jsx)(k,{})]})}function K({pointer:e}){let{camera:t,invalidate:i}=(0,s.f)(),n=(0,l.useMemo)(()=>new d.cE(0,1.55,4.1),[]),r=(0,l.useMemo)(()=>new d.cE(.15,1.35,-1.2),[]),a=(0,l.useRef)({x:0,y:0});return(0,o.f)(()=>{a.current.x+=(e.current.x-a.current.x)*.08,a.current.y+=(e.current.y-a.current.y)*.08;let s=.12*a.current.x,o=.05*a.current.y,l=n.distanceTo(r);t.position.set(r.x+Math.sin(s)*l,n.y+o*l,r.z+Math.cos(s)*l),t.lookAt(r),(Math.abs(e.current.x-a.current.x)>.001||Math.abs(e.current.y-a.current.y)>.001)&&i()}),null}e.s(["default",0,function({onReady:e}){let t=(0,l.useRef)({x:0,y:0}),i=(0,l.useRef)(null);return(0,l.useEffect)(()=>{let e=i.current;if(!e)return;let n=i=>{let n=e.getBoundingClientRect();t.current.x=(i.clientX-n.left)/n.width*2-1,t.current.y=(i.clientY-n.top)/n.height*2-1,window.dispatchEvent(new Event("renofix-hero-pointer"))},r=()=>{t.current.x=0,t.current.y=0,window.dispatchEvent(new Event("renofix-hero-pointer"))};return e.addEventListener("pointermove",n),e.addEventListener("pointerleave",r),()=>{e.removeEventListener("pointermove",n),e.removeEventListener("pointerleave",r)}},[]),(0,n.jsx)("div",{ref:i,className:"absolute inset-0",children:(0,n.jsxs)(r.f,{frameloop:"demand",shadows:!0,dpr:[1,1.75],gl:{antialias:!0,preserveDrawingBuffer:!1},camera:{fov:42,near:.1,far:40,position:[0,1.55,4.1]},onCreated:({gl:t,invalidate:i})=>{t.toneMapping=d.c2,t.toneMappingExposure=1.05,window.addEventListener("renofix-hero-pointer",()=>i()),e?.()},"aria-hidden":"true",children:[(0,n.jsx)("color",{attach:"background",args:["#efe9df"]}),(0,n.jsx)("hemisphereLight",{args:["#fffaf2","#cbbfae",1.1]}),(0,n.jsx)("ambientLight",{intensity:.35}),(0,n.jsx)("directionalLight",{position:[2.5,5,3.5],intensity:1.6,castShadow:!0,"shadow-mapSize":[1024,1024],"shadow-camera-left":-4,"shadow-camera-right":4,"shadow-camera-top":4,"shadow-camera-bottom":-4,"shadow-bias":-5e-4}),(0,n.jsx)("pointLight",{position:[0,2.6,-.8],intensity:4,distance:6,color:"#ffe2b8"}),(0,n.jsx)(K,{pointer:t}),(0,n.jsx)(Z,{})]})})}],54075)},98072,function(e){e.n(e.i(54075))}]);